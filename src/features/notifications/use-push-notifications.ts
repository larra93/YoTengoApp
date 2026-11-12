import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { registerPushToken } from './api';

const LAST_HANDLED_KEY = 'notifications:last-handled';
const handledIdentifiers = new Set<string>();

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function routeFromData(data: Record<string, unknown>) {
  const type = typeof data.type === 'string' ? data.type : null;
  const needId = typeof data.needId === 'string' ? data.needId : null;
  const offerId = typeof data.offerId === 'string' ? data.offerId : null;

  if (type === 'chat' && needId) {
    return { pathname: '/chat/[needId]', params: { needId } } as const;
  }

  if (type === 'offer' && offerId) {
    return { pathname: '/offers/[id]', params: { id: offerId } } as const;
  }

  return null;
}

export function usePushNotifications(userId: string | undefined) {
  const router = useRouter();

  useEffect(() => {
    if (!userId || Platform.OS === 'web') {
      return;
    }

    void registerPushToken(userId);

    const handleResponse = async (response: Notifications.NotificationResponse) => {
      if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
        return;
      }

      const identifier = response.notification.request.identifier;

      if (handledIdentifiers.has(identifier)) {
        return;
      }

      handledIdentifiers.add(identifier);

      try {
        const lastHandled = await AsyncStorage.getItem(LAST_HANDLED_KEY);
        await AsyncStorage.setItem(LAST_HANDLED_KEY, identifier);

        if (lastHandled === identifier) {
          return;
        }
      } catch {
        // Sin AsyncStorage seguimos adelante: peor caso, navegación repetida.
      }

      const route = routeFromData(
        response.notification.request.content.data as Record<string, unknown>,
      );

      if (route) {
        router.push(route);
      }
    };

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      void handleResponse(response);
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        void handleResponse(response);
      }
    });

    return () => {
      responseListener.remove();
    };
  }, [router, userId]);
}
