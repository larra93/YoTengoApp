import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { palette } from '@/theme/tokens';

export interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
}

const STARS = [1, 2, 3, 4, 5] as const;

export function StarRating({ value, onChange, size = 18, className }: StarRatingProps) {
  return (
    <View className={`flex-row items-center gap-1 ${className ?? ''}`}>
      {STARS.map((star) => {
        const filled = star <= value;
        const icon = (
          <Ionicons
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? '#F59E0B' : palette.placeholder}
          />
        );

        if (!onChange) {
          return <View key={star}>{icon}</View>;
        }

        return (
          <Pressable
            key={star}
            accessibilityRole="button"
            accessibilityLabel={`${star} estrella${star === 1 ? '' : 's'}`}
            onPress={() => onChange(star)}
            hitSlop={6}
          >
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}
