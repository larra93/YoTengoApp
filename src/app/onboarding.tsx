import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ImagePickerAsset } from 'expo-image-picker';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { AvatarPicker } from '@/components/profile';
import { AppText, Button, Field, Screen } from '@/components/ui';
import { uploadAvatar, updateProfile } from '@/features/auth/api';
import { useAuth } from '@/features/auth/auth-provider';
import { getAuthErrorMessage } from '@/features/auth/errors';
import { palette } from '@/theme/tokens';
import { profileSchema, type ProfileFormValues } from '@/validation/auth';

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [avatarAsset, setAvatarAsset] = useState<ImagePickerAsset | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatar_url ?? null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name ?? '',
      neighborhood: profile?.neighborhood ?? '',
      phone: profile?.phone ?? '',
    },
  });

  const firstName = profile?.full_name.trim().split(' ')[0] || 'vecino';

  const onSubmit = handleSubmit(async (values) => {
    if (!user) {
      return;
    }

    setSubmitError(null);

    try {
      const avatarUrl = avatarAsset
        ? await uploadAvatar(user.id, avatarAsset)
        : (profile?.avatar_url ?? null);

      await updateProfile(user.id, {
        full_name: values.fullName,
        neighborhood: values.neighborhood,
        phone: values.phone || null,
        avatar_url: avatarUrl,
      });
      await refreshProfile();
      router.replace('/');
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
    }
  });

  const handlePickAvatar = (asset: ImagePickerAsset) => {
    setAvatarAsset(asset);
    setAvatarUri(asset.uri);
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-1 px-5 pt-4">
            <AppText variant="caption" className="uppercase tracking-[2px]">
              Bienvenido, {firstName}
            </AppText>
            <AppText variant="title">Completa tu perfil</AppText>
            <AppText variant="muted">
              Cuéntanos un poco de ti para que tus vecinos sepan con quién están tratando.
            </AppText>
          </View>

          <View className="mx-5 mt-5 gap-5 rounded-card border border-line bg-surface p-5">
            <AvatarPicker
              name={profile?.full_name ?? ''}
              uri={avatarUri}
              onPick={handlePickAvatar}
            />

            <View className="h-px bg-line" />

            <Controller
              control={control}
              name="fullName"
              render={({ field }) => (
                <Field
                  label="Nombre completo"
                  placeholder="Ej: Camila Rojas"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.fullName?.message}
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                />
              )}
            />

            <Controller
              control={control}
              name="neighborhood"
              render={({ field }) => (
                <Field
                  label="Barrio o comuna"
                  placeholder="Ej: Ñuñoa, Santiago"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.neighborhood?.message}
                  autoCapitalize="words"
                  hint="Lo usaremos para mostrarte pedidos cercanos."
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Field
                  label="Teléfono"
                  placeholder="Ej: +56 9 5555 1234"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  hint="Opcional. Solo se comparte cuando coordinas una entrega."
                />
              )}
            />

            {submitError ? (
              <View className="flex-row items-start gap-2 rounded-xl bg-danger-soft p-3">
                <Ionicons name="alert-circle-outline" size={17} color={palette.danger} />
                <AppText className="flex-1 text-xs font-semibold text-danger">
                  {submitError}
                </AppText>
              </View>
            ) : null}

            <View className="flex-row items-start gap-2.5 rounded-xl bg-brand-soft p-3">
              <Ionicons name="shield-checkmark-outline" size={18} color={palette.brandDark} />
              <AppText variant="caption" className="flex-1 text-brand-dark">
                Tu dirección exacta nunca se muestra en el feed. Compartes solo tu barrio.
              </AppText>
            </View>

            <Button label="Continuar" loading={isSubmitting} onPress={onSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
