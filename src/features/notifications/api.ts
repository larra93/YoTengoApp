import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

let registeredToken: string | null = null;
let hasShownRegistrationAlert = false;

function showRegistrationAlert(message: string) {
  if (hasShownRegistrationAlert) {
    return;
  }

  hasShownRegistrationAlert = true;
  Alert.alert('Notificaciones no activadas', message);
}

export async function registerPushToken(userId: string) {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      showRegistrationAlert(
        'Permite las notificaciones de YoTengoApp en los ajustes del teléfono para recibir avisos de ofertas y mensajes.',
      );
      return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenResponse.data;

    if (!token) {
      throw new Error('No se obtuvo el push token');
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
    showRegistrationAlert(
      'Ocurrió un problema al registrar este dispositivo. Intenta nuevamente más tarde.',
    );
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
