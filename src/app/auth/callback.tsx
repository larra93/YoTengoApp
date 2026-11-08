import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AppText, Button, Screen } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { palette } from '@/theme/tokens';

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string | string[];
    error?: string | string[];
    error_description?: string | string[];
  }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const finishAuth = async () => {
      const errorCode = firstParam(params.error);
      const errorDescription = firstParam(params.error_description);
      const code = firstParam(params.code);

      if (errorCode) {
        if (isActive) {
          setError(errorDescription ?? 'No pudimos confirmar tu cuenta.');
        }
        return;
      }

      if (!code) {
        if (isActive) {
          setError('El enlace de acceso no es válido o ya fue utilizado.');
        }
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (!isActive) {
        return;
      }

      if (exchangeError) {
        setError('El enlace de acceso expiró. Solicita uno nuevo e intenta otra vez.');
        return;
      }

      router.replace('/');
    };

    finishAuth();

    return () => {
      isActive = false;
    };
  }, [params.code, params.error, params.error_description, router]);

  if (error) {
    return (
      <Screen className="items-center justify-center gap-4 px-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-danger-soft">
          <Ionicons name="alert-circle-outline" size={30} color={palette.danger} />
        </View>
        <AppText variant="title" className="text-center">
          No pudimos confirmar tu acceso
        </AppText>
        <AppText variant="muted" className="text-center">
          {error}
        </AppText>
        <Button label="Volver a iniciar sesión" onPress={() => router.replace('/sign-in')} />
      </Screen>
    );
  }

  return (
    <Screen className="items-center justify-center gap-4 px-8">
      <ActivityIndicator size="large" color={palette.brand} />
      <AppText variant="subtitle">Confirmando tu cuenta...</AppText>
      <AppText variant="muted" className="text-center">
        Esto tomará solo un momento.
      </AppText>
    </Screen>
  );
}
