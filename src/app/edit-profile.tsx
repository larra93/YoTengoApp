import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ImagePickerAsset } from 'expo-image-picker';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { AvatarPicker } from '@/components/profile';
import { AppText, Button, Field, Screen } from '@/components/ui';
import { updateProfile, uploadAvatar } from '@/features/auth/api';
import { useAuth } from '@/features/auth/auth-provider';
import { getAuthErrorMessage } from '@/features/auth/errors';
import { palette } from '@/theme/tokens';
import { profileSchema, type ProfileFormValues } from '@/validation/auth';

export default function EditProfileScreen() {
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
      router.back();
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
        <View className="flex-row items-center justify-between px-5 py-2">
          <Pressable
            accessibilityLabel="Volver"
            className="h-10 w-10 items-center justify-center rounded-full border border-line bg-surface"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={19} color={palette.ink} />
          </Pressable>
          <AppText variant="subtitle">Editar perfil</AppText>
          <View className="h-10 w-10" />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mx-5 mt-3 gap-5 rounded-card border border-line bg-surface p-5">
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
                  hint="Lo usamos para mostrarte pedidos cercanos."
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
                  hint="Opcional y visible solo cuando coordinas una entrega."
                />
              )}
            />

            <Field
              label="Correo electrónico"
              value={user?.email ?? ''}
              editable={false}
              hint="El correo no se puede cambiar desde la app."
            />

            {submitError ? (
              <View className="flex-row items-start gap-2 rounded-xl bg-danger-soft p-3">
                <Ionicons name="alert-circle-outline" size={17} color={palette.danger} />
                <AppText className="flex-1 text-xs font-semibold text-danger">
                  {submitError}
                </AppText>
              </View>
            ) : null}

            <Button label="Guardar cambios" loading={isSubmitting} onPress={onSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
