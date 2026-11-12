import type { DealType } from '@/types';

export interface NeedFilters {
  categoryId?: number;
  dealType?: DealType;
}

export const queryKeys = {
  categories: ['categories'] as const,
  location: ['viewer-location'] as const,
  needs: {
    all: ['needs'] as const,
    nearby: (filters: NeedFilters & { latitude: number; longitude: number; viewerId?: string }) =>
      ['needs', 'nearby', filters] as const,
    recent: (filters: NeedFilters & { viewerId?: string }) => ['needs', 'recent', filters] as const,
    detail: (needId: string) => ['needs', 'detail', needId] as const,
    mine: (userId: string) => ['needs', 'mine', userId] as const,
    openByUser: (userId: string) => ['needs', 'open-by-user', userId] as const,
  },
  reviews: {
    byUser: (userId: string) => ['reviews', 'user', userId] as const,
    byNeed: (needId: string) => ['reviews', 'need', needId] as const,
  },
  offers: {
    all: ['offers'] as const,
    received: (userId: string) => ['offers', 'received', userId] as const,
    sent: (userId: string) => ['offers', 'sent', userId] as const,
    byNeed: (needId: string) => ['offers', 'need', needId] as const,
  },
  chat: {
    byNeed: (needId: string) => ['chat', needId] as const,
    access: (needId: string, userId: string) => ['chat', 'access', needId, userId] as const,
    recentIncoming: (userId: string) => ['chat', 'recent-incoming', userId] as const,
  },
};
