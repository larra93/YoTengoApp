import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

import { getProfile, signOut as signOutRequest } from './api';

export const profileQueryKey = (userId?: string) => ['profile', userId] as const;

interface AuthContextValue {
  session: Session | null;
  user: Session['user'] | null;
  profile: Profile | null;
  isLoading: boolean;
  profileError: Error | null;
  refreshProfile: () => Promise<Profile | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isActive) {
        return;
      }

      setSession(data.session);
      setIsAuthLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) {
        return;
      }

      setSession(nextSession);
      setIsAuthLoading(false);

      if (!nextSession) {
        queryClient.clear();
      }
    });

    return () => {
      isActive = false;
      subscription.subscription.unsubscribe();
    };
  }, [queryClient]);

  const userId = session?.user.id;
  const profileQuery = useQuery({
    queryKey: profileQueryKey(userId),
    queryFn: () => getProfile(userId as string),
    enabled: Boolean(userId),
    retry: 1,
  });

  const { refetch: refetchProfile } = profileQuery;
  const refreshProfile = useCallback(async () => {
    const result = await refetchProfile();
    return result.data ?? null;
  }, [refetchProfile]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOutRequest();
    } finally {
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile: profileQuery.data ?? null,
      isLoading: isAuthLoading || (Boolean(userId) && profileQuery.isPending),
      profileError: profileQuery.error,
      refreshProfile,
      signOut: handleSignOut,
    }),
    [
      session,
      profileQuery.data,
      profileQuery.error,
      profileQuery.isPending,
      isAuthLoading,
      userId,
      refreshProfile,
      handleSignOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return context;
}
