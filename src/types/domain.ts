import type { Category, ChatMessage, Need, Offer, Profile, Review } from './db';

export type PublicProfile = Pick<
  Profile,
  'id' | 'full_name' | 'avatar_url' | 'rating_avg' | 'rating_count' | 'neighborhood'
>;

export interface NeedWithRelations extends Need {
  category: Category | null;
  author: PublicProfile | null;
  offers_count?: number;
  distance_km?: number;
}

export interface OfferWithRelations extends Offer {
  supplier: PublicProfile | null;
  need?: Pick<
    Need,
    | 'id'
    | 'title'
    | 'status'
    | 'user_id'
    | 'deal_type'
    | 'start_date'
    | 'end_date'
    | 'reference_image_url'
  > & {
    category?: Category | null;
  };
}

export type OfferWithSupplier = OfferWithRelations;

export interface ChatMessageWithSender extends ChatMessage {
  sender: PublicProfile | null;
  need?: { id: string; title: string } | null;
}

export interface ReviewWithRelations extends Review {
  reviewer: PublicProfile | null;
  reviewee: PublicProfile | null;
  need?: { id: string; title: string } | null;
}

export interface ProfileStats {
  needs: number;
  offers: number;
  matches: number;
}
