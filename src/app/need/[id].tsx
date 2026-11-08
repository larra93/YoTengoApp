import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryThumb } from '@/components/needs';
import { AppText, Avatar, Badge, Button, Screen, type BadgeTone } from '@/components/ui';
import { useNeedDetail } from '@/features/needs/use-needs';
import { cn } from '@/lib/cn';
import { formatDateRange, formatDistance, getInitials } from '@/lib/format';
import { DEAL_TYPE_ICON, DEAL_TYPE_LABEL } from '@/lib/labels';
import { palette } from '@/theme/tokens';
import type { DealType } from '@/types';

const DEAL_TONE: Record<DealType, BadgeTone> = {
  rent: 'rent',
  loan: 'loan',
  swap: 'swap',
};

interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}

function DetailRow({ icon, label, value, last }: DetailRowProps) {
  return (
    <View className={cn('flex-row items-center gap-3 py-2.5', !last && 'border-b border-line')}>
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
        <Ionicons name={icon} size={15} color={palette.muted} />
      </View>
      <View className="flex-1 gap-0.5">
        <AppText variant="caption">{label}</AppText>
        <AppText className="text-[13px] font-bold text-ink">{value}</AppText>
      </View>
    </View>
  );
}

export default function NeedDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const needId = Array.isArray(id) ? id[0] : id;
  const needQuery = useNeedDetail(needId);
  const need = needQuery.data;
  const authorName = need?.author?.full_name ?? 'Vecino';
  const isOpen = need?.status === 'open';

  if (needQuery.isLoading) {
    return (
      <Screen className="items-center justify-center gap-3">
        <ActivityIndicator size="large" color={palette.brand} />
        <AppText variant="muted">Cargando pedido...</AppText>
      </Screen>
    );
  }

  if (!need) {
    return (
      <Screen className="items-center justify-center gap-4 px-8">
        <Ionicons name="search-outline" size={30} color={palette.placeholder} />
        <AppText variant="title" className="text-center">
          No encontramos este pedido
        </AppText>
        <Button label="Volver" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 py-2">
        <Pressable
          accessibilityLabel="Volver"
          className="h-10 w-10 items-center justify-center rounded-full border border-line bg-surface"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={19} color={palette.ink} />
        </Pressable>
        <AppText variant="subtitle">Detalle del pedido</AppText>
        <Pressable
          accessibilityLabel="Compartir"
          className="h-10 w-10 items-center justify-center rounded-full border border-line bg-surface"
          onPress={() => Alert.alert('Compartir', 'El enlace público se habilitará en la Fase 4.')}
        >
          <Ionicons name="share-outline" size={18} color={palette.ink} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="mx-5 h-44 overflow-hidden rounded-2xl bg-slate-100">
          {need.reference_image_url ? (
            <Image source={need.reference_image_url} style={{ flex: 1 }} contentFit="cover" />
          ) : (
            <CategoryThumb category={need.category} className="h-full w-full" iconSize={64} />
          )}
          <View className="absolute left-3 top-3 flex-row gap-2">
            <Badge
              label={DEAL_TYPE_LABEL[need.deal_type]}
              tone={DEAL_TONE[need.deal_type]}
              icon={DEAL_TYPE_ICON[need.deal_type]}
            />
            {need.category ? <Badge label={need.category.name} tone="neutral" /> : null}
          </View>
          {need.distance_km !== undefined ? (
            <View className="absolute right-3 top-3 rounded-lg bg-white/90 px-2.5 py-1.5">
              <AppText className="text-[11px] font-bold text-ink">
                {formatDistance(need.distance_km)}
              </AppText>
            </View>
          ) : null}
        </View>

        <View className="mt-4 gap-2 px-5">
          <AppText variant="title">{need.title}</AppText>
          <View className="flex-row flex-wrap items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar-outline" size={13} color={palette.muted} />
              <AppText variant="caption">{formatDateRange(need.start_date, need.end_date)}</AppText>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="chatbubble-ellipses-outline" size={13} color={palette.muted} />
              <AppText variant="caption">{need.offers_count} ofertas recibidas</AppText>
            </View>
          </View>
        </View>

        <Pressable
          className="mx-5 mt-4 flex-row items-center gap-3 rounded-card border border-line bg-surface p-3.5"
          onPress={() =>
            Alert.alert('Perfil público', 'El perfil del vecino se habilitará en la Fase 4.')
          }
        >
          <Avatar
            size="md"
            uri={need.author?.avatar_url}
            initials={getInitials(authorName) || '?'}
          />
          <View className="flex-1 gap-0.5">
            <AppText variant="subtitle" className="text-[14px]">
              {authorName}
            </AppText>
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={11} color="#F59E0B" />
              <AppText variant="caption">
                {need.author ? Number(need.author.rating_avg).toFixed(1) : 'Nuevo'}
                {need.author?.neighborhood ? ` · ${need.author.neighborhood}` : ''}
              </AppText>
            </View>
          </View>
          <View className="rounded-lg bg-brand-soft px-2.5 py-1.5">
            <AppText className="text-[10px] font-bold uppercase tracking-wide text-brand-dark">
              Ver perfil
            </AppText>
          </View>
        </Pressable>

        <View className="mt-5 gap-2 px-5">
          <AppText variant="subtitle">Lo que necesita</AppText>
          <AppText variant="body" className="text-slate-600">
            {need.description}
          </AppText>
        </View>

        <View className="mx-5 mt-5 rounded-card border border-line bg-surface p-4">
          <DetailRow
            icon="swap-horizontal-outline"
            label="Tipo de acuerdo"
            value={DEAL_TYPE_LABEL[need.deal_type]}
          />
          <DetailRow
            icon="calendar-outline"
            label="Fechas"
            value={formatDateRange(need.start_date, need.end_date)}
          />
          <DetailRow
            icon="cash-outline"
            label="Presupuesto o intercambio"
            value={need.budget_or_offer_details ?? 'A convenir'}
          />
          <DetailRow
            icon="location-outline"
            label="Ubicación aproximada"
            value={need.address_label ?? 'Se comparte al aceptar la oferta'}
            last
          />
        </View>

        <Pressable
          className="mx-5 mt-4 flex-row items-center gap-3 rounded-card border border-line bg-surface p-4"
          onPress={() => Alert.alert('Mapa', 'El mapa con PostGIS se habilitará en la Fase 2.')}
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-soft">
            <Ionicons name="map-outline" size={19} color={palette.brandDark} />
          </View>
          <View className="flex-1 gap-0.5">
            <AppText variant="subtitle" className="text-[13px]">
              {need.address_label ?? 'Ubicación aproximada'}
            </AppText>
            <AppText variant="caption">Ver referencia en el mapa</AppText>
          </View>
          <Ionicons name="chevron-forward" size={17} color={palette.placeholder} />
        </Pressable>
      </ScrollView>

      <View
        className="border-t border-line bg-surface px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="flex-row items-center gap-3">
          <View className="flex-1 gap-0.5">
            <AppText variant="caption">Presupuesto</AppText>
            <AppText variant="price" className="text-lg text-brand-dark">
              {need.budget_or_offer_details ?? 'A convenir'}
            </AppText>
          </View>
          <Button
            label={isOpen ? 'Tengo esto' : 'Pedido no disponible'}
            disabled={!isOpen}
            className="flex-1"
            icon={<Ionicons name="hand-left-outline" size={18} color="#FFFFFF" />}
            onPress={() =>
              router.push({ pathname: '/offer/[needId]', params: { needId: need.id } })
            }
          />
        </View>
      </View>
    </Screen>
  );
}
