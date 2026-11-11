import type { ImagePickerAsset } from 'expo-image-picker';

import { getImageExtension, imageAssetToArrayBuffer } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { Category, DealType, NeedWithRelations, PublicProfile } from '@/types';

import type { NeedFilters } from '@/lib/query-keys';

const NEED_SELECT = `
  id,
  user_id,
  title,
  description,
  category_id,
  deal_type,
  budget_or_offer_details,
  start_date,
  end_date,
  status,
  reference_image_url,
  location,
  address_label,
  created_at,
  updated_at,
  category:categories(id, name, slug, icon, sort_order),
  author:profiles!needs_user_id_fkey(id, full_name, avatar_url, rating_avg, rating_count, neighborhood)
`;

const PUBLIC_PROFILE_SELECT = 'id, full_name, avatar_url, rating_avg, rating_count, neighborhood';

type NearbyNeedRow = Database['public']['Functions']['nearby_needs']['Returns'][number];
type PublicProfileRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'avatar_url' | 'rating_avg' | 'rating_count' | 'neighborhood'
>;
type NeedRowWithRelations = Database['public']['Tables']['needs']['Row'] & {
  category: Category | null;
  author: PublicProfileRow | null;
};

export interface FeedOptions extends NeedFilters {
  limit?: number;
  radiusKm?: number;
}

export interface NearbyFeedOptions extends FeedOptions {
  latitude: number;
  longitude: number;
}

export interface CreateNeedInput {
  title: string;
  description: string;
  categoryId: number;
  dealType: DealType;
  startDate: string;
  endDate?: string;
  budget?: string;
  addressLabel?: string;
  imageAsset?: ImagePickerAsset | null;
  latitude?: number;
  longitude?: number;
}

function toPublicProfile(row: PublicProfileRow | null): PublicProfile | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    rating_avg: row.rating_avg,
    rating_count: row.rating_count,
    neighborhood: row.neighborhood,
  };
}

function mapNeedRow(row: NeedRowWithRelations): NeedWithRelations {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    category_id: row.category_id,
    deal_type: row.deal_type,
    budget_or_offer_details: row.budget_or_offer_details,
    start_date: row.start_date,
    end_date: row.end_date,
    status: row.status,
    reference_image_url: row.reference_image_url,
    location: row.location as string | null,
    address_label: row.address_label,
    created_at: row.created_at,
    updated_at: row.updated_at,
    category: row.category,
    author: toPublicProfile(row.author),
  };
}

function mapNearbyRow(row: NearbyNeedRow, profiles: Map<string, PublicProfileRow>) {
  const profile = profiles.get(row.user_id);
  const category: Category = {
    id: row.category_id,
    name: row.category_name,
    slug: row.category_slug,
    icon: row.category_icon,
    sort_order: row.category_id,
  };

  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    category_id: row.category_id,
    deal_type: row.deal_type,
    budget_or_offer_details: row.budget_or_offer_details,
    start_date: row.start_date,
    end_date: row.end_date,
    status: row.status,
    reference_image_url: row.reference_image_url,
    location: null,
    address_label: row.address_label,
    created_at: row.created_at,
    updated_at: row.updated_at,
    category,
    author: toPublicProfile(profile ?? null),
    distance_km: row.distance_km,
  } satisfies NeedWithRelations;
}

async function listPublicProfiles(ids: string[]) {
  if (ids.length === 0) {
    return new Map<string, PublicProfileRow>();
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(PUBLIC_PROFILE_SELECT)
    .in('id', ids);

  if (error) {
    throw error;
  }

  return new Map((data ?? []).map((profile) => [profile.id, profile]));
}

export async function listCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listRecentNeeds(options: FeedOptions = {}) {
  let query = supabase
    .from('needs')
    .select(NEED_SELECT)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 20);

  if (options.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  if (options.dealType) {
    query = query.eq('deal_type', options.dealType);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data as NeedRowWithRelations[]).map(mapNeedRow);
}

export async function listNearbyNeeds(options: NearbyFeedOptions) {
  const { data, error } = await supabase.rpc('nearby_needs', {
    p_lat: options.latitude,
    p_lng: options.longitude,
    p_radius_km: options.radiusKm ?? 5,
    p_category_id: options.categoryId,
    p_deal_type: options.dealType,
    p_limit: options.limit ?? 20,
    p_offset: 0,
  });

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const profiles = await listPublicProfiles([...new Set(rows.map((row) => row.user_id))]);

  return rows.map((row) => mapNearbyRow(row, profiles));
}

export async function getNeedById(needId: string) {
  const { data, error } = await supabase
    .from('needs')
    .select(NEED_SELECT)
    .eq('id', needId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const { count } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true })
    .eq('need_id', needId);

  return {
    ...mapNeedRow(data as NeedRowWithRelations),
    offers_count: count ?? 0,
  } satisfies NeedWithRelations;
}

export async function listMyNeeds(userId: string) {
  const { data, error } = await supabase
    .from('needs')
    .select(NEED_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = data as NeedRowWithRelations[];

  if (rows.length === 0) {
    return [];
  }

  const { data: offers, error: offersError } = await supabase
    .from('offers')
    .select('need_id')
    .in(
      'need_id',
      rows.map((row) => row.id),
    );

  if (offersError) {
    throw offersError;
  }

  const counts = new Map<string, number>();

  for (const offer of offers ?? []) {
    counts.set(offer.need_id, (counts.get(offer.need_id) ?? 0) + 1);
  }

  return rows.map(
    (row) =>
      ({
        ...mapNeedRow(row),
        offers_count: counts.get(row.id) ?? 0,
      }) satisfies NeedWithRelations,
  );
}

export async function completeNeed(needId: string) {
  const { data, error } = await supabase.rpc('complete_need', { p_need_id: needId });

  if (error) {
    throw error;
  }

  return data;
}

export async function cancelNeed(needId: string) {
  const { data, error } = await supabase.rpc('cancel_need', { p_need_id: needId });

  if (error) {
    throw error;
  }

  return data;
}

export async function setMyLocation(latitude: number, longitude: number) {
  const { error } = await supabase.rpc('set_my_location', {
    p_lat: latitude,
    p_lng: longitude,
  });

  if (error) {
    throw error;
  }
}

export async function uploadNeedImage(userId: string, asset: ImagePickerAsset) {
  const extension = getImageExtension(asset);
  const path = `${userId}/need-${Date.now()}.${extension}`;
  const bytes = await imageAssetToArrayBuffer(asset);

  const { error } = await supabase.storage.from('need-images').upload(path, bytes, {
    contentType: asset.mimeType ?? 'image/jpeg',
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('need-images').getPublicUrl(path);

  return data.publicUrl;
}

export async function createNeed(userId: string, input: CreateNeedInput) {
  const imageUrl = input.imageAsset ? await uploadNeedImage(userId, input.imageAsset) : null;

  const { data, error } = await supabase.rpc('create_need', {
    p_title: input.title,
    p_description: input.description,
    p_category_id: input.categoryId,
    p_deal_type: input.dealType,
    p_start_date: input.startDate,
    p_end_date: input.endDate || undefined,
    p_budget_or_offer_details: input.budget || undefined,
    p_reference_image_url: imageUrl ?? undefined,
    p_lat: input.latitude,
    p_lng: input.longitude,
    p_address_label: input.addressLabel || undefined,
  });

  if (error) {
    throw error;
  }

  return data;
}
