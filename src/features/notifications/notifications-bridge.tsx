import { useAuth } from '@/features/auth/auth-provider';

import { usePushNotifications } from './use-push-notifications';

export function NotificationsBridge() {
  const { user } = useAuth();
  usePushNotifications(user?.id);

  return null;
}
