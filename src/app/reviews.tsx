import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { ReviewCard, StarRating } from '@/components/reviews';
import { AppText, Screen, SectionHeader } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { useReviewsForUser } from '@/features/reviews/use-reviews';
import { palette } from '@/theme/tokens';

export default function ReviewsScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const reviewsQuery = useReviewsForUser(user?.id);
  const reviews = reviewsQuery.data ?? [];
  const rating = Number(profile?.rating_avg ?? 0);

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
          <AppText variant="subtitle">Reseñas y reputación</AppText>
          <AppText variant="caption">Lo que la comunidad dice de ti</AppText>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="mx-5 mt-2 items-center gap-2 rounded-card border border-line bg-surface p-5">
          <AppText className="text-4xl font-extrabold text-ink">{rating.toFixed(1)}</AppText>
          <StarRating value={Math.round(rating)} size={20} />
          <AppText variant="caption">
            {profile?.rating_count ?? 0} reseña{profile?.rating_count === 1 ? '' : 's'} recibida
            {profile?.rating_count === 1 ? '' : 's'}
          </AppText>
        </View>

        <SectionHeader
          className="mt-6 px-5"
          title="Reseñas recibidas"
          subtitle={reviews.length > 0 ? `${reviews.length} en total` : undefined}
        />

        <View className="mt-3 gap-3 px-5">
          {reviewsQuery.isLoading ? (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
              <ActivityIndicator size="small" color={palette.brand} />
              <AppText variant="muted">Cargando reseñas...</AppText>
            </View>
          ) : reviewsQuery.isError ? (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
              <Ionicons name="cloud-offline-outline" size={26} color={palette.placeholder} />
              <AppText variant="subtitle">No pudimos cargar tus reseñas</AppText>
              <AppText variant="caption" className="text-center">
                Revisa tu conexión e intenta nuevamente.
              </AppText>
            </View>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                showNeed
                showReviewer
                onReviewerPress={() =>
                  router.push({ pathname: '/user/[id]', params: { id: review.reviewer_id } })
                }
              />
            ))
          ) : (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
              <Ionicons name="star-outline" size={30} color={palette.placeholder} />
              <AppText variant="subtitle">Aún no tienes reseñas</AppText>
              <AppText variant="caption" className="text-center">
                Cuando completes un trato, la otra persona podrá calificarte.
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
