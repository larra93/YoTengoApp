import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';

import { NeedCard } from '@/components/needs';
import { AppText, Avatar, Screen, SectionHeader } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { useCategories, useExploreNeeds } from '@/features/needs/use-needs';
import { useViewerLocation } from '@/features/needs/use-viewer-location';
import { getInitials } from '@/lib/format';
import type { DealType } from '@/types';
import { palette } from '@/theme/tokens';

const DEAL_FILTERS: { value?: DealType; label: string }[] = [
  { label: 'Todo' },
  { value: 'rent', label: 'Arriendo' },
  { value: 'loan', label: 'Préstamo' },
  { value: 'swap', label: 'Trueque' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [dealType, setDealType] = useState<DealType | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const { location, requestLocation, isRequesting } = useViewerLocation();
  const categoriesQuery = useCategories();
  const needsQuery = useExploreNeeds({ categoryId, dealType }, location);
  const fullName = profile?.full_name?.trim() || 'vecino';
  const firstName = fullName.split(' ')[0];
  const neighborhood = profile?.neighborhood?.trim() || 'Elige tu barrio';
  const needs = needsQuery.data ?? [];

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={needsQuery.isRefetching}
            onRefresh={() => needsQuery.refetch()}
            tintColor={palette.brand}
          />
        }
      >
        <View className="flex-row items-start justify-between px-5 pt-2">
          <View className="flex-1 gap-0.5">
            <AppText variant="caption" className="uppercase tracking-[2px]">
              YoTengoApp
            </AppText>
            <AppText variant="display" className="text-[26px]">
              Hola, {firstName}
            </AppText>
            <Pressable
              className="mt-1 flex-row items-center gap-1 self-start"
              onPress={() => router.push('/edit-profile')}
            >
              <Ionicons name="location-sharp" size={13} color={palette.brand} />
              <AppText variant="caption">{neighborhood}</AppText>
              <Ionicons name="chevron-down" size={12} color={palette.muted} />
            </Pressable>
          </View>

          <View className="flex-row items-center gap-2.5">
            <Pressable
              accessibilityLabel="Notificaciones"
              className="h-11 w-11 items-center justify-center rounded-full border border-line bg-surface"
              onPress={() =>
                Alert.alert('Notificaciones', 'Todavía no tienes notificaciones nuevas.')
              }
            >
              <Ionicons name="notifications-outline" size={20} color={palette.ink} />
              <View className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-accent" />
            </Pressable>
            <Pressable accessibilityLabel="Ir al perfil" onPress={() => router.push('/profile')}>
              <Avatar size="md" uri={profile?.avatar_url} initials={getInitials(fullName) || '?'} />
            </Pressable>
          </View>
        </View>

        <Pressable
          className="mx-5 mt-4 flex-row items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3"
          onPress={() =>
            Alert.alert('Buscar', 'La búsqueda por texto se agregará en una fase posterior.')
          }
        >
          <Ionicons name="search" size={18} color={palette.muted} />
          <AppText variant="muted" className="flex-1 text-[13px]">
            ¿Qué necesitas hoy?
          </AppText>
          <Pressable
            accessibilityLabel="Actualizar ubicación"
            className="rounded-lg bg-brand-soft p-1.5"
            onPress={async () => {
              const nextLocation = await requestLocation();
              if (!nextLocation) {
                Alert.alert(
                  'Ubicación',
                  'Permite el acceso a tu ubicación para ver pedidos cercanos.',
                );
              }
            }}
          >
            {isRequesting ? (
              <ActivityIndicator size={17} color={palette.brandDark} />
            ) : (
              <Ionicons
                name={location ? 'locate-outline' : 'options-outline'}
                size={17}
                color={palette.brandDark}
              />
            )}
          </Pressable>
        </Pressable>

        {!location ? (
          <Pressable
            className="mx-5 mt-3 flex-row items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3"
            onPress={async () => {
              const nextLocation = await requestLocation();
              if (!nextLocation) {
                Alert.alert(
                  'Ubicación',
                  'Puedes seguir usando el feed reciente sin filtro de distancia.',
                );
              }
            }}
          >
            <Ionicons name="location-outline" size={16} color={palette.amber} />
            <AppText className="flex-1 text-xs font-semibold text-amber-800">
              Activa tu ubicación para ver pedidos a menos de 5 km.
            </AppText>
          </Pressable>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {DEAL_FILTERS.map((item) => {
            const active = dealType === item.value;
            return (
              <Pressable
                key={item.label}
                className={`rounded-full border px-3 py-2 ${active ? 'border-brand bg-brand-soft' : 'border-line bg-surface'}`}
                onPress={() => setDealType(item.value)}
              >
                <AppText
                  className={`text-xs font-bold ${active ? 'text-brand-dark' : 'text-slate-600'}`}
                >
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
          {(categoriesQuery.data ?? []).map((item) => {
            const active = categoryId === item.id;
            return (
              <Pressable
                key={item.id}
                className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${active ? 'border-brand bg-brand-soft' : 'border-line bg-surface'}`}
                onPress={() => setCategoryId(active ? undefined : item.id)}
              >
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={14}
                  color={palette.brand}
                />
                <AppText
                  className={`text-xs font-bold ${active ? 'text-brand-dark' : 'text-slate-600'}`}
                >
                  {item.name}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <SectionHeader
          className="mt-6 px-5"
          title={location ? 'Cerca de ti' : 'Pedidos recientes'}
          subtitle={
            location
              ? 'Pedidos publicados a menos de 5 km'
              : 'Activa tu ubicación para filtrar por cercanía'
          }
          actionLabel="Actualizar"
          onAction={() => needsQuery.refetch()}
        />

        <View className="mt-3 gap-3 px-5">
          {needsQuery.isLoading ? (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
              <ActivityIndicator size="small" color={palette.brand} />
              <AppText variant="muted">Cargando pedidos...</AppText>
            </View>
          ) : needsQuery.error ? (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
              <Ionicons name="cloud-offline-outline" size={26} color={palette.placeholder} />
              <AppText variant="subtitle">No pudimos cargar el feed</AppText>
              <AppText variant="caption" className="text-center">
                Revisa tu conexión e intenta nuevamente.
              </AppText>
            </View>
          ) : needs.length > 0 ? (
            needs.map((need) => (
              <NeedCard
                key={need.id}
                need={need}
                onPress={() => router.push({ pathname: '/need/[id]', params: { id: need.id } })}
              />
            ))
          ) : (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
              <Ionicons name="search-outline" size={26} color={palette.placeholder} />
              <AppText variant="subtitle">No hay pedidos por ahora</AppText>
              <AppText variant="caption" className="text-center">
                Prueba otro filtro o sé el primero en publicar lo que necesitas.
              </AppText>
            </View>
          )}
        </View>

        <Pressable
          className="mx-5 mt-5 flex-row items-center gap-3 rounded-card border border-brand/20 bg-brand-soft p-4"
          onPress={() => router.push('/publish')}
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-brand">
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </View>
          <View className="flex-1 gap-0.5">
            <AppText variant="subtitle">¿No encuentras lo que buscas?</AppText>
            <AppText variant="caption">
              Publica tu pedido y deja que tus vecinos te ofrezcan.
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={palette.brandDark} />
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
