import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { AppText } from './app-text';

export type BadgeTone = 'rent' | 'loan' | 'swap' | 'neutral' | 'success' | 'open' | 'danger';

const toneStyles: Record<BadgeTone, string> = {
  rent: 'bg-blue-100',
  loan: 'bg-amber-100',
  swap: 'bg-violet-100',
  neutral: 'bg-slate-100',
  success: 'bg-green-100',
  open: 'bg-brand-soft',
  danger: 'bg-danger-soft',
};

const textToneStyles: Record<BadgeTone, string> = {
  rent: 'text-blue-700',
  loan: 'text-amber-800',
  swap: 'text-violet-700',
  neutral: 'text-slate-600',
  success: 'text-green-700',
  open: 'text-brand-dark',
  danger: 'text-danger',
};

const iconToneColors: Record<BadgeTone, string> = {
  rent: '#1D4ED8',
  loan: '#92400E',
  swap: '#6D28D9',
  neutral: '#475569',
  success: '#15803D',
  open: '#115E59',
  danger: '#B91C1C',
};

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
}

export function Badge({ label, tone = 'neutral', icon, className }: BadgeProps) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-1 rounded-md px-2 py-1',
        toneStyles[tone],
        className,
      )}
    >
      {icon ? <Ionicons name={icon} size={10} color={iconToneColors[tone]} /> : null}
      <AppText
        variant="caption"
        className={cn('text-[10px] uppercase tracking-wide', textToneStyles[tone])}
      >
        {label}
      </AppText>
    </View>
  );
}
