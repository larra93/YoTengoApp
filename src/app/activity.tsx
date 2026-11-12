import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { ReviewCard } from '@/components/reviews';
import { AppText, Avatar, Screen, SectionHeader } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { useRecentIncomingMessages } from '@/features/chat/use-chat';
import { useReceivedOffers } from '@/features/offers/use-offers';
import { useReviewsForUser } from '@/features/reviews/use-reviews';
import { formatClp, getInitials } from '@/lib/format';
import { palette } from '@/theme/tokens';

function timeAgo(value: string) {
  return formatDistanceToNow(parseISO(value), { addSuffix: true, locale: es });
}

export default function ActivityScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const offersQuery = useReceivedOffers(user?.id);
  const messagesQuery = useRecentIncomingMessages(user?.id);
  const reviewsQuery = useReviewsForUser(user?.id);

  const pendingOffers = (offersQuery.data ?? []).filter((offer) => offer.status === 'pending');
  const messages = messagesQuery.data?.messages ?? [];
  const reviews = (reviewsQuery.data ?? []).slice(0, 3);
  const isLoading = offersQuery.isLoading || messagesQuery.isLoading || reviewsQuery.isLoading;
  const hasError = offersQuery.isError || messagesQuery.isError || reviewsQuery.isError;
  const isEmpty = pendingOffers.length === 0 && messages.length === 0 && reviews.length === 0;

  const refresh = async () => {
    await Promise.all([offersQuery.refetch(), messagesQuery.refetch(), reviewsQuery.refetch()]);
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
          <AppText variant="subtitle">Actividad</AppText>
          <AppText variant="caption">Ofertas, mensajes y reseñas recientes</AppText>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={offersQuery.isRefetching || messagesQuery.isRefetching}
            onRefresh={refresh}
            tintColor={palette.brand}
          />
        }
      >
        {isLoading ? (
          <View className="mx-5 mt-3 items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
            <ActivityIndicator size="small" color={palette.brand} />
            <AppText variant="muted">Cargando actividad...</AppText>
          </View>
        ) : hasError ? (
          <View className="mx-5 mt-3 items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
            <Ionicons name="cloud-offline-outline" size={26} color={palette.placeholder} />
            <AppText variant="subtitle">No pudimos cargar la actividad</AppText>
            <AppText variant="caption" className="text-center">
              Revisa tu conexión e intenta nuevamente.
            </AppText>
          </View>
        ) : isEmpty ? (
          <View className="mx-5 mt-3 items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-soft">
              <Ionicons name="notifications-outline" size={22} color={palette.brandDark} />
            </View>
            <AppText variant="subtitle">Todo al día</AppText>
            <AppText variant="caption" className="text-center">
              Cuando recibas ofertas, mensajes o reseñas aparecerán aquí.
            </AppText>
          </View>
        ) : (
          <>
            <SectionHeader
              className="mt-3 px-5"
              title="Ofertas pendientes"
              subtitle={
                pendingOffers.length > 0 ? `${pendingOffers.length} por revisar` : undefined
              }
              actionLabel="Ver todas"
              onAction={() => router.push('/(tabs)/negotiations')}
            />

            <View className="mt-3 gap-2 px-5">
              {pendingOffers.length > 0 ? (
                pendingOffers.slice(0, 5).map((offer) => (
                  <Pressable
                    key={offer.id}
                    className="flex-row items-center gap-3 rounded-card border border-line bg-surface p-3.5"
                    onPress={() => router.push('/(tabs)/negotiations')}
                  >
                    <Avatar
                      size="md"
                      uri={offer.supplier?.avatar_url}
                      initials={getInitials(offer.supplier?.full_name ?? 'Vecino') || '?'}
                    />
                    <View className="flex-1 gap-0.5">
                      <AppText variant="subtitle" className="text-[13px]" numberOfLines={1}>
                        {offer.supplier?.full_name ?? 'Un vecino'} te ofreció
                      </AppText>
                      <AppText variant="caption" numberOfLines={1}>
                        {offer.need?.title ?? 'Tu pedido'}
                        {' · '}
                        {offer.price_offered != null
                          ? formatClp(offer.price_offered)
                          : (offer.swap_offered_details ?? 'Oferta')}
                      </AppText>
                      <AppText variant="caption" className="text-[10px]">
                        {timeAgo(offer.created_at)}
                      </AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={palette.placeholder} />
                  </Pressable>
                ))
              ) : (
                <AppText variant="caption" className="px-1">
                  Sin ofertas pendientes.
                </AppText>
              )}
            </View>

            <SectionHeader
              className="mt-6 px-5"
              title="Mensajes recientes"
              subtitle={messages.length > 0 ? 'Últimos mensajes que recibiste' : undefined}
            />

            <View className="mt-3 gap-2 px-5">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <Pressable
                    key={message.id}
                    className="flex-row items-center gap-3 rounded-card border border-line bg-surface p-3.5"
                    onPress={() =>
                      router.push({
                        pathname: '/chat/[needId]',
                        params: { needId: message.need_id, offerId: message.offer_id ?? undefined },
                      })
                    }
                  >
                    <Avatar
                      size="md"
                      uri={message.sender?.avatar_url}
                      initials={getInitials(message.sender?.full_name ?? 'Vecino') || '?'}
                    />
                    <View className="flex-1 gap-0.5">
                      <View className="flex-row items-center justify-between gap-2">
                        <AppText
                          variant="subtitle"
                          className="flex-1 text-[13px]"
                          numberOfLines={1}
                        >
                          {message.sender?.full_name ?? 'Vecino'}
                        </AppText>
                        <AppText variant="caption" className="text-[10px]">
                          {timeAgo(message.created_at)}
                        </AppText>
                      </View>
                      <AppText variant="caption" numberOfLines={1} className="text-slate-600">
                        {message.message}
                      </AppText>
                      {message.need ? (
                        <AppText variant="caption" className="text-[10px]" numberOfLines={1}>
                          Pedido: {message.need.title}
                        </AppText>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={palette.placeholder} />
                  </Pressable>
                ))
              ) : (
                <AppText variant="caption" className="px-1">
                  Sin mensajes recientes.
                </AppText>
              )}
            </View>

            <SectionHeader
              className="mt-6 px-5"
              title="Reseñas recientes"
              subtitle={reviews.length > 0 ? 'Lo que dicen de ti' : undefined}
              actionLabel="Ver todas"
              onAction={() => router.push('/reviews')}
            />

            <View className="mt-3 gap-3 px-5">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    showNeed
                    onReviewerPress={() =>
                      router.push({ pathname: '/user/[id]', params: { id: review.reviewer_id } })
                    }
                  />
                ))
              ) : (
                <AppText variant="caption" className="px-1">
                  Aún no tienes reseñas.
                </AppText>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
