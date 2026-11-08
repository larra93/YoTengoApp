import { Image } from 'expo-image';
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
  uri?: string | null;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

export function Avatar({ initials, uri, size = 'md', online, className }: AvatarProps) {
  return (
    <View
      className={cn(
        'relative items-center justify-center overflow-hidden rounded-full bg-brand',
        sizeStyles[size],
        className,
      )}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <AppText className={cn('font-extrabold text-white', textSizeStyles[size])}>
          {initials}
        </AppText>
      )}
      {online ? (
        <View className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-surface bg-green-500" />
      ) : null}
    </View>
  );
}
