export type DealType = 'rent' | 'loan' | 'swap';

export type NeedStatus = 'open' | 'matched' | 'completed' | 'cancelled';

export type OfferStatus = 'pending' | 'accepted' | 'rejected';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  rating_avg: number;
  rating_count: number;
  location: string | null;
  neighborhood: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
}

export interface Need {
  id: string;
  user_id: string;
  category_id: number;
  title: string;
  description: string;
  deal_type: DealType;
  budget_or_offer_details: string | null;
  start_date: string;
  end_date: string | null;
  status: NeedStatus;
  reference_image_url: string | null;
  location: string | null;
  address_label: string | null;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  need_id: string;
  supplier_id: string;
  price_offered: number | null;
  swap_offered_details: string | null;
  conditions: string | null;
  item_photo_url: string | null;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  need_id: string;
  offer_id: string | null;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

export interface Review {
  id: string;
  need_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}
