import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryThumb } from '@/components/needs';
import { AppText, Avatar, Badge, Button, Screen, type BadgeTone } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { useOfferActions } from '@/features/offers/use-offer-actions';
import { useOfferDetail } from '@/features/offers/use-offers';
import { formatClp, formatDateRange, getInitials } from '@/lib/format';
import { OFFER_STATUS_LABEL } from '@/lib/labels';
import { palette } from '@/theme/tokens';
import type { OfferStatus } from '@/types';

const OFFER_TONE: Record<OfferStatus, BadgeTone> = {
  pending: 'neutral',
  accepted: 'success',
  rejected: 'danger',
};

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const offerId = Array.isArray(id) ? id[0] : id;
  const offerQuery = useOfferDetail(offerId);
  const { handleAccept, handleReject, acceptPending, rejectPending } = useOfferActions();

  const offer = offerQuery.data;
  const isOwner = Boolean(user?.id && offer?.need?.user_id === user.id);
  const isSupplier = Boolean(user?.id && offer?.supplier_id === user.id);
  const isParticipant = isOwner || isSupplier;
  const supplierName = offer?.supplier?.full_name ?? 'Vecino';

  const openChat = () => {
    if (!offer) {
      return;
    }

    router.push({
      pathname: '/chat/[needId]',
      params: { needId: offer.need_id, offerId: offer.id },
    });
  };

  if (offerQuery.isLoading) {
    return (
      <Screen className="items-center justify-center gap-3">
        <ActivityIndicator size="large" color={palette.brand} />
        <AppText variant="muted">Cargando oferta...</AppText>
      </Screen>
    );
  }

  if (!offer || !isParticipant) {
    return (
      <Screen className="items-center justify-center gap-4 px-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Ionicons name="lock-closed-outline" size={28} color={palette.muted} />
        </View>
        <AppText variant="title" className="text-center">
          No puedes ver esta oferta
        </AppText>
        <AppText variant="muted" className="text-center">
          Solo el vecino que la envió y el dueño del pedido pueden verla.
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
        <AppText variant="subtitle">Detalle de la oferta</AppText>
        <View className="h-10 w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="mx-5 h-56 overflow-hidden rounded-2xl bg-slate-100">
          {offer.item_photo_url ? (
            <Image
              source={offer.item_photo_url}
              style={{ flex: 1 }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <CategoryThumb
              category={offer.need?.category ?? null}
              className="h-full w-full"
              iconSize={64}
            />
          )}
          <View className="absolute left-3 top-3">
            <Badge
              label={OFFER_STATUS_LABEL[offer.status]}
              tone={OFFER_TONE[offer.status]}
              icon={offer.status === 'accepted' ? 'checkmark-circle' : undefined}
            />
          </View>
        </View>

        <View className="mt-4 gap-2 px-5">
          <AppText variant="title">{offer.swap_offered_details ?? 'Oferta de servicio'}</AppText>
          <AppText variant="price" className="text-2xl text-brand-dark">
            {offer.price_offered !== null ? formatClp(offer.price_offered) : 'Precio a convenir'}
          </AppText>
        </View>

        <Pressable
          className="mx-5 mt-4 flex-row items-center gap-3 rounded-card border border-line bg-surface p-3.5"
          onPress={() => router.push({ pathname: '/user/[id]', params: { id: offer.supplier_id } })}
        >
          <Avatar
            size="md"
            uri={offer.supplier?.avatar_url}
            initials={getInitials(supplierName) || '?'}
          />
          <View className="flex-1 gap-0.5">
            <AppText variant="subtitle" className="text-[14px]">
              {isSupplier ? 'Tú' : supplierName}
            </AppText>
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={11} color="#F59E0B" />
              <AppText variant="caption">
                {offer.supplier ? Number(offer.supplier.rating_avg).toFixed(1) : 'Nuevo'}
                {offer.supplier?.neighborhood ? ` · ${offer.supplier.neighborhood}` : ''}
              </AppText>
            </View>
          </View>
          <View className="rounded-lg bg-brand-soft px-2.5 py-1.5">
            <AppText className="text-[10px] font-bold uppercase tracking-wide text-brand-dark">
              Ver perfil
            </AppText>
          </View>
        </Pressable>

        {offer.need ? (
          <Pressable
            className="mx-5 mt-3 flex-row items-center gap-3 rounded-card border border-line bg-surface p-3.5"
            onPress={() => router.push({ pathname: '/need/[id]', params: { id: offer.need_id } })}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-soft">
              <Ionicons name="cube-outline" size={19} color={palette.brandDark} />
            </View>
            <View className="flex-1 gap-0.5">
              <AppText variant="caption">Pedido asociado</AppText>
              <AppText variant="subtitle" className="text-[13px]" numberOfLines={1}>
                {offer.need.title}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={17} color={palette.placeholder} />
          </Pressable>
        ) : null}

        <View className="mx-5 mt-5 rounded-card border border-line bg-surface p-4">
          <View className="flex-row items-center gap-3 border-b border-line py-2.5">
            <View className="h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <Ionicons name="pricetag-outline" size={15} color={palette.muted} />
            </View>
            <View className="flex-1 gap-0.5">
              <AppText variant="caption">Precio ofrecido</AppText>
              <AppText className="text-[13px] font-bold text-ink">
                {offer.price_offered !== null ? formatClp(offer.price_offered) : 'A convenir'}
              </AppText>
            </View>
          </View>
          <View className="flex-row items-center gap-3 border-b border-line py-2.5">
            <View className="h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <Ionicons name="swap-horizontal-outline" size={15} color={palette.muted} />
            </View>
            <View className="flex-1 gap-0.5">
              <AppText variant="caption">Lo que ofrece</AppText>
              <AppText className="text-[13px] font-bold text-ink">
                {offer.swap_offered_details ?? 'Oferta de servicio'}
              </AppText>
            </View>
          </View>
          <View className="flex-row items-center gap-3 border-b border-line py-2.5">
            <View className="h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <Ionicons name="document-text-outline" size={15} color={palette.muted} />
            </View>
            <View className="flex-1 gap-0.5">
              <AppText variant="caption">Condiciones</AppText>
              <AppText className="text-[13px] font-bold text-ink">
                {offer.conditions ?? 'Sin condiciones adicionales'}
              </AppText>
            </View>
          </View>
          <View className="flex-row items-center gap-3 py-2.5">
            <View className="h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <Ionicons name="calendar-outline" size={15} color={palette.muted} />
            </View>
            <View className="flex-1 gap-0.5">
              <AppText variant="caption">Fechas del pedido</AppText>
              <AppText className="text-[13px] font-bold text-ink">
                {offer.need
                  ? formatDateRange(offer.need.start_date, offer.need.end_date)
                  : 'A convenir'}
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        className="border-t border-line bg-surface px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        {isOwner && offer.status === 'pending' ? (
          <View className="flex-row gap-2">
            <Button
              variant="ghost"
              label="Rechazar"
              textClassName="text-danger"
              className="flex-1"
              loading={rejectPending}
              onPress={() => handleReject(offer.id)}
            />
            <Button
              label="Aceptar oferta"
              className="flex-1"
              loading={acceptPending}
              icon={<Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />}
              onPress={() => handleAccept(offer.id, supplierName)}
            />
          </View>
        ) : isSupplier && offer.status === 'pending' ? (
          <View className="flex-row items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3">
            <Ionicons name="time-outline" size={16} color="#B45309" />
            <AppText className="text-xs font-semibold text-amber-800">
              Esperando la respuesta del vecino
            </AppText>
          </View>
        ) : offer.status === 'accepted' ? (
          <Button
            label="Abrir chat"
            icon={<Ionicons name="chatbubble-outline" size={18} color="#FFFFFF" />}
            onPress={openChat}
          />
        ) : offer.status === 'rejected' ? (
          <View className="flex-row items-center justify-center gap-2 rounded-xl bg-danger-soft px-4 py-3">
            <Ionicons name="close-circle-outline" size={16} color={palette.danger} />
            <AppText className="text-xs font-semibold text-danger">
              Esta oferta fue rechazada
            </AppText>
          </View>
        ) : (
          <Button label="Volver" variant="ghost" onPress={() => router.back()} />
        )}
      </View>
    </Screen>
  );
}
