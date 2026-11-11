import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { supabase } from '@/lib/supabase';
import type { Offer } from '@/types';

import {
  acceptOffer,
  createOffer,
  listOffersByNeed,
  listReceivedOffers,
  listSentOffers,
  rejectOffer,
  type CreateOfferInput,
} from './api';

export function useReceivedOffers(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.offers.received(userId ?? ''),
    queryFn: () => listReceivedOffers(userId as string),
    enabled: Boolean(userId),
  });
}

export function useSentOffers(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.offers.sent(userId ?? ''),
    queryFn: () => listSentOffers(userId as string),
    enabled: Boolean(userId),
  });
}

export function useNeedOffers(needId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.offers.byNeed(needId ?? ''),
    queryFn: () => listOffersByNeed(needId as string),
    enabled: Boolean(needId),
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOfferInput) => createOffer(input),
    onSuccess: async (offer) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.offers.sent(offer.supplier_id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.offers.byNeed(offer.need_id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.needs.detail(offer.need_id) }),
      ]);
    },
  });
}

function invalidateOfferRelatedQueries(queryClient: QueryClient, offer: Offer) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.offers.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.offers.byNeed(offer.need_id) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.needs.detail(offer.need_id) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.needs.all }),
  ]);
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => acceptOffer(offerId),
    onSuccess: async (offer) => {
      await invalidateOfferRelatedQueries(queryClient, offer);
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => rejectOffer(offerId),
    onSuccess: async (offer) => {
      await invalidateOfferRelatedQueries(queryClient, offer);
    },
  });
}

export function useOffersRealtime(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) {
      return;
    }

    const channel = supabase
      .channel(`offers:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'offers', filter: `supplier_id=eq.${userId}` },
        async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.offers.sent(userId) }),
            queryClient.invalidateQueries({ queryKey: queryKeys.needs.all }),
          ]);
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'offers' },
        async (payload) => {
          const needId =
            (payload.new as Offer | null)?.need_id ?? (payload.old as Offer | null)?.need_id;
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.offers.received(userId) }),
            needId
              ? queryClient.invalidateQueries({ queryKey: queryKeys.offers.byNeed(needId) })
              : Promise.resolve(),
            needId
              ? queryClient.invalidateQueries({ queryKey: queryKeys.needs.detail(needId) })
              : Promise.resolve(),
          ]);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);
}
