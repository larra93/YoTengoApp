import type { Category, ChatMessage, Need, Offer, Profile } from './db';

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
  need?: Pick<Need, 'id' | 'title' | 'status' | 'user_id' | 'deal_type' | 'reference_image_url'> & {
    category?: Category | null;
  };
}

export type OfferWithSupplier = OfferWithRelations;

export interface ChatMessageWithSender extends ChatMessage {
  sender: PublicProfile | null;
}

export interface ProfileStats {
  needs: number;
  offers: number;
  matches: number;
}
