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
    and n.user_id <> auth.uid()
    and n.location is not null
    and extensions.ST_DWithin(n.location, v_origin, v_radius_meters)
    and (p_category_id is null or n.category_id = p_category_id)
    and (p_deal_type is null or n.deal_type = p_deal_type)
  order by extensions.ST_Distance(n.location, v_origin), n.created_at desc
  limit v_limit
  offset v_offset;
end;
$$;
