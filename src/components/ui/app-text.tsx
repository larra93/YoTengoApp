import { Text, type TextProps } from 'react-native';

import { cn } from '@/lib/cn';

export type AppTextVariant =
  'display' | 'title' | 'subtitle' | 'body' | 'label' | 'caption' | 'price' | 'muted';

const variantStyles: Record<AppTextVariant, string> = {
  display: 'text-[28px] font-extrabold tracking-tight text-ink',
  title: 'text-2xl font-extrabold tracking-tight text-ink',
  subtitle: 'text-base font-bold text-ink',
  body: 'text-sm leading-5 text-ink',
  label: 'text-xs font-bold text-slate-600',
  caption: 'text-[11px] font-semibold text-muted',
  price: 'text-sm font-extrabold text-ink',
  muted: 'text-sm text-muted',
};

export interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  className?: string;
}

export function AppText({ variant = 'body', className, ...props }: AppTextProps) {
  return <Text className={cn(variantStyles[variant], className)} {...props} />;
}
