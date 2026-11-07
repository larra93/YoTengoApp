import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';

import { AppText } from './app-text';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  className,
}: SectionHeaderProps) {
  return (
    <View className={cn('flex-row items-end justify-between gap-3', className)}>
      <View className="flex-1 gap-0.5">
        <AppText variant="subtitle">{title}</AppText>
        {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
      </View>
      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          className="flex-row items-center gap-0.5"
        >
          <AppText className="text-xs font-bold text-brand">{actionLabel}</AppText>
          <Ionicons name="chevron-forward" size={14} color="#0F766E" />
        </Pressable>
      ) : null}
    </View>
  );
}
