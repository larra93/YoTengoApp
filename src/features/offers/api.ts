import type { ImagePickerAsset } from 'expo-image-picker';

import { getImageExtension, imageAssetToArrayBuffer } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { Category, OfferWithRelations, PublicProfile } from '@/types';

const PUBLIC_PROFILE_SELECT = 'id, full_name, avatar_url, rating_avg, rating_count, neighborhood';

const OFFER_SELECT = `
  id,
  need_id,
  supplier_id,
  price_offered,
  swap_offered_details,
  conditions,
  item_photo_url,
  status,
  created_at,
  updated_at,
  supplier:profiles!offers_supplier_id_fkey(${PUBLIC_PROFILE_SELECT}),
  need:needs!offers_need_id_fkey(
    id, title, status, user_id, deal_type, reference_image_url,
    category:categories(id, name, slug, icon, sort_order)
  )
`;

type OfferRow = Database['public']['Tables']['offers']['Row'];
type PublicProfileRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'avatar_url' | 'rating_avg' | 'rating_count' | 'neighborhood'
>;
type OfferRowWithRelations = OfferRow & {
  supplier: PublicProfileRow | null;
  need:
    | (Pick<
        Database['public']['Tables']['needs']['Row'],
        'id' | 'title' | 'status' | 'user_id' | 'deal_type' | 'reference_image_url'
      > & { category: Category | null })
    | null;
};

export interface CreateOfferInput {
  needId: string;
  supplierId: string;
  priceOffered?: number | null;
  swapOfferedDetails?: string;
  conditions?: string;
  imageAsset?: ImagePickerAsset | null;
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

function mapOfferRow(row: OfferRowWithRelations): OfferWithRelations {
  return {
    id: row.id,
    need_id: row.need_id,
    supplier_id: row.supplier_id,
    price_offered: row.price_offered,
    swap_offered_details: row.swap_offered_details,
    conditions: row.conditions,
    item_photo_url: row.item_photo_url,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    supplier: toPublicProfile(row.supplier),
    need: row.need ?? undefined,
  };
}

export async function uploadOfferImage(userId: string, asset: ImagePickerAsset) {
  const extension = getImageExtension(asset);
  const path = `${userId}/offer-${Date.now()}.${extension}`;
  const bytes = await imageAssetToArrayBuffer(asset);

  const { error } = await supabase.storage.from('offer-images').upload(path, bytes, {
    contentType: asset.mimeType ?? 'image/jpeg',
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('offer-images').getPublicUrl(path);

  return data.publicUrl;
}

export async function createOffer(input: CreateOfferInput) {
  const itemPhotoUrl = input.imageAsset
    ? await uploadOfferImage(input.supplierId, input.imageAsset)
    : null;

  const { data, error } = await supabase
    .from('offers')
    .insert({
      need_id: input.needId,
      supplier_id: input.supplierId,
      price_offered: input.priceOffered ?? null,
      swap_offered_details: input.swapOfferedDetails || null,
      conditions: input.conditions || null,
      item_photo_url: itemPhotoUrl,
    })
    .select(OFFER_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapOfferRow(data as OfferRowWithRelations);
}

export async function listReceivedOffers(userId: string) {
  const { data: needs, error: needsError } = await supabase
    .from('needs')
    .select('id')
    .eq('user_id', userId);

  if (needsError) {
    throw needsError;
  }

  const needIds = (needs ?? []).map((need) => need.id);

  if (needIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .in('need_id', needIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as OfferRowWithRelations[]).map(mapOfferRow);
}

export async function listSentOffers(userId: string) {
  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .eq('supplier_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as OfferRowWithRelations[]).map(mapOfferRow);
}

export async function listOffersByNeed(needId: string) {
  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .eq('need_id', needId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as OfferRowWithRelations[]).map(mapOfferRow);
}

export async function acceptOffer(offerId: string) {
  const { data, error } = await supabase.rpc('accept_offer', { p_offer_id: offerId });

  if (error) {
    throw error;
  }

  return data;
}

export async function rejectOffer(offerId: string) {
  const { data, error } = await supabase.rpc('reject_offer', { p_offer_id: offerId });

  if (error) {
    throw error;
  }

  return data;
}
