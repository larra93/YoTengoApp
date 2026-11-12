create extension if not exists pg_net;

create table if not exists public.push_tokens (
  token text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null default 'android' check (platform in ('android', 'ios')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists push_tokens_set_updated_at on public.push_tokens;
create trigger push_tokens_set_updated_at
before update on public.push_tokens
for each row execute function public.set_updated_at();

alter table public.push_tokens enable row level security;

revoke all on public.push_tokens from anon;
grant select, insert, update, delete on public.push_tokens to authenticated;

drop policy if exists push_tokens_select_own on public.push_tokens;
create policy push_tokens_select_own
on public.push_tokens for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists push_tokens_insert_own on public.push_tokens;
create policy push_tokens_insert_own
on public.push_tokens for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists push_tokens_update_own on public.push_tokens;
create policy push_tokens_update_own
on public.push_tokens for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists push_tokens_delete_own on public.push_tokens;
create policy push_tokens_delete_own
on public.push_tokens for delete
to authenticated
using (user_id = (select auth.uid()));

create or replace function public.notify_user(
  p_user_id uuid,
  p_title text,
  p_body text,
  p_data jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tokens text[];
begin
  select coalesce(array_agg(t.token), '{}')
  into v_tokens
  from public.push_tokens t
  where t.user_id = p_user_id;

  if coalesce(array_length(v_tokens, 1), 0) = 0 then
    return;
  end if;

  begin
    perform net.http_post(
      url := 'https://exp.host/--/api/v2/push/send',
      body := jsonb_build_object(
        'to', v_tokens,
        'title', p_title,
        'body', p_body,
        'sound', 'default',
        'priority', 'high',
        'data', p_data
      ),
      headers := '{"Content-Type": "application/json"}'::jsonb,
      timeout_milliseconds := 5000
    );
  exception
    when others then
      null;
  end;
end;
$$;

revoke all on function public.notify_user(uuid, text, text, jsonb) from public, anon;
grant execute on function public.notify_user(uuid, text, text, jsonb) to authenticated, service_role;

create or replace function public.notify_offer_received()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_need_title text;
  v_supplier_name text;
begin
  if new.status <> 'pending' then
    return new;
  end if;

  select n.user_id, n.title
  into v_owner_id, v_need_title
  from public.needs n
  where n.id = new.need_id;

  if v_owner_id is null or v_owner_id = new.supplier_id then
    return new;
  end if;

  select coalesce(nullif(p.full_name, ''), 'Un vecino')
  into v_supplier_name
  from public.profiles p
  where p.id = new.supplier_id;

  perform public.notify_user(
    v_owner_id,
    v_supplier_name || ' te envió una oferta',
    'Oferta para «' || v_need_title || '»: ' ||
      coalesce(nullif(new.swap_offered_details, ''), 'oferta de servicio'),
    jsonb_build_object('type', 'offer', 'offerId', new.id, 'needId', new.need_id)
  );

  return new;
end;
$$;

create or replace function public.notify_offer_accepted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_need_title text;
  v_owner_name text;
begin
  select n.user_id, n.title
  into v_owner_id, v_need_title
  from public.needs n
  where n.id = new.need_id;

  if v_owner_id is null then
    return new;
  end if;

  select coalesce(nullif(p.full_name, ''), 'Un vecino')
  into v_owner_name
  from public.profiles p
  where p.id = v_owner_id;

  perform public.notify_user(
    new.supplier_id,
    'Oferta aceptada',
    v_owner_name || ' aceptó tu oferta para «' || v_need_title || '»',
    jsonb_build_object('type', 'offer', 'offerId', new.id, 'needId', new.need_id)
  );

  return new;
end;
$$;

create or replace function public.notify_chat_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender_name text;
  v_body text;
begin
  select coalesce(nullif(p.full_name, ''), 'Un vecino')
  into v_sender_name
  from public.profiles p
  where p.id = new.sender_id;

  v_body := left(new.message, 100);
  if char_length(new.message) > 100 then
    v_body := v_body || '…';
  end if;

  perform public.notify_user(
    new.receiver_id,
    v_sender_name || ' te escribió',
    v_body,
    jsonb_build_object('type', 'chat', 'needId', new.need_id)
  );

  return new;
end;
$$;

revoke all on function public.notify_offer_received() from public, anon;
grant execute on function public.notify_offer_received() to authenticated, service_role;

revoke all on function public.notify_offer_accepted() from public, anon;
grant execute on function public.notify_offer_accepted() to authenticated, service_role;

revoke all on function public.notify_chat_message() from public, anon;
grant execute on function public.notify_chat_message() to authenticated, service_role;

drop trigger if exists offers_notify_received on public.offers;
create trigger offers_notify_received
after insert on public.offers
for each row execute function public.notify_offer_received();

drop trigger if exists offers_notify_accepted on public.offers;
create trigger offers_notify_accepted
after update on public.offers
for each row
when (old.status = 'pending' and new.status = 'accepted')
execute function public.notify_offer_accepted();

drop trigger if exists chat_messages_notify_receiver on public.chat_messages;
create trigger chat_messages_notify_receiver
after insert on public.chat_messages
for each row execute function public.notify_chat_message();
