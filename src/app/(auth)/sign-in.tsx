import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';

import { AuthShell } from '@/components/auth';
import { AppText, Button, Field } from '@/components/ui';
import { signInWithEmail } from '@/features/auth/api';
import { getAuthErrorMessage } from '@/features/auth/errors';
import { palette } from '@/theme/tokens';
import { signInSchema, type SignInValues } from '@/validation/auth';

export default function SignInScreen() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await signInWithEmail(values.email, values.password);
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
    }
  });

  return (
    <AuthShell
      title="Bienvenido de vuelta"
      subtitle="Ingresa para coordinar con tus vecinos."
      footer={
        <View className="flex-row flex-wrap justify-center gap-1">
          <AppText variant="muted">¿Aún no tienes cuenta?</AppText>
          <Pressable accessibilityRole="button" onPress={() => router.push('/sign-up')}>
            <AppText className="text-sm font-extrabold text-brand">Crear cuenta</AppText>
          </Pressable>
        </View>
      }
    >
      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Field
              label="Correo electrónico"
              placeholder="tu@correo.cl"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.email?.message}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Field
              label="Contraseña"
              placeholder="Tu contraseña"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.password?.message}
              autoCapitalize="none"
              autoComplete="current-password"
              secureTextEntry
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
          )}
        />

        {submitError ? (
          <View className="flex-row items-start gap-2 rounded-xl bg-danger-soft p-3">
            <Ionicons name="alert-circle-outline" size={17} color={palette.danger} />
            <AppText className="flex-1 text-xs font-semibold text-danger">{submitError}</AppText>
          </View>
        ) : null}

        <Button
          label="Ingresar"
          loading={isSubmitting}
          icon={<Ionicons name="log-in-outline" size={18} color="#FFFFFF" />}
          onPress={onSubmit}
          className="mt-1"
        />
      </View>
    </AuthShell>
  );
}
