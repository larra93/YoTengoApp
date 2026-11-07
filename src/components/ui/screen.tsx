import { View } from 'react-native';
import { SafeAreaView, type SafeAreaViewProps } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';
import { palette } from '@/theme/tokens';

export function Screen({
  className,
  edges = ['top'],
  style,
  children,
  ...props
}: SafeAreaViewProps & { className?: string }) {
  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: palette.bg }, style]}
      {...props}
    >
      <View className={cn('flex-1 bg-bg', className)}>{children}</View>
    </SafeAreaView>
  );
}
