import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';

import { AppText } from './app-text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand',
  secondary: 'bg-brand-soft',
  ghost: 'border border-line bg-surface',
  danger: 'bg-danger-soft',
};

const textVariantStyles: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-brand-dark',
  ghost: 'text-slate-600',
  danger: 'text-danger',
};

const sizeStyles: Record<ButtonSize, string> = {
  md: 'min-h-12 rounded-2xl px-5',
  sm: 'min-h-10 rounded-xl px-3.5',
};

const textSizeStyles: Record<ButtonSize, string> = {
  md: 'text-sm',
  sm: 'text-xs',
};

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  className?: string;
  textClassName?: string;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  textClassName,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={cn(
        'flex-row items-center justify-center gap-2',
        sizeStyles[size],
        variantStyles[variant],
        disabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      {icon}
      <AppText
        className={cn(
          'text-center font-extrabold',
          textSizeStyles[size],
          textVariantStyles[variant],
          textClassName,
        )}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
