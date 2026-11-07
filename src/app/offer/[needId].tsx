import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { CategoryThumb } from '@/components/needs';
import { AppText, Button, Field, Screen } from '@/components/ui';
import { formatDateRange } from '@/lib/format';
import { DEAL_TYPE_LABEL } from '@/lib/labels';
import { MOCK_NEEDS } from '@/mocks/data';
import { palette } from '@/theme/tokens';

export default function OfferScreen() {
  const { needId } = useLocalSearchParams<{ needId: string }>();
  const router = useRouter();
  const need = MOCK_NEEDS.find((item) => item.id === needId) ?? MOCK_NEEDS[0];
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');
  const [conditions, setConditions] = useState('');

  return (
    <Screen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-row items-center gap-3 px-5 py-2">
          <Pressable
            accessibilityLabel="Volver"
            className="h-10 w-10 items-center justify-center rounded-full border border-line bg-surface"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={19} color={palette.ink} />
          </Pressable>
          <View className="flex-1">
            <AppText variant="subtitle">Enviar oferta</AppText>
            <AppText variant="caption">Paso 1 de 1 · se envía por chat</AppText>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View className="mx-5 mt-2 flex-row items-center gap-3 rounded-card border border-line bg-surface p-3">
            <CategoryThumb
              category={need.category}
              className="h-14 w-14 rounded-xl"
              iconSize={24}
            />
            <View className="flex-1 gap-0.5">
              <AppText variant="caption">
                {DEAL_TYPE_LABEL[need.deal_type]} ·{' '}
                {formatDateRange(need.start_date, need.end_date)}
              </AppText>
              <AppText variant="subtitle" className="text-[13px]" numberOfLines={1}>
                {need.title}
              </AppText>
              <AppText variant="caption">
                Publicado por {need.author?.full_name ?? 'un vecino'}
              </AppText>
            </View>
          </View>

          <View className="mt-5 gap-4 px-5">
            <View className="gap-1">
              <AppText variant="subtitle">Cuéntale qué puedes ofrecer</AppText>
              <AppText variant="muted">
                Sé claro con las condiciones para que puedan coordinar rápido.
              </AppText>
            </View>

            <Pressable
              className="items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-6"
              onPress={() =>
                Alert.alert('Foto de tu oferta', 'La cámara se habilitará en la Fase 5.')
              }
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-soft">
                <Ionicons name="camera-outline" size={19} color={palette.brandDark} />
              </View>
              <AppText className="text-xs font-bold text-brand-dark">
                Agregar foto de tu oferta
              </AppText>
              <AppText variant="caption">Opcional · genera más confianza</AppText>
            </Pressable>

            <Field
              label="¿Qué ofreces?"
              placeholder="Ej: Taladro Bosch GSB 550 con set de brocas para concreto"
              value={details}
              onChangeText={setDetails}
              multiline
              maxLength={300}
            />

            <Field
              label="Precio (opcional)"
              placeholder="Ej: 5.000"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              hint="Déjalo vacío si prefieres acordarlo por chat."
            />

            <Field
              label="Condiciones y disponibilidad"
              placeholder="Horarios de entrega, estado del artículo, tiempo de uso..."
              value={conditions}
              onChangeText={setConditions}
              multiline
              maxLength={300}
            />

            <View className="flex-row gap-2.5 rounded-xl bg-brand-soft p-3">
              <Ionicons name="information-circle-outline" size={18} color={palette.brandDark} />
              <AppText variant="caption" className="flex-1 text-brand-dark">
                La oferta no genera un compromiso hasta que el vecino la acepte.
              </AppText>
            </View>

            <Button
              label="Enviar oferta"
              icon={<Ionicons name="send" size={16} color="#FFFFFF" />}
              onPress={() =>
                Alert.alert('Oferta lista', 'El envío real se conectará a Supabase en la Fase 5.', [
                  { text: 'Entendido' },
                ])
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
