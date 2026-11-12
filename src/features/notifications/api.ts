import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

let registeredToken: string | null = null;

export async function registerPushToken(userId: string) {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenResponse.data;

    if (!token) {
      return;
    }

    const { error } = await supabase.from('push_tokens').upsert(
      {
        token,
        user_id: userId,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
      },
      { onConflict: 'token' },
    );

    if (error) {
      throw error;
    }

    registeredToken = token;
  } catch {
    registeredToken = null;
  }
}

export async function clearRegisteredPushToken() {
  if (!registeredToken) {
    return;
  }

  try {
    await supabase.from('push_tokens').delete().eq('token', registeredToken);
  } finally {
    registeredToken = null;
  }
}
