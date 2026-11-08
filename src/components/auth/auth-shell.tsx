import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { AppText, Screen } from '@/components/ui';

export interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <Screen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center gap-2 px-6 pt-8">
            <View className="h-16 w-16 overflow-hidden rounded-[22px] shadow-lg">
              <LinearGradient
                colors={['#115E59', '#0D9488'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="swap-horizontal" size={30} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <AppText className="text-[13px] font-extrabold uppercase tracking-[3px] text-brand">
              YoTengoApp
            </AppText>
          </View>

          <View className="mx-5 mt-7 rounded-card border border-line bg-surface p-5">
            <View className="gap-1">
              <AppText variant="title">{title}</AppText>
              <AppText variant="muted">{subtitle}</AppText>
            </View>
            <View className="mt-5">{children}</View>
          </View>

          {footer ? <View className="mt-5 px-6">{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
