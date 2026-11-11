import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import type { ImagePickerAsset } from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

import { CategoryThumb } from '@/components/needs';
import { AppText, Button, Field, Screen } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { useNeedDetail } from '@/features/needs/use-needs';
import { getOfferErrorMessage } from '@/features/offers/errors';
import { useCreateOffer } from '@/features/offers/use-offers';
import { formatDateRange } from '@/lib/format';
import { DEAL_TYPE_LABEL } from '@/lib/labels';
import { palette } from '@/theme/tokens';
import { offerSchema, type OfferFormValues } from '@/validation/offers';

export default function OfferScreen() {
  'use no memo';
  const { needId } = useLocalSearchParams<{ needId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const resolvedNeedId = Array.isArray(needId) ? needId[0] : needId;
  const needQuery = useNeedDetail(resolvedNeedId);
  const createOffer = useCreateOffer();
  const [imageAsset, setImageAsset] = useState<ImagePickerAsset | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OfferFormValues, any, OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      price: '',
      swapOfferedDetails: '',
      conditions: '',
    },
  });

  const need = needQuery.data;
  const isOwnNeed = Boolean(user?.id && need?.user_id === user.id);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permiso necesario',
        'Necesitamos acceso a tus fotos para agregar una imagen a tu oferta.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageAsset(result.assets[0]);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!user?.id || !resolvedNeedId) {
      return;
    }

    setFeedback(null);

    try {
      await createOffer.mutateAsync({
        needId: resolvedNeedId,
        supplierId: user.id,
        priceOffered: values.price ? Number(values.price) : null,
        swapOfferedDetails: values.swapOfferedDetails?.trim(),
        conditions: values.conditions?.trim(),
        imageAsset,
      });

      Alert.alert('Oferta enviada', 'Tu oferta ya está disponible para el vecino.', [
        { text: 'Ver negociaciones', onPress: () => router.replace('/(tabs)/negotiations') },
        { text: 'Volver', onPress: () => router.back() },
      ]);
    } catch (error) {
      setFeedback(getOfferErrorMessage(error));
    }
  });

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
            <AppText variant="caption">El vecino recibirá tu propuesta</AppText>
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
            {isOwnNeed ? (
              <View className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <AppText className="text-xs font-semibold text-amber-800">
                  No puedes enviar una oferta a tu propio pedido.
                </AppText>
              </View>
            ) : null}

            <View className="gap-1">
              <AppText variant="subtitle">Cuéntale qué puedes ofrecer</AppText>
              <AppText variant="muted">
                Sé claro con las condiciones para que puedan coordinar rápido.
              </AppText>
            </View>

            <Pressable
              className="items-center justify-center gap-1.5 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50"
              onPress={handlePickImage}
              disabled={isOwnNeed}
            >
              {imageAsset?.uri ? (
                <Image
                  source={{ uri: imageAsset.uri }}
                  style={{ width: '100%', height: 160 }}
                  contentFit="cover"
                />
              ) : (
                <View className="items-center gap-1.5 py-6">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-soft">
                    <Ionicons name="camera-outline" size={19} color={palette.brandDark} />
                  </View>
                  <AppText className="text-xs font-bold text-brand-dark">
                    Agregar foto de tu oferta
                  </AppText>
                  <AppText variant="caption">Opcional · genera más confianza</AppText>
                </View>
              )}
            </Pressable>

            <Controller
              control={control}
              name="swapOfferedDetails"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="¿Qué ofreces?"
                  placeholder="Ej: Taladro Bosch GSB 550 con set de brocas para concreto"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.swapOfferedDetails?.message}
                  multiline
                  maxLength={180}
                />
              )}
            />

            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="Precio (opcional)"
                  placeholder="Ej: 5000"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.price?.message}
                  keyboardType="numeric"
                  hint="Déjalo vacío si prefieres acordarlo por chat."
                />
              )}
            />

            <Controller
              control={control}
              name="conditions"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="Condiciones y disponibilidad"
                  placeholder="Horarios de entrega, estado del artículo, tiempo de uso..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.conditions?.message}
                  multiline
                  maxLength={500}
                />
              )}
            />

            {feedback ? (
              <View className="rounded-xl border border-danger/20 bg-danger-soft p-3">
                <AppText className="text-xs font-semibold text-danger">{feedback}</AppText>
              </View>
            ) : null}

            <View className="flex-row gap-2.5 rounded-xl bg-brand-soft p-3">
              <Ionicons name="information-circle-outline" size={18} color={palette.brandDark} />
              <AppText variant="caption" className="flex-1 text-brand-dark">
                La oferta no genera un compromiso hasta que el vecino la acepte.
              </AppText>
            </View>

            <Button
              label="Enviar oferta"
              loading={createOffer.isPending}
              disabled={isOwnNeed || need.status !== 'open'}
              icon={<Ionicons name="send" size={16} color="#FFFFFF" />}
              onPress={onSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
