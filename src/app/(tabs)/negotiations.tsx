import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { OfferCard } from '@/components/offers';
import { AppText, Screen } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { useOfferActions } from '@/features/offers/use-offer-actions';
import { useOffersRealtime, useReceivedOffers, useSentOffers } from '@/features/offers/use-offers';
import { cn } from '@/lib/cn';
import { palette } from '@/theme/tokens';

type NegotiationTab = 'received' | 'sent';

export default function NegotiationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<NegotiationTab>('received');
  const receivedQuery = useReceivedOffers(user?.id);
  const sentQuery = useSentOffers(user?.id);
  const { handleAccept, handleReject } = useOfferActions();
  useOffersRealtime(user?.id);

  const offers = (tab === 'received' ? receivedQuery.data : sentQuery.data) ?? [];
  const isLoading = tab === 'received' ? receivedQuery.isLoading : sentQuery.isLoading;
  const isError = tab === 'received' ? receivedQuery.isError : sentQuery.isError;
  const pendingReceived = (receivedQuery.data ?? []).filter(
    (offer) => offer.status === 'pending',
  ).length;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="flex-row items-start justify-between gap-3 px-5 pt-2">
          <View className="flex-1 gap-0.5">
            <AppText variant="caption" className="uppercase tracking-[2px]">
              Tus acuerdos
            </AppText>
            <AppText variant="title">Negociaciones</AppText>
            <AppText variant="muted">
              Revisa ofertas, acuerda detalles y coordina la entrega.
            </AppText>
          </View>
        </View>

        <View className="mx-5 mt-5 flex-row rounded-xl bg-slate-100 p-1">
          <Pressable
            className={cn(
              'flex-1 items-center rounded-lg py-2',
              tab === 'received' && 'bg-surface',
            )}
            onPress={() => setTab('received')}
          >
            <AppText
              className={cn('text-xs font-bold', tab === 'received' ? 'text-ink' : 'text-muted')}
            >
              Recibidas ({receivedQuery.data?.length ?? 0})
            </AppText>
          </Pressable>
          <Pressable
            className={cn('flex-1 items-center rounded-lg py-2', tab === 'sent' && 'bg-surface')}
            onPress={() => setTab('sent')}
          >
            <AppText
              className={cn('text-xs font-bold', tab === 'sent' ? 'text-ink' : 'text-muted')}
            >
              Enviadas ({sentQuery.data?.length ?? 0})
            </AppText>
          </Pressable>
        </View>

        {tab === 'received' && pendingReceived > 0 ? (
          <View className="mx-5 mt-4 flex-row items-center gap-2.5 rounded-xl bg-amber-50 p-3">
            <Ionicons name="time-outline" size={18} color={palette.amber} />
            <AppText className="flex-1 text-xs font-semibold text-amber-800">
              {pendingReceived === 1
                ? '1 oferta espera tu respuesta. Responde pronto para no perder el match.'
                : `${pendingReceived} ofertas esperan tu respuesta. Responde pronto para no perder el match.`}
            </AppText>
          </View>
        ) : null}

        <View className="mt-4 gap-3 px-5">
          {isLoading ? (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
              <ActivityIndicator size="small" color={palette.brand} />
              <AppText variant="muted">Cargando ofertas...</AppText>
            </View>
          ) : isError ? (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
              <Ionicons name="cloud-offline-outline" size={26} color={palette.placeholder} />
              <AppText variant="subtitle">No pudimos cargar las ofertas</AppText>
              <AppText variant="caption" className="text-center">
                Revisa tu conexión e intenta nuevamente.
              </AppText>
            </View>
          ) : offers.length > 0 ? (
            offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                canManage={tab === 'received'}
                showNeed={tab === 'sent'}
                onPress={() => router.push({ pathname: '/offers/[id]', params: { id: offer.id } })}
                onChat={() =>
                  router.push({
                    pathname: '/chat/[needId]',
                    params: { needId: offer.need_id, offerId: offer.id },
                  })
                }
                onAccept={() => handleAccept(offer.id, offer.supplier?.full_name ?? 'tu vecino')}
                onReject={() => handleReject(offer.id)}
              />
            ))
          ) : (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
              <Ionicons name="chatbubbles-outline" size={32} color={palette.placeholder} />
              <AppText variant="subtitle">Aún no hay ofertas aquí</AppText>
              <AppText variant="caption" className="text-center">
                {tab === 'received'
                  ? 'Cuando un vecino ofrezca algo para tus pedidos, aparecerá en esta bandeja.'
                  : 'Cuando envíes una oferta, podrás seguir su estado en esta bandeja.'}
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
