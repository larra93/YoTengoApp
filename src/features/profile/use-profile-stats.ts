import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export function useProfileStats(userId?: string) {
  return useQuery({
    queryKey: ['profile-stats', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const [needsResult, offersResult, ownerMatchesResult, supplierMatchesResult] =
        await Promise.all([
          supabase
            .from('needs')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId as string),
          supabase
            .from('offers')
            .select('id', { count: 'exact', head: true })
            .eq('supplier_id', userId as string),
          supabase
            .from('needs')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId as string)
            .in('status', ['matched', 'completed']),
          supabase
            .from('offers')
            .select('id', { count: 'exact', head: true })
            .eq('supplier_id', userId as string)
            .eq('status', 'accepted'),
        ]);

      const error =
        needsResult.error ??
        offersResult.error ??
        ownerMatchesResult.error ??
        supplierMatchesResult.error;

      if (error) {
        throw error;
      }

      return {
        needs: needsResult.count ?? 0,
        offers: offersResult.count ?? 0,
        matches: (ownerMatchesResult.count ?? 0) + (supplierMatchesResult.count ?? 0),
      };
    },
  });
}
