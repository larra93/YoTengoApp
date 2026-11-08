drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own
on public.profiles for delete
to authenticated
using (id = (select auth.uid()));

drop policy if exists needs_insert_own on public.needs;
create policy needs_insert_own
on public.needs for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists needs_update_own on public.needs;
create policy needs_update_own
on public.needs for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists needs_delete_own on public.needs;
create policy needs_delete_own
on public.needs for delete
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists offers_select_participants on public.offers;
create policy offers_select_participants
on public.offers for select
to authenticated
using (
  supplier_id = (select auth.uid())
  or exists (
    select 1
    from public.needs n
    where n.id = offers.need_id
      and n.user_id = (select auth.uid())
  )
);

drop policy if exists offers_insert_supplier on public.offers;
create policy offers_insert_supplier
on public.offers for insert
to authenticated
with check (
  supplier_id = (select auth.uid())
  and exists (
    select 1
    from public.needs n
    where n.id = offers.need_id
      and n.status = 'open'
      and n.user_id <> (select auth.uid())
  )
);

drop policy if exists offers_update_own_pending on public.offers;
create policy offers_update_own_pending
on public.offers for update
to authenticated
using (supplier_id = (select auth.uid()) and status = 'pending')
with check (supplier_id = (select auth.uid()) and status = 'pending');

drop policy if exists offers_delete_own_pending on public.offers;
create policy offers_delete_own_pending
on public.offers for delete
to authenticated
using (supplier_id = (select auth.uid()) and status = 'pending');

drop policy if exists chat_messages_select_participants on public.chat_messages;
create policy chat_messages_select_participants
on public.chat_messages for select
to authenticated
using (
  public.can_access_chat(need_id, (select auth.uid()))
  and (
    sender_id = (select auth.uid())
    or receiver_id = (select auth.uid())
  )
);
