import type { Database } from './database.types';

type PublicTables = Database['public']['Tables'];

type WithLocationString<T extends { location: unknown }> = Omit<T, 'location'> & {
  location: string | null;
};

export type DealType = Database['public']['Enums']['deal_type'];

export type NeedStatus = Database['public']['Enums']['need_status'];

export type OfferStatus = Database['public']['Enums']['offer_status'];

export type Profile = WithLocationString<PublicTables['profiles']['Row']>;

export type Category = PublicTables['categories']['Row'];

export type Need = WithLocationString<PublicTables['needs']['Row']>;

export type Offer = PublicTables['offers']['Row'];

export type ChatMessage = PublicTables['chat_messages']['Row'];

export type Review = PublicTables['reviews']['Row'];
