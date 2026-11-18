import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';

import { NeedsMap } from '@/components/needs';
import { AppText, Screen } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { useMapNeeds } from '@/features/needs/use-needs';
import { useViewerLocation } from '@/features/needs/use-viewer-location';
import type { NeedWithRelations } from '@/types';
import { palette } from '@/theme/tokens';

type LocatedNeed = NeedWithRelations & { latitude: number; longitude: number };

export default function MapScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { location, requestLocation, isRequesting } = useViewerLocation();
  const needsQuery = useMapNeeds(location, user?.id);
  const needs = (needsQuery.data ?? []).filter(
    (need): need is LocatedNeed =>
      typeof need.latitude === 'number' && typeof need.longitude === 'number',
  );

  const requestLocationAccess = async () => {
    const nextLocation = await requestLocation();
    if (!nextLocation) {
      Alert.alert('Ubicación', 'Permite el acceso a tu ubicación para ver pedidos en el mapa.');
    }
  };

  const openNeed = (needId: string) => {
    router.push({ pathname: '/need/[id]', params: { id: needId } });
  };

  return (
    <Screen>
      <View className="flex-row items-center gap-3 px-5 py-2">
        <Pressable
          accessibilityLabel="Volver"
          className="h-10 w-10 items-center justify-center rounded-full border border-line bg-surface"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={19} color={palette.ink} />
        </Pressable>
        <View className="flex-1">
          <AppText variant="subtitle">Mapa</AppText>
          <AppText variant="caption">Pedidos abiertos a menos de 10 km</AppText>
        </View>
        <Pressable
          accessibilityLabel="Actualizar"
          className="h-10 w-10 items-center justify-center rounded-full border border-line bg-surface"
          onPress={() => needsQuery.refetch()}
        >
          <Ionicons name="refresh-outline" size={18} color={palette.ink} />
        </Pressable>
      </View>

      <View className="flex-1 px-5 pb-5">
        {!location ? (
          <View className="gap-3">
            <Pressable
              className="flex-row items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3"
              onPress={requestLocationAccess}
            >
              {isRequesting ? (
                <ActivityIndicator size="small" color={palette.amber} />
              ) : (
                <Ionicons name="location-outline" size={16} color={palette.amber} />
              )}
              <AppText className="flex-1 text-xs font-semibold text-amber-800">
                Activa tu ubicación para centrar el mapa en tu zona.
              </AppText>
            </Pressable>
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
              <Ionicons name="map-outline" size={26} color={palette.placeholder} />
              <AppText variant="subtitle">El mapa necesita tu ubicación</AppText>
              <AppText variant="caption" className="text-center">
                Con tu ubicación mostramos los pedidos abiertos de tus vecinos cercanos.
              </AppText>
            </View>
          </View>
        ) : needsQuery.isLoading ? (
          <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
            <ActivityIndicator size="small" color={palette.brand} />
            <AppText variant="muted">Cargando pedidos cercanos...</AppText>
          </View>
        ) : needsQuery.error ? (
          <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
            <Ionicons name="cloud-offline-outline" size={26} color={palette.placeholder} />
            <AppText variant="subtitle">No pudimos cargar el mapa</AppText>
            <AppText variant="caption" className="text-center">
              Revisa tu conexión e intenta nuevamente.
            </AppText>
            <Pressable
              className="mt-1 rounded-full bg-brand px-4 py-2"
              onPress={() => needsQuery.refetch()}
            >
              <AppText className="text-xs font-bold text-white">Reintentar</AppText>
            </Pressable>
          </View>
        ) : (
          <View className="flex-1 overflow-hidden rounded-card border border-line">
            <NeedsMap needs={needs} center={location} onNeedPress={openNeed} />
            {needs.length === 0 ? (
              <View
                pointerEvents="none"
                className="absolute bottom-4 left-4 right-4 rounded-full border border-line bg-surface px-4 py-2"
              >
                <AppText variant="caption" className="text-center">
                  No hay pedidos abiertos en tu zona por ahora.
                </AppText>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </Screen>
  );
}
