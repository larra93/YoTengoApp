create or replace function public.search_needs(
  p_query text,
  p_lat double precision default null,
  p_lng double precision default null,
  p_category_id smallint default null,
  p_deal_type public.deal_type default null,
  p_limit integer default 30
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
  distance_km double precision,
  latitude double precision,
  longitude double precision
)
language plpgsql
stable
security invoker
set search_path = public, extensions
as $$
declare
  v_term text;
  v_origin extensions.geography;
  v_limit integer;
begin
  v_term := nullif(lower(trim(p_query)), '');
  if v_term is null then
    return;
  end if;

  if p_lat is not null
    and p_lng is not null
    and p_lat >= -90
    and p_lat <= 90
    and p_lng >= -180
    and p_lng <= 180
  then
    v_origin := extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography;
  end if;

  v_limit := least(greatest(coalesce(p_limit, 30), 1), 50);

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
    case
      when v_origin is null or n.location is null then null
      else extensions.ST_Distance(n.location, v_origin) / 1000.0
    end,
    case when n.location is null then null else extensions.ST_Y(n.location::extensions.geometry) end,
    case when n.location is null then null else extensions.ST_X(n.location::extensions.geometry) end
  from public.needs n
  join public.categories c on c.id = n.category_id
  join public.profiles p on p.id = n.user_id
  where n.status = 'open'
    and n.user_id <> auth.uid()
    and (p_category_id is null or n.category_id = p_category_id)
    and (p_deal_type is null or n.deal_type = p_deal_type)
    and (
      position(v_term in lower(n.title)) > 0
      or position(v_term in lower(n.description)) > 0
    )
  order by n.created_at desc
  limit v_limit;
end;
$$;

revoke execute on function public.search_needs(
  text,
  double precision,
  double precision,
  smallint,
  public.deal_type,
  integer
) from public, anon;

grant execute on function public.search_needs(
  text,
  double precision,
  double precision,
  smallint,
  public.deal_type,
  integer
) to authenticated, service_role;
