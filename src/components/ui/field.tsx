import { TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/lib/cn';
import { palette } from '@/theme/tokens';

import { AppText } from './app-text';

export interface FieldProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
}

export function Field({
  label,
  hint,
  error,
  className,
  containerClassName,
  multiline,
  ...props
}: FieldProps) {
  return (
    <View className={cn('gap-1.5', containerClassName)}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        multiline={multiline}
        placeholderTextColor={palette.placeholder}
        textAlignVertical={multiline ? 'top' : 'center'}
        className={cn(
          'min-h-12 rounded-xl border border-line bg-surface px-3.5 text-sm font-semibold text-ink',
          error && 'border-danger',
          multiline && 'min-h-28 py-3',
          className,
        )}
        {...props}
      />
      {error ? (
        <AppText className="text-[11px] font-semibold text-danger">{error}</AppText>
      ) : hint ? (
        <AppText variant="caption">{hint}</AppText>
      ) : null}
    </View>
  );
}
