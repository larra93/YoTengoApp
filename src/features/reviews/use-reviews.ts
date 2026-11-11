import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';

import { createReview, listReviewsByNeed, listReviewsForUser, type CreateReviewInput } from './api';

export function useReviewsForUser(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.byUser(userId ?? ''),
    queryFn: () => listReviewsForUser(userId as string),
    enabled: Boolean(userId),
  });
}

export function useReviewsByNeed(needId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.byNeed(needId ?? ''),
    queryFn: () => listReviewsByNeed(needId as string),
    enabled: Boolean(needId),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) => createReview(input),
    onSuccess: async (review) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byNeed(review.need_id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byUser(review.reviewee_id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.needs.detail(review.need_id) }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['profile-stats'] }),
      ]);
    },
  });
}
