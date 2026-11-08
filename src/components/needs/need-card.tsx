import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { AppText, Avatar, Badge, type BadgeTone } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDateRange, formatDistance, getInitials } from '@/lib/format';
import { DEAL_TYPE_ICON, DEAL_TYPE_LABEL } from '@/lib/labels';
import type { DealType, NeedWithRelations } from '@/types';

import { CategoryThumb } from './category-thumb';

const DEAL_TONE: Record<DealType, BadgeTone> = {
  rent: 'rent',
  loan: 'loan',
  swap: 'swap',
};

export interface NeedCardProps {
  need: NeedWithRelations;
  onPress?: () => void;
  className?: string;
}

export function NeedCard({ need, onPress, className }: NeedCardProps) {
  const authorName = need.author?.full_name ?? 'Vecino';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${need.title}, ${DEAL_TYPE_LABEL[need.deal_type]}`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      className={cn('rounded-card border border-line bg-surface p-3', className)}
    >
      <View className="flex-row gap-3">
        <CategoryThumb category={need.category} className="h-[96px] w-[78px] rounded-xl" />

        <View className="flex-1 gap-1.5">
          <View className="flex-row items-center justify-between gap-2">
            <Badge
              label={DEAL_TYPE_LABEL[need.deal_type]}
              tone={DEAL_TONE[need.deal_type]}
              icon={DEAL_TYPE_ICON[need.deal_type]}
            />
            {need.distance_km !== undefined ? (
              <View className="flex-row items-center gap-0.5">
                <Ionicons name="location-outline" size={11} color="#64748B" />
                <AppText variant="caption">{formatDistance(need.distance_km)}</AppText>
              </View>
            ) : null}
          </View>

          <AppText variant="subtitle" className="text-[15px]" numberOfLines={2}>
            {need.title}
          </AppText>

          <View className="flex-row flex-wrap items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar-outline" size={11} color="#64748B" />
              <AppText variant="caption">{formatDateRange(need.start_date, need.end_date)}</AppText>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="chatbubble-ellipses-outline" size={11} color="#64748B" />
              <AppText variant="caption">{need.offers_count ?? 0} ofertas</AppText>
            </View>
          </View>

          <View className="mt-0.5 flex-row items-center justify-between gap-2">
            <View className="flex-1 flex-row items-center gap-1.5">
              <Avatar size="sm" initials={getInitials(authorName)} className="h-6 w-6" />
              <AppText variant="caption" className="flex-1" numberOfLines={1}>
                {authorName}
              </AppText>
              {need.author ? (
                <>
                  <Ionicons name="star" size={10} color="#F59E0B" />
                  <AppText variant="caption">{need.author.rating_avg.toFixed(1)}</AppText>
                </>
              ) : null}
            </View>
            <AppText variant="price" className="text-brand-dark" numberOfLines={1}>
              {need.budget_or_offer_details ?? 'A convenir'}
            </AppText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
