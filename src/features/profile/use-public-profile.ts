import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { PublicProfile } from '@/types';

const PUBLIC_PROFILE_SELECT = `id, full_name, avatar_url, rating_avg, rating_count, neighborhood, created_at`;

type PublicProfileRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'avatar_url' | 'rating_avg' | 'rating_count' | 'neighborhood' | 'created_at'
>;

export interface PublicProfileWithMeta extends PublicProfile {
  created_at: string;
}

export function usePublicProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', 'public', userId ?? ''],
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
    queryFn: async (): Promise<PublicProfileWithMeta | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select(PUBLIC_PROFILE_SELECT)
        .eq('id', userId as string)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data as PublicProfileRow | null;
    },
  });
}
