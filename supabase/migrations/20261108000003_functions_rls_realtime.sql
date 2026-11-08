create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists needs_set_updated_at on public.needs;
create trigger needs_set_updated_at
before update on public.needs
for each row execute function public.set_updated_at();

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at
before update on public.offers
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url',
    new.phone
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.refresh_profile_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_id uuid;
begin
  if tg_op = 'DELETE' then
    v_target_id := old.reviewee_id;
  elsif tg_op = 'UPDATE' then
    if old.reviewee_id is distinct from new.reviewee_id then
      update public.profiles p
      set
        rating_avg = coalesce(
          (select round(avg(r.rating)::numeric, 2) from public.reviews r where r.reviewee_id = old.reviewee_id),
          0
        ),
        rating_count = (select count(*) from public.reviews r where r.reviewee_id = old.reviewee_id)
      where p.id = old.reviewee_id;
    end if;

    v_target_id := new.reviewee_id;
  else
    v_target_id := new.reviewee_id;
  end if;

  update public.profiles p
  set
    rating_avg = coalesce(
      (select round(avg(r.rating)::numeric, 2) from public.reviews r where r.reviewee_id = v_target_id),
      0
    ),
    rating_count = (select count(*) from public.reviews r where r.reviewee_id = v_target_id)
  where p.id = v_target_id;

  return null;
end;
$$;

drop trigger if exists reviews_refresh_profile_rating on public.reviews;
create trigger reviews_refresh_profile_rating
after insert or update or delete on public.reviews
for each row execute function public.refresh_profile_rating();

create or replace function public.can_access_chat(p_need_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.offers o
    join public.needs n on n.id = o.need_id
    where o.need_id = p_need_id
      and o.status = 'accepted'
      and (n.user_id = p_user_id or o.supplier_id = p_user_id)
  );
$$;

create or replace function public.set_my_location(p_lat double precision, p_lng double precision)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if auth.uid() is null then
    raise exception 'No autenticado' using errcode = '28000';
  end if;

  if p_lat is null
    or p_lng is null
    or p_lat < -90
    or p_lat > 90
    or p_lng < -180
    or p_lng > 180
  then
    raise exception 'Coordenadas invalidas' using errcode = '22023';
  end if;

  update public.profiles
  set
    location = extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography,
    updated_at = now()
  where id = auth.uid();

  if not found then
    raise exception 'Perfil no encontrado' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.create_need(
  p_title text,
  p_description text,
  p_category_id smallint,
  p_deal_type public.deal_type,
  p_start_date date,
  p_budget_or_offer_details text default null,
  p_end_date date default null,
  p_reference_image_url text default null,
  p_lat double precision default null,
  p_lng double precision default null,
  p_address_label text default null
)
returns public.needs
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  v_need public.needs%rowtype;
  v_location extensions.geography;
begin
  if auth.uid() is null then
    raise exception 'No autenticado' using errcode = '28000';
  end if;

  if (p_lat is null) <> (p_lng is null) then
    raise exception 'Debes enviar latitud y longitud juntas' using errcode = '22023';
  end if;

  if p_lat is not null and (p_lat < -90 or p_lat > 90 or p_lng < -180 or p_lng > 180) then
    raise exception 'Coordenadas invalidas' using errcode = '22023';
  end if;

  if p_lat is not null then
    v_location := extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography;
  end if;

  insert into public.needs (
    user_id,
    title,
    description,
    category_id,
    deal_type,
    budget_or_offer_details,
    start_date,
    end_date,
    reference_image_url,
    location,
    address_label
  )
  values (
    auth.uid(),
    p_title,
    p_description,
    p_category_id,
    p_deal_type,
    p_budget_or_offer_details,
    p_start_date,
    p_end_date,
    p_reference_image_url,
    v_location,
    p_address_label
  )
  returning * into v_need;

  return v_need;
end;
$$;

create or replace function public.nearby_needs(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision default 10,
  p_category_id smallint default null,
  p_deal_type public.deal_type default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id uuid,
  user_id uuid,
  title text,
  description text,
  category_id smallint,
  category_name text,
  category_slug text,
  category_icon text,
  deal_type public.deal_type,
  budget_or_offer_details text,
  start_date date,
  end_date date,
  status public.need_status,
  reference_image_url text,
  address_label text,
  created_at timestamptz,
  updated_at timestamptz,
  author_name text,
  author_avatar_url text,
  distance_km double precision
)
language plpgsql
stable
security invoker
set search_path = public, extensions
as $$
declare
  v_origin extensions.geography;
  v_radius_meters double precision;
  v_limit integer;
  v_offset integer;
begin
  if p_lat is null
    or p_lng is null
    or p_lat < -90
    or p_lat > 90
    or p_lng < -180
    or p_lng > 180
  then
    raise exception 'Coordenadas invalidas' using errcode = '22023';
  end if;

  v_origin := extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography;
  v_radius_meters := greatest(coalesce(p_radius_km, 10), 0.1) * 1000;
  v_limit := least(greatest(coalesce(p_limit, 20), 1), 50);
  v_offset := greatest(coalesce(p_offset, 0), 0);

  return query
  select
    n.id,
    n.user_id,
    n.title,
    n.description,
    n.category_id,
    c.name,
    c.slug,
    c.icon,
    n.deal_type,
    n.budget_or_offer_details,
    n.start_date,
    n.end_date,
    n.status,
    n.reference_image_url,
    n.address_label,
    n.created_at,
    n.updated_at,
    p.full_name,
    p.avatar_url,
    extensions.ST_Distance(n.location, v_origin) / 1000.0
  from public.needs n
  join public.categories c on c.id = n.category_id
  join public.profiles p on p.id = n.user_id
  where n.status = 'open'
    and n.location is not null
    and extensions.ST_DWithin(n.location, v_origin, v_radius_meters)
    and (p_category_id is null or n.category_id = p_category_id)
    and (p_deal_type is null or n.deal_type = p_deal_type)
  order by extensions.ST_Distance(n.location, v_origin), n.created_at desc
  limit v_limit
  offset v_offset;
end;
$$;

create or replace function public.accept_offer(p_offer_id uuid)
returns public.offers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer public.offers%rowtype;
  v_need public.needs%rowtype;
begin
  if auth.uid() is null then
    raise exception 'No autenticado' using errcode = '28000';
  end if;

  select * into v_offer from public.offers where id = p_offer_id for update;
  if not found then
    raise exception 'Oferta no encontrada' using errcode = 'P0002';
  end if;

  select * into v_need from public.needs where id = v_offer.need_id for update;
  if not found then
    raise exception 'Necesidad no encontrada' using errcode = 'P0002';
  end if;

  if v_need.user_id <> auth.uid() then
    raise exception 'Solo el dueno de la necesidad puede aceptar ofertas' using errcode = '42501';
  end if;

  if v_offer.status <> 'pending' then
    raise exception 'La oferta no esta pendiente' using errcode = '22023';
  end if;

  if v_need.status <> 'open' then
    raise exception 'La necesidad no esta abierta' using errcode = '22023';
  end if;

  update public.offers
  set status = 'accepted', updated_at = now()
  where id = v_offer.id
  returning * into v_offer;

  update public.offers
  set status = 'rejected', updated_at = now()
  where need_id = v_offer.need_id
    and id <> v_offer.id
    and status = 'pending';

  update public.needs
  set status = 'matched', updated_at = now()
  where id = v_offer.need_id;

  return v_offer;
end;
$$;

create or replace function public.reject_offer(p_offer_id uuid)
returns public.offers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer public.offers%rowtype;
  v_owner_id uuid;
begin
  if auth.uid() is null then
    raise exception 'No autenticado' using errcode = '28000';
  end if;

  select * into v_offer from public.offers where id = p_offer_id for update;
  if not found then
    raise exception 'Oferta no encontrada' using errcode = 'P0002';
  end if;

  select user_id into v_owner_id from public.needs where id = v_offer.need_id;

  if v_owner_id <> auth.uid() then
    raise exception 'Solo el dueno de la necesidad puede rechazar ofertas' using errcode = '42501';
  end if;

  if v_offer.status <> 'pending' then
    raise exception 'La oferta no esta pendiente' using errcode = '22023';
  end if;

  update public.offers
  set status = 'rejected', updated_at = now()
  where id = v_offer.id
  returning * into v_offer;

  return v_offer;
end;
$$;

create or replace function public.cancel_need(p_need_id uuid)
returns public.needs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_need public.needs%rowtype;
begin
  if auth.uid() is null then
    raise exception 'No autenticado' using errcode = '28000';
  end if;

  select * into v_need from public.needs where id = p_need_id for update;
  if not found then
    raise exception 'Necesidad no encontrada' using errcode = 'P0002';
  end if;

  if v_need.user_id <> auth.uid() then
    raise exception 'Solo el dueno puede cancelar la necesidad' using errcode = '42501';
  end if;

  if v_need.status not in ('open', 'matched') then
    raise exception 'La necesidad no se puede cancelar en su estado actual' using errcode = '22023';
  end if;

  update public.needs
  set status = 'cancelled', updated_at = now()
  where id = v_need.id
  returning * into v_need;

  update public.offers
  set status = 'rejected', updated_at = now()
  where need_id = v_need.id
    and status = 'pending';

  return v_need;
end;
$$;

create or replace function public.complete_need(p_need_id uuid)
returns public.needs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_need public.needs%rowtype;
begin
  if auth.uid() is null then
    raise exception 'No autenticado' using errcode = '28000';
  end if;

  select * into v_need from public.needs where id = p_need_id for update;
  if not found then
    raise exception 'Necesidad no encontrada' using errcode = 'P0002';
  end if;

  if v_need.user_id <> auth.uid() then
    raise exception 'Solo el dueno puede completar la necesidad' using errcode = '42501';
  end if;

  if v_need.status <> 'matched' then
    raise exception 'Solo se puede completar una necesidad con oferta aceptada' using errcode = '22023';
  end if;

  update public.needs
  set status = 'completed', updated_at = now()
  where id = v_need.id
  returning * into v_need;

  return v_need;
end;
$$;

create or replace function public.send_message(p_need_id uuid, p_body text)
returns public.chat_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_offer_id uuid;
  v_supplier_id uuid;
  v_receiver_id uuid;
  v_message public.chat_messages%rowtype;
begin
  if auth.uid() is null then
    raise exception 'No autenticado' using errcode = '28000';
  end if;

  if p_body is null or char_length(trim(p_body)) = 0 then
    raise exception 'El mensaje no puede estar vacio' using errcode = '22023';
  end if;

  select n.user_id, o.id, o.supplier_id
  into v_owner_id, v_offer_id, v_supplier_id
  from public.needs n
  join public.offers o on o.need_id = n.id
  where n.id = p_need_id
    and o.status = 'accepted'
  limit 1;

  if not found then
    raise exception 'No hay una oferta aceptada para esta necesidad' using errcode = 'P0002';
  end if;

  if auth.uid() = v_owner_id then
    v_receiver_id := v_supplier_id;
  elsif auth.uid() = v_supplier_id then
    v_receiver_id := v_owner_id;
  else
    raise exception 'No participas en esta conversacion' using errcode = '42501';
  end if;

  insert into public.chat_messages (need_id, offer_id, sender_id, receiver_id, message)
  values (p_need_id, v_offer_id, auth.uid(), v_receiver_id, p_body)
  returning * into v_message;

  return v_message;
end;
$$;

create or replace function public.create_review(
  p_need_id uuid,
  p_rating smallint,
  p_comment text default null
)
returns public.reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  v_need public.needs%rowtype;
  v_supplier_id uuid;
  v_reviewee_id uuid;
  v_review public.reviews%rowtype;
begin
  if auth.uid() is null then
    raise exception 'No autenticado' using errcode = '28000';
  end if;

  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'La calificacion debe estar entre 1 y 5' using errcode = '22023';
  end if;

  if p_comment is not null and char_length(p_comment) > 500 then
    raise exception 'El comentario no puede superar los 500 caracteres' using errcode = '22023';
  end if;

  select * into v_need from public.needs where id = p_need_id;
  if not found then
    raise exception 'Necesidad no encontrada' using errcode = 'P0002';
  end if;

  if v_need.status <> 'completed' then
    raise exception 'Solo se puede evaluar una necesidad completada' using errcode = '22023';
  end if;

  select supplier_id into v_supplier_id
  from public.offers
  where need_id = p_need_id
    and status = 'accepted'
  limit 1;

  if not found then
    raise exception 'No hay una oferta aceptada para esta necesidad' using errcode = 'P0002';
  end if;

  if auth.uid() = v_need.user_id then
    v_reviewee_id := v_supplier_id;
  elsif auth.uid() = v_supplier_id then
    v_reviewee_id := v_need.user_id;
  else
    raise exception 'No participas en esta necesidad' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.reviews
    where need_id = p_need_id
      and reviewer_id = auth.uid()
      and reviewee_id = v_reviewee_id
  ) then
    raise exception 'Ya evaluaste a esta persona en esta necesidad' using errcode = '23505';
  end if;

  insert into public.reviews (need_id, reviewer_id, reviewee_id, rating, comment)
  values (p_need_id, auth.uid(), v_reviewee_id, p_rating, p_comment)
  returning * into v_review;

  return v_review;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.refresh_profile_rating() from public, anon, authenticated;
revoke execute on function public.can_access_chat(uuid, uuid) from public, anon;
grant execute on function public.can_access_chat(uuid, uuid) to authenticated, service_role;

revoke execute on function public.set_my_location(double precision, double precision) from public, anon;
grant execute on function public.set_my_location(double precision, double precision) to authenticated, service_role;

revoke execute on function public.create_need(
  text,
  text,
  smallint,
  public.deal_type,
  date,
  text,
  date,
  text,
  double precision,
  double precision,
  text
) from public, anon;
grant execute on function public.create_need(
  text,
  text,
  smallint,
  public.deal_type,
  date,
  text,
  date,
  text,
  double precision,
  double precision,
  text
) to authenticated, service_role;

revoke execute on function public.nearby_needs(
  double precision,
  double precision,
  double precision,
  smallint,
  public.deal_type,
  integer,
  integer
) from public, anon;
grant execute on function public.nearby_needs(
  double precision,
  double precision,
  double precision,
  smallint,
  public.deal_type,
  integer,
  integer
) to authenticated, service_role;

revoke execute on function public.accept_offer(uuid) from public, anon;
grant execute on function public.accept_offer(uuid) to authenticated, service_role;

revoke execute on function public.reject_offer(uuid) from public, anon;
grant execute on function public.reject_offer(uuid) to authenticated, service_role;

revoke execute on function public.cancel_need(uuid) from public, anon;
grant execute on function public.cancel_need(uuid) to authenticated, service_role;

revoke execute on function public.complete_need(uuid) from public, anon;
grant execute on function public.complete_need(uuid) to authenticated, service_role;

revoke execute on function public.send_message(uuid, text) from public, anon;
grant execute on function public.send_message(uuid, text) to authenticated, service_role;

revoke execute on function public.create_review(uuid, smallint, text) from public, anon;
grant execute on function public.create_review(uuid, smallint, text) to authenticated, service_role;

alter table public.profiles enable row level security;

drop policy if exists profiles_select_authenticated on public.profiles;
create policy profiles_select_authenticated
on public.profiles for select
to authenticated
using (true);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own
on public.profiles for delete
to authenticated
using (id = auth.uid());

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, full_name, avatar_url, phone, neighborhood) on public.profiles to authenticated;
grant update (full_name, avatar_url, phone, neighborhood) on public.profiles to authenticated;
grant delete on public.profiles to authenticated;

alter table public.categories enable row level security;

drop policy if exists categories_select_public on public.categories;
create policy categories_select_public
on public.categories for select
to anon, authenticated
using (true);

revoke all on public.categories from anon, authenticated;
grant select on public.categories to anon, authenticated;

alter table public.needs enable row level security;

drop policy if exists needs_select_authenticated on public.needs;
create policy needs_select_authenticated
on public.needs for select
to authenticated
using (true);

drop policy if exists needs_insert_own on public.needs;
create policy needs_insert_own
on public.needs for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists needs_update_own on public.needs;
create policy needs_update_own
on public.needs for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists needs_delete_own on public.needs;
create policy needs_delete_own
on public.needs for delete
to authenticated
using (user_id = auth.uid());

revoke all on public.needs from anon, authenticated;
grant select on public.needs to authenticated;
grant insert (
  user_id,
  title,
  description,
  category_id,
  deal_type,
  budget_or_offer_details,
  start_date,
  end_date,
  reference_image_url,
  location,
  address_label
) on public.needs to authenticated;
grant update (
  title,
  description,
  category_id,
  deal_type,
  budget_or_offer_details,
  start_date,
  end_date,
  reference_image_url,
  location,
  address_label
) on public.needs to authenticated;
grant delete on public.needs to authenticated;

alter table public.offers enable row level security;

drop policy if exists offers_select_participants on public.offers;
create policy offers_select_participants
on public.offers for select
to authenticated
using (
  supplier_id = auth.uid()
  or exists (
    select 1
    from public.needs n
    where n.id = offers.need_id
      and n.user_id = auth.uid()
  )
);

drop policy if exists offers_insert_supplier on public.offers;
create policy offers_insert_supplier
on public.offers for insert
to authenticated
with check (
  supplier_id = auth.uid()
  and exists (
    select 1
    from public.needs n
    where n.id = offers.need_id
      and n.status = 'open'
      and n.user_id <> auth.uid()
  )
);

drop policy if exists offers_update_own_pending on public.offers;
create policy offers_update_own_pending
on public.offers for update
to authenticated
using (supplier_id = auth.uid() and status = 'pending')
with check (supplier_id = auth.uid() and status = 'pending');

drop policy if exists offers_delete_own_pending on public.offers;
create policy offers_delete_own_pending
on public.offers for delete
to authenticated
using (supplier_id = auth.uid() and status = 'pending');

revoke all on public.offers from anon, authenticated;
grant select on public.offers to authenticated;
grant insert (
  need_id,
  supplier_id,
  price_offered,
  swap_offered_details,
  conditions,
  item_photo_url
) on public.offers to authenticated;
grant update (
  price_offered,
  swap_offered_details,
  conditions,
  item_photo_url
) on public.offers to authenticated;
grant delete on public.offers to authenticated;

alter table public.chat_messages enable row level security;

drop policy if exists chat_messages_select_participants on public.chat_messages;
create policy chat_messages_select_participants
on public.chat_messages for select
to authenticated
using (
  public.can_access_chat(need_id, auth.uid())
  and (sender_id = auth.uid() or receiver_id = auth.uid())
);

revoke all on public.chat_messages from anon, authenticated;
grant select on public.chat_messages to authenticated;

alter table public.reviews enable row level security;

drop policy if exists reviews_select_authenticated on public.reviews;
create policy reviews_select_authenticated
on public.reviews for select
to authenticated
using (true);

revoke all on public.reviews from anon, authenticated;
grant select on public.reviews to authenticated;

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    execute 'create publication supabase_realtime';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'offers'
  ) then
    execute 'alter publication supabase_realtime add table public.offers';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_messages'
  ) then
    execute 'alter publication supabase_realtime add table public.chat_messages';
  end if;
end
$$;

alter table public.offers replica identity full;
alter table public.chat_messages replica identity full;
