import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { AppText } from './app-text';

export type AvatarSize = 'sm' | 'md' | 'lg';

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-20 w-20',
};

const textSizeStyles: Record<AvatarSize, string> = {
  sm: 'text-[11px]',
  md: 'text-sm',
  lg: 'text-2xl',
};

export interface AvatarProps {
  initials: string;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

export function Avatar({ initials, size = 'md', online, className }: AvatarProps) {
  return (
    <View
      className={cn(
        'relative items-center justify-center rounded-full bg-brand',
        sizeStyles[size],
        className,
      )}
    >
      <AppText className={cn('font-extrabold text-white', textSizeStyles[size])}>
        {initials}
      </AppText>
      {online ? (
        <View className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-green-500" />
      ) : null}
    </View>
  );
}
