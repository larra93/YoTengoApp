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
    nearby: (filters: NeedFilters & { latitude: number; longitude: number }) =>
      ['needs', 'nearby', filters] as const,
    recent: (filters: NeedFilters) => ['needs', 'recent', filters] as const,
    detail: (needId: string) => ['needs', 'detail', needId] as const,
  },
};
