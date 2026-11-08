import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';

import { AuthShell } from '@/components/auth';
import { AppText, Button, Field } from '@/components/ui';
import { resendConfirmationEmail, signUpWithEmail } from '@/features/auth/api';
import { getAuthErrorMessage } from '@/features/auth/errors';
import { palette } from '@/theme/tokens';
import { signUpSchema, type SignUpValues } from '@/validation/auth';

export default function SignUpScreen() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [awaitingEmail, setAwaitingEmail] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      const data = await signUpWithEmail(values.fullName, values.email, values.password);

      if (!data.session) {
        setAwaitingEmail(values.email);
      }
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
    }
  });

  const handleResend = async () => {
    if (!awaitingEmail) {
      return;
    }

    setResendError(null);
    setResendMessage(null);
    setIsResending(true);

    try {
      await resendConfirmationEmail(awaitingEmail);
      setResendMessage('Te enviamos un nuevo enlace de confirmación.');
    } catch (error) {
      setResendError(getAuthErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  if (awaitingEmail) {
    return (
      <AuthShell
        title="Revisa tu correo"
        subtitle="Solo falta confirmar tu cuenta para empezar."
        footer={
          <View className="items-center">
            <AppText variant="caption" className="text-center">
              ¿No llega el correo? Revisa spam o vuelve a enviarlo.
            </AppText>
          </View>
        }
      >
        <View className="items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-soft">
            <Ionicons name="mail-unread-outline" size={30} color={palette.brandDark} />
          </View>
          <AppText className="text-center text-sm text-slate-600">
            Enviamos un enlace de confirmación a
          </AppText>
          <AppText className="text-center text-sm font-extrabold text-ink">{awaitingEmail}</AppText>

          {resendMessage ? (
            <View className="w-full rounded-xl bg-green-100 p-3">
              <AppText className="text-center text-xs font-semibold text-green-700">
                {resendMessage}
              </AppText>
            </View>
          ) : null}

          {resendError ? (
            <View className="w-full rounded-xl bg-danger-soft p-3">
              <AppText className="text-center text-xs font-semibold text-danger">
                {resendError}
              </AppText>
            </View>
          ) : null}

          <Button
            label="Reenviar correo"
            variant="secondary"
            loading={isResending}
            onPress={handleResend}
            className="w-full"
          />
          <Button
            label="Ir a iniciar sesión"
            icon={<Ionicons name="arrow-forward" size={17} color="#FFFFFF" />}
            onPress={() => router.replace('/sign-in')}
            className="w-full"
          />
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Únete a tu barrio"
      subtitle="Publica lo que necesitas y ayuda a tus vecinos."
      footer={
        <View className="flex-row flex-wrap justify-center gap-1">
          <AppText variant="muted">¿Ya tienes cuenta?</AppText>
          <Pressable accessibilityRole="button" onPress={() => router.push('/sign-in')}>
            <AppText className="text-sm font-extrabold text-brand">Ingresar</AppText>
          </Pressable>
        </View>
      }
    >
      <View className="gap-4">
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
              returnKeyType="next"
            />
          )}
        />

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
              placeholder="Mínimo 8 caracteres"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.password?.message}
              autoCapitalize="none"
              autoComplete="new-password"
              secureTextEntry
              textContentType="newPassword"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <Field
              label="Repite la contraseña"
              placeholder="Vuelve a escribirla"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.confirmPassword?.message}
              autoCapitalize="none"
              autoComplete="new-password"
              secureTextEntry
              textContentType="newPassword"
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
          label="Crear cuenta"
          loading={isSubmitting}
          icon={<Ionicons name="person-add-outline" size={18} color="#FFFFFF" />}
          onPress={onSubmit}
          className="mt-1"
        />
      </View>
    </AuthShell>
  );
}
