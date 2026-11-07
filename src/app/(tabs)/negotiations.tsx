import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { OfferCard } from '@/components/offers';
import { AppText, Screen } from '@/components/ui';
import { cn } from '@/lib/cn';
import { MOCK_RECEIVED_OFFERS, MOCK_SENT_OFFERS } from '@/mocks/data';
import { palette } from '@/theme/tokens';

type NegotiationTab = 'received' | 'sent';

export default function NegotiationsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<NegotiationTab>('received');
  const offers = tab === 'received' ? MOCK_RECEIVED_OFFERS : MOCK_SENT_OFFERS;

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
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full border border-line bg-surface"
            onPress={() =>
              Alert.alert('Filtros', 'Los filtros de negociaciones llegarán en la Fase 5.')
            }
          >
            <Ionicons name="options-outline" size={19} color={palette.ink} />
          </Pressable>
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
              Recibidas ({MOCK_RECEIVED_OFFERS.length})
            </AppText>
          </Pressable>
          <Pressable
            className={cn('flex-1 items-center rounded-lg py-2', tab === 'sent' && 'bg-surface')}
            onPress={() => setTab('sent')}
          >
            <AppText
              className={cn('text-xs font-bold', tab === 'sent' ? 'text-ink' : 'text-muted')}
            >
              Enviadas ({MOCK_SENT_OFFERS.length})
            </AppText>
          </Pressable>
        </View>

        {tab === 'received' ? (
          <View className="mx-5 mt-4 flex-row items-center gap-2.5 rounded-xl bg-amber-50 p-3">
            <Ionicons name="time-outline" size={18} color={palette.amber} />
            <AppText className="flex-1 text-xs font-semibold text-amber-800">
              3 ofertas esperan tu respuesta. Responde pronto para no perder el match.
            </AppText>
          </View>
        ) : null}

        <View className="mt-4 gap-3 px-5">
          {offers.length > 0 ? (
            offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onChat={() =>
                  router.push({
                    pathname: '/chat/[needId]',
                    params: { needId: offer.need_id, offerId: offer.id },
                  })
                }
                onAccept={() =>
                  Alert.alert(
                    'Aceptar oferta',
                    `¿Confirmas la oferta de ${offer.supplier?.full_name ?? 'tu vecino'}?`,
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Aceptar',
                        onPress: () =>
                          Alert.alert(
                            'Match creado',
                            'La confirmación real se implementará en la Fase 5.',
                          ),
                      },
                    ],
                  )
                }
                onReject={() =>
                  Alert.alert(
                    'Rechazar oferta',
                    '¿Quieres descartar esta oferta? El vecino podrá seguir viendo tu pedido.',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Rechazar',
                        style: 'destructive',
                        onPress: () =>
                          Alert.alert('Oferta rechazada', 'La acción se conectará en la Fase 5.'),
                      },
                    ],
                  )
                }
              />
            ))
          ) : (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
              <Ionicons name="chatbubbles-outline" size={32} color={palette.placeholder} />
              <AppText variant="subtitle">Aún no hay ofertas aquí</AppText>
              <AppText variant="caption" className="text-center">
                Cuando envíes o recibas una oferta, aparecerá en esta bandeja.
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
