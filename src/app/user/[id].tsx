import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { NeedCard } from '@/components/needs';
import { ReviewCard, StarRating } from '@/components/reviews';
import { AppText, Avatar, Badge, Button, Screen, SectionHeader } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { useOpenNeedsByUser } from '@/features/needs/use-needs';
import { useProfileStats } from '@/features/profile/use-profile-stats';
import { usePublicProfile } from '@/features/profile/use-public-profile';
import { useReviewsForUser } from '@/features/reviews/use-reviews';
import { cn } from '@/lib/cn';
import { getInitials } from '@/lib/format';
import { palette } from '@/theme/tokens';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const userId = Array.isArray(id) ? id[0] : id;
  const isOwnProfile = userId === user?.id;

  const profileQuery = usePublicProfile(userId);
  const statsQuery = useProfileStats(userId);
  const needsQuery = useOpenNeedsByUser(userId);
  const reviewsQuery = useReviewsForUser(userId);

  const profile = profileQuery.data;
  const fullName = profile?.full_name?.trim() || 'Vecino';
  const neighborhood = profile?.neighborhood?.trim() || 'Sin barrio';
  const reviews = reviewsQuery.data ?? [];
  const needs = needsQuery.data ?? [];
  const stats = [
    { label: 'Pedidos', value: statsQuery.data ? statsQuery.data.needs : '—' },
    { label: 'Ofertas', value: statsQuery.data ? statsQuery.data.offers : '—' },
    { label: 'Matches', value: statsQuery.data ? statsQuery.data.matches : '—' },
  ];

  if (profileQuery.isLoading) {
    return (
      <Screen className="items-center justify-center gap-3">
        <ActivityIndicator size="large" color={palette.brand} />
        <AppText variant="muted">Cargando perfil...</AppText>
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen className="items-center justify-center gap-4 px-8">
        <Ionicons name="person-outline" size={30} color={palette.placeholder} />
        <AppText variant="title" className="text-center">
          No encontramos este perfil
        </AppText>
        <Button label="Volver" onPress={() => router.back()} />
      </Screen>
    );
  }

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
          <AppText variant="subtitle">Perfil</AppText>
          <AppText variant="caption">{isOwnProfile ? 'Así te ven tus vecinos' : 'Vecino'}</AppText>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="px-5">
          <View className="overflow-hidden rounded-card">
            <View className="bg-brand p-5">
              <View className="flex-row items-center gap-3">
                <Avatar
                  size="lg"
                  uri={profile.avatar_url}
                  initials={getInitials(fullName) || '?'}
                  className="border-2 border-white/40"
                />
                <View className="flex-1 gap-1">
                  <AppText className="text-xl font-extrabold text-white">{fullName}</AppText>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="location-outline" size={12} color="#CCFBF1" />
                    <AppText className="text-[11px] font-semibold text-teal-50">
                      {neighborhood}
                    </AppText>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <StarRating value={Math.round(Number(profile.rating_avg))} size={13} />
                    <AppText className="text-[11px] font-bold text-white">
                      {Number(profile.rating_avg).toFixed(1)} · {profile.rating_count} reseñas
                    </AppText>
                  </View>
                </View>
              </View>

              <View className="mt-5 flex-row rounded-xl bg-white/10 p-3">
                {stats.map((stat, index) => (
                  <View
                    key={stat.label}
                    className={cn(
                      'flex-1 items-center gap-0.5',
                      index < stats.length - 1 && 'border-r border-white/20',
                    )}
                  >
                    <AppText className="text-lg font-extrabold text-white">{stat.value}</AppText>
                    <AppText className="text-[10px] font-semibold uppercase tracking-wide text-teal-50">
                      {stat.label}
                    </AppText>
                  </View>
                ))}
              </View>

              <AppText className="mt-3 text-[10px] text-teal-50/80">
                Vecino desde {format(parseISO(profile.created_at), 'MMMM yyyy', { locale: es })}
              </AppText>
            </View>
          </View>
        </View>

        <SectionHeader
          className="mt-6 px-5"
          title="Pedidos abiertos"
          subtitle={needs.length > 0 ? `${needs.length} publicados` : undefined}
        />

        <View className="mt-3 gap-3 px-5">
          {needsQuery.isLoading ? (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-8">
              <ActivityIndicator size="small" color={palette.brand} />
              <AppText variant="muted">Cargando pedidos...</AppText>
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
            <View className="items-center gap-1 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-8">
              <Ionicons name="file-tray-outline" size={26} color={palette.placeholder} />
              <AppText variant="caption" className="text-center">
                Sin pedidos abiertos ahora.
              </AppText>
            </View>
          )}
        </View>

        <SectionHeader
          className="mt-6 px-5"
          title="Reseñas"
          subtitle={reviews.length > 0 ? `${profile.rating_count} en total` : undefined}
        />

        <View className="mt-3 gap-3 px-5">
          {reviewsQuery.isLoading ? (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-8">
              <ActivityIndicator size="small" color={palette.brand} />
              <AppText variant="muted">Cargando reseñas...</AppText>
            </View>
          ) : reviews.length > 0 ? (
            reviews.slice(0, 5).map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                showNeed
                onReviewerPress={
                  review.reviewer_id !== userId
                    ? () =>
                        router.push({
                          pathname: '/user/[id]',
                          params: { id: review.reviewer_id },
                        })
                    : undefined
                }
              />
            ))
          ) : (
            <View className="items-center gap-1 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-8">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-soft">
                <Ionicons name="star-outline" size={17} color={palette.brandDark} />
              </View>
              <AppText variant="caption" className="text-center">
                Aún no tiene reseñas.
              </AppText>
            </View>
          )}
        </View>

        {isOwnProfile ? (
          <View className="mx-5 mt-5">
            <Badge label="Este es tu perfil público" tone="success" />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
