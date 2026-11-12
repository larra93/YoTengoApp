import '../../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppText, Button, Screen } from '@/components/ui';
import { AuthProvider, useAuth } from '@/features/auth/auth-provider';
import { NotificationsBridge } from '@/features/notifications';
import { queryClient } from '@/lib/query-client';
import { palette } from '@/theme/tokens';

function LoadingScreen({ label = 'Cargando...' }: { label?: string }) {
  return (
    <Screen className="items-center justify-center gap-3">
      <ActivityIndicator size="large" color={palette.brand} />
      <AppText variant="muted">{label}</AppText>
    </Screen>
  );
}

function ProfileErrorScreen() {
  const { refreshProfile, signOut } = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);

    try {
      await refreshProfile();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Screen className="items-center justify-center gap-4 px-8">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-danger-soft">
        <Ionicons name="cloud-offline-outline" size={30} color={palette.danger} />
      </View>
      <AppText variant="title" className="text-center">
        No pudimos cargar tu perfil
      </AppText>
      <AppText variant="muted" className="text-center">
        Revisa tu conexión e intenta nuevamente.
      </AppText>
      <Button label="Reintentar" loading={isRetrying} onPress={handleRetry} />
      <Button label="Cerrar sesión" variant="ghost" onPress={() => signOut()} />
    </Screen>
  );
}

function AppStack() {
  return (
    <>
      <NotificationsBridge />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.bg },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="need/[id]" />
        <Stack.Screen name="offer/[needId]" />
        <Stack.Screen name="offers/[id]" />
        <Stack.Screen name="chat/[needId]" />
        <Stack.Screen name="review/[needId]" />
        <Stack.Screen name="reviews" />
        <Stack.Screen name="my-needs" />
        <Stack.Screen name="user/[id]" />
        <Stack.Screen name="activity" />
      </Stack>
    </>
  );
}

function RootNavigator() {
  const { session, profile, isLoading, profileError } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const isInAuthGroup = segments[0] === '(auth)';
  const isCallback = segments[0] === 'auth' && segments[1] === 'callback';
  const isOnboarding = segments[0] === 'onboarding';
  const needsOnboarding = Boolean(session) && !profileError && !profile?.neighborhood?.trim();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!session) {
      if (!isInAuthGroup && !isCallback) {
        router.replace('/sign-in');
      }
      return;
    }

    if (isCallback) {
      return;
    }

    if (profileError && !profile) {
      return;
    }

    if (needsOnboarding) {
      if (!isOnboarding) {
        router.replace('/onboarding');
      }
      return;
    }

    if (isInAuthGroup || isOnboarding) {
      router.replace('/');
    }
  }, [
    isLoading,
    session,
    isInAuthGroup,
    isCallback,
    isOnboarding,
    needsOnboarding,
    profileError,
    profile,
    router,
  ]);

  if (isLoading) {
    return <LoadingScreen label="Preparando tu cuenta..." />;
  }

  if (!session) {
    return isInAuthGroup || isCallback ? <AppStack /> : <LoadingScreen />;
  }

  if (isCallback) {
    return <AppStack />;
  }

  if (profileError && !profile) {
    return <ProfileErrorScreen />;
  }

  if (needsOnboarding) {
    return isOnboarding ? <AppStack /> : <LoadingScreen label="Preparando tu perfil..." />;
  }

  if (isInAuthGroup || isOnboarding) {
    return <LoadingScreen />;
  }

  return <AppStack />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
