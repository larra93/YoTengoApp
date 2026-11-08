create schema if not exists extensions;

create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

do $$
begin
  create type public.deal_type as enum ('rent', 'loan', 'swap');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.need_status as enum ('open', 'matched', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.offer_status as enum ('pending', 'accepted', 'rejected');
exception
  when duplicate_object then null;
end
$$;
