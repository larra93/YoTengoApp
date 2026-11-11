import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { View } from 'react-native';

import { AppText, Avatar, Card } from '@/components/ui';
import { getInitials } from '@/lib/format';
import type { ReviewWithRelations } from '@/types';

import { StarRating } from './star-rating';

export interface ReviewCardProps {
  review: ReviewWithRelations;
  showNeed?: boolean;
  showReviewer?: boolean;
  className?: string;
}

export function ReviewCard({
  review,
  showNeed = false,
  showReviewer = true,
  className,
}: ReviewCardProps) {
  const person = showReviewer ? review.reviewer : review.reviewee;
  const name = person?.full_name ?? 'Vecino';

  return (
    <Card className={className}>
      <View className="flex-row items-start gap-3">
        {showReviewer ? (
          <Avatar size="sm" uri={person?.avatar_url} initials={getInitials(name) || '?'} />
        ) : (
          <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-soft">
            <Ionicons name="star" size={15} color="#F59E0B" />
          </View>
        )}
        <View className="flex-1 gap-1">
          <View className="flex-row items-center justify-between gap-2">
            <AppText variant="subtitle" className="flex-1 text-[13px]" numberOfLines={1}>
              {showReviewer ? name : 'Reseña recibida'}
            </AppText>
            <AppText variant="caption" className="text-[10px]">
              {formatDistanceToNow(parseISO(review.created_at), { addSuffix: true, locale: es })}
            </AppText>
          </View>
          <StarRating value={review.rating} size={13} />
          {review.comment ? (
            <AppText variant="caption" className="text-slate-600">
              {review.comment}
            </AppText>
          ) : null}
          {showNeed && review.need ? (
            <View className="mt-1 flex-row items-center gap-1">
              <Ionicons name="pricetag-outline" size={11} color="#64748B" />
              <AppText variant="caption" className="flex-1 text-[10px]" numberOfLines={1}>
                {review.need.title}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}
