import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { PublicProfile, ReviewWithRelations } from '@/types';

const PUBLIC_PROFILE_SELECT = 'id, full_name, avatar_url, rating_avg, rating_count, neighborhood';

const REVIEW_SELECT = `
  id, need_id, reviewer_id, reviewee_id, rating, comment, created_at,
  reviewer:profiles!reviews_reviewer_id_fkey(${PUBLIC_PROFILE_SELECT}),
  reviewee:profiles!reviews_reviewee_id_fkey(${PUBLIC_PROFILE_SELECT}),
  need:needs!reviews_need_id_fkey(id, title)
`;

type ReviewRow = Database['public']['Tables']['reviews']['Row'];
type PublicProfileRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'avatar_url' | 'rating_avg' | 'rating_count' | 'neighborhood'
>;
type ReviewRowWithRelations = ReviewRow & {
  reviewer: PublicProfileRow | null;
  reviewee: PublicProfileRow | null;
  need: { id: string; title: string } | null;
};

export interface CreateReviewInput {
  needId: string;
  rating: number;
  comment?: string;
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

function mapReviewRow(row: ReviewRowWithRelations): ReviewWithRelations {
  return {
    id: row.id,
    need_id: row.need_id,
    reviewer_id: row.reviewer_id,
    reviewee_id: row.reviewee_id,
    rating: row.rating,
    comment: row.comment,
    created_at: row.created_at,
    reviewer: toPublicProfile(row.reviewer),
    reviewee: toPublicProfile(row.reviewee),
    need: row.need,
  };
}

export async function listReviewsForUser(userId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ReviewRowWithRelations[]).map(mapReviewRow);
}

export async function listReviewsByNeed(needId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('need_id', needId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ReviewRowWithRelations[]).map(mapReviewRow);
}

export async function createReview(input: CreateReviewInput) {
  const { data, error } = await supabase.rpc('create_review', {
    p_need_id: input.needId,
    p_rating: input.rating,
    p_comment: input.comment || undefined,
  });

  if (error) {
    throw error;
  }

  return data;
}
