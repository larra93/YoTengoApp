import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys, type NeedFilters } from '@/lib/query-keys';

import {
  cancelNeed,
  completeNeed,
  createNeed,
  getNeedById,
  listCategories,
  listMyNeeds,
  listNearbyNeeds,
  listRecentNeeds,
  type CreateNeedInput,
} from './api';
import type { ViewerLocation } from './use-viewer-location';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: listCategories,
    staleTime: 10 * 60 * 1000,
  });
}

export function useExploreNeeds(filters: NeedFilters, location: ViewerLocation | null) {
  const hasLocation = Boolean(location);

  return useQuery({
    queryKey: hasLocation
      ? queryKeys.needs.nearby({
          ...filters,
          latitude: location?.latitude ?? 0,
          longitude: location?.longitude ?? 0,
        })
      : queryKeys.needs.recent(filters),
    queryFn: () =>
      hasLocation
        ? listNearbyNeeds({
            ...filters,
            latitude: location?.latitude as number,
            longitude: location?.longitude as number,
          })
        : listRecentNeeds(filters),
  });
}

export function useNeedDetail(needId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.needs.detail(needId ?? ''),
    queryFn: () => getNeedById(needId as string),
    enabled: Boolean(needId),
  });
}

export function useMyNeeds(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.needs.mine(userId ?? ''),
    queryFn: () => listMyNeeds(userId as string),
    enabled: Boolean(userId),
  });
}

export function useCompleteNeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (needId: string) => completeNeed(needId),
    onSuccess: async (need) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.needs.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.needs.detail(need.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.offers.all }),
      ]);
    },
  });
}

export function useCancelNeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (needId: string) => cancelNeed(needId),
    onSuccess: async (need) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.needs.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.needs.detail(need.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.offers.all }),
      ]);
    },
  });
}

export function useCreateNeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: CreateNeedInput }) =>
      createNeed(userId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.needs.all });
    },
  });
}
