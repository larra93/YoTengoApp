import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
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

import { StarRating } from '@/components/reviews';
import { AppText, Avatar, Button, Field, Screen } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { useNeedDetail } from '@/features/needs/use-needs';
import { useNeedOffers } from '@/features/offers/use-offers';
import { getReviewErrorMessage } from '@/features/reviews/errors';
import { useCreateReview, useReviewsByNeed } from '@/features/reviews/use-reviews';
import { getInitials } from '@/lib/format';
import { palette } from '@/theme/tokens';
import { reviewSchema, type ReviewFormValues } from '@/validation/reviews';

export default function ReviewScreen() {
  'use no memo';
  const { needId } = useLocalSearchParams<{ needId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const resolvedNeedId = Array.isArray(needId) ? needId[0] : needId;
  const needQuery = useNeedDetail(resolvedNeedId);
  const offersQuery = useNeedOffers(resolvedNeedId);
  const reviewsQuery = useReviewsByNeed(resolvedNeedId);
  const createReview = useCreateReview();
  const [feedback, setFeedback] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormValues, any, ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  const need = needQuery.data;
  const acceptedOffer = (offersQuery.data ?? []).find((offer) => offer.status === 'accepted');
  const isOwner = Boolean(user?.id && need?.user_id === user.id);
  const isSupplier = Boolean(user?.id && acceptedOffer?.supplier_id === user.id);
  const isParticipant = isOwner || isSupplier;
  const myReview = (reviewsQuery.data ?? []).find((review) => review.reviewer_id === user?.id);
  const target = isOwner ? acceptedOffer?.supplier : need?.author;
  const targetName = target?.full_name ?? 'tu vecino';

  const onSubmit = handleSubmit(async (values) => {
    if (!resolvedNeedId) {
      return;
    }

    setFeedback(null);

    try {
      await createReview.mutateAsync({
        needId: resolvedNeedId,
        rating: values.rating,
        comment: values.comment?.trim(),
      });

      Alert.alert('Gracias por tu reseña', 'Tu calificación ayuda a la comunidad.', [
        { text: 'Volver', onPress: () => router.back() },
      ]);
    } catch (error) {
      setFeedback(getReviewErrorMessage(error));
    }
  });

  if (needQuery.isLoading || offersQuery.isLoading || reviewsQuery.isLoading) {
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

  if (need.status !== 'completed' || !isParticipant) {
    return (
      <Screen className="items-center justify-center gap-4 px-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Ionicons name="lock-closed-outline" size={28} color={palette.muted} />
        </View>
        <AppText variant="title" className="text-center">
          La reseña no está disponible
        </AppText>
        <AppText variant="muted" className="text-center">
          Solo quienes participaron del trato pueden calificar cuando el pedido está completado.
        </AppText>
        <Button
          label="Ver pedido"
          onPress={() => router.push({ pathname: '/need/[id]', params: { id: need.id } })}
        />
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
            <AppText variant="subtitle">Calificar trato</AppText>
            <AppText variant="caption" numberOfLines={1}>
              {need.title}
            </AppText>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View className="mx-5 mt-3 flex-row items-center gap-3 rounded-card border border-line bg-surface p-4">
            <Avatar size="md" uri={target?.avatar_url} initials={getInitials(targetName) || '?'} />
            <View className="flex-1 gap-0.5">
              <AppText variant="caption">¿Cómo fue tu experiencia con</AppText>
              <AppText variant="subtitle" className="text-[15px]">
                {targetName}
              </AppText>
            </View>
          </View>

          {myReview ? (
            <View className="mx-5 mt-5 items-center gap-3 rounded-card border border-line bg-surface p-6">
              <Ionicons name="checkmark-circle" size={34} color={palette.brand} />
              <AppText variant="subtitle" className="text-center">
                Ya calificaste este trato
              </AppText>
              <StarRating value={myReview.rating} size={22} />
              {myReview.comment ? (
                <AppText variant="muted" className="text-center">
                  “{myReview.comment}”
                </AppText>
              ) : null}
            </View>
          ) : (
            <View className="mt-6 items-center gap-3 px-5">
              <AppText variant="subtitle">Tu calificación</AppText>
              <Controller
                control={control}
                name="rating"
                render={({ field: { onChange, value } }) => (
                  <StarRating value={value} onChange={onChange} size={40} />
                )}
              />
              {errors.rating ? (
                <AppText className="text-[11px] font-semibold text-danger">
                  {errors.rating.message}
                </AppText>
              ) : null}

              <View className="mt-3 w-full">
                <Controller
                  control={control}
                  name="comment"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Field
                      label="Comentario (opcional)"
                      placeholder="Cuéntale a la comunidad cómo fue la coordinación, la entrega y el trato."
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.comment?.message}
                      multiline
                      maxLength={500}
                    />
                  )}
                />
              </View>

              {feedback ? (
                <View className="w-full rounded-xl border border-danger/20 bg-danger-soft p-3">
                  <AppText className="text-xs font-semibold text-danger">{feedback}</AppText>
                </View>
              ) : null}

              <View className="mt-2 w-full flex-row gap-2.5 rounded-xl bg-brand-soft p-3">
                <Ionicons name="information-circle-outline" size={18} color={palette.brandDark} />
                <AppText variant="caption" className="flex-1 text-brand-dark">
                  Tu reseña será pública y actualizará la reputación de {targetName}.
                </AppText>
              </View>

              <Button
                label="Enviar reseña"
                loading={createReview.isPending}
                icon={<Ionicons name="star" size={16} color="#FFFFFF" />}
                onPress={onSubmit}
                className="w-full"
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
