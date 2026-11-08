import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from '@/types/database.types';

import { getSupabaseEnv } from './env';

const { supabaseUrl, supabaseKey } = getSupabaseEnv();
const isServer = Platform.OS === 'web' && typeof window === 'undefined';
const serverStorage = {
  getItem: async () => null,
  setItem: async () => undefined,
  removeItem: async () => undefined,
};

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: isServer ? serverStorage : AsyncStorage,
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

if (!isServer) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
