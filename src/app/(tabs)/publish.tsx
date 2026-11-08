import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { AppText, Button, Field, Screen } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { getNeedErrorMessage } from '@/features/needs/errors';
import { useCategories, useCreateNeed } from '@/features/needs/use-needs';
import { useViewerLocation } from '@/features/needs/use-viewer-location';
import { cn } from '@/lib/cn';
import { palette } from '@/theme/tokens';
import type { DealType } from '@/types';
import { needFormSchema, type NeedFormValues } from '@/validation/needs';

const DEAL_OPTIONS: { value: DealType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'rent', label: 'Arriendo', icon: 'key-outline' },
  { value: 'loan', label: 'Préstamo', icon: 'repeat-outline' },
  { value: 'swap', label: 'Trueque', icon: 'swap-horizontal-outline' },
];

export default function PublishScreen() {
  'use no memo';
  const router = useRouter();
  const { user, profile } = useAuth();
  const categoriesQuery = useCategories();
  const createNeed = useCreateNeed();
  const { requestLocation, isRequesting } = useViewerLocation();
  const [imageAsset, setImageAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NeedFormValues, any, NeedFormValues>({
    resolver: zodResolver(needFormSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: 0,
      dealType: 'rent',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      budget: '',
      addressLabel: profile?.neighborhood ?? '',
    },
  });
  const categoryId = useWatch({ control, name: 'categoryId' });

  useEffect(() => {
    if (!categoryId && categoriesQuery.data?.[0]) {
      setValue('categoryId', categoriesQuery.data[0].id);
    }
  }, [categoriesQuery.data, categoryId, setValue]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tus fotos para agregar una imagen.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageAsset(result.assets[0]);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!user) {
      return;
    }

    setSubmitError(null);

    try {
      const location = await requestLocation();
      const result = await createNeed.mutateAsync({
        userId: user.id,
        input: {
          title: values.title,
          description: values.description,
          categoryId: values.categoryId,
          dealType: values.dealType,
          startDate: values.startDate,
          endDate: values.endDate || undefined,
          budget: values.budget || undefined,
          addressLabel: values.addressLabel || undefined,
          imageAsset,
          latitude: location?.latitude,
          longitude: location?.longitude,
        },
      });

      reset({
        title: '',
        description: '',
        categoryId: categoriesQuery.data?.[0]?.id ?? 0,
        dealType: values.dealType,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: '',
        budget: '',
        addressLabel: values.addressLabel,
      });
      setImageAsset(null);

      if (result?.id) {
        router.push({ pathname: '/need/[id]', params: { id: result.id } });
      } else {
        router.push('/');
      }
    } catch (error) {
      setSubmitError(getNeedErrorMessage(error));
    }
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View className="gap-1 px-5 pt-2">
            <AppText variant="caption" className="uppercase tracking-[2px]">
              Nuevo pedido
            </AppText>
            <AppText variant="title">Publica lo que necesitas</AppText>
            <AppText variant="muted">
              Cuéntale a tus vecinos qué buscas y cómo prefieres acordarlo.
            </AppText>
          </View>

          <View className="mt-5 gap-4 px-5">
            <View className="gap-1.5">
              <AppText variant="label">¿Cómo quieres resolverlo?</AppText>
              <Controller
                control={control}
                name="dealType"
                render={({ field }) => (
                  <View className="flex-row gap-2">
                    {DEAL_OPTIONS.map((option) => {
                      const active = field.value === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => field.onChange(option.value)}
                          className={cn(
                            'flex-1 items-center gap-1 rounded-xl border px-2 py-3',
                            active ? 'border-brand bg-brand-soft' : 'border-line bg-surface',
                          )}
                        >
                          <Ionicons
                            name={option.icon}
                            size={18}
                            color={active ? palette.brandDark : palette.muted}
                          />
                          <AppText
                            className={cn(
                              'text-[11px] font-bold',
                              active ? 'text-brand-dark' : 'text-muted',
                            )}
                          >
                            {option.label}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
            </View>

            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <Field
                  label="Título del pedido"
                  placeholder="Ej: Taladro percutor para colgar repisas"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.title?.message}
                  maxLength={120}
                />
              )}
            />

            <View className="gap-1.5">
              <AppText variant="label">Categoría</AppText>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {(categoriesQuery.data ?? []).map((category) => {
                      const active = field.value === category.id;
                      return (
                        <Pressable
                          key={category.id}
                          className={cn(
                            'flex-row items-center gap-1.5 rounded-full border px-3 py-2',
                            active ? 'border-brand bg-brand-soft' : 'border-line bg-surface',
                          )}
                          onPress={() => field.onChange(category.id)}
                        >
                          <Ionicons
                            name={category.icon as keyof typeof Ionicons.glyphMap}
                            size={14}
                            color={active ? palette.brandDark : palette.brand}
                          />
                          <AppText
                            className={cn(
                              'text-xs font-bold',
                              active ? 'text-brand-dark' : 'text-slate-600',
                            )}
                          >
                            {category.name}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                )}
              />
              {errors.categoryId ? (
                <AppText variant="caption" className="text-danger">
                  {errors.categoryId.message}
                </AppText>
              ) : null}
            </View>

            <View className="flex-row gap-3">
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <View className="flex-1">
                    <Field
                      label="Desde"
                      placeholder="AAAA-MM-DD"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.startDate?.message}
                      autoCapitalize="none"
                    />
                  </View>
                )}
              />
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <View className="flex-1">
                    <Field
                      label="Hasta"
                      placeholder="Opcional"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.endDate?.message}
                      autoCapitalize="none"
                    />
                  </View>
                )}
              />
            </View>

            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Field
                  label="Descripción"
                  placeholder="Describe qué necesitas, para qué y cualquier detalle importante..."
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.description?.message}
                  multiline
                  maxLength={2000}
                  hint={`${field.value.length}/2000 caracteres`}
                />
              )}
            />

            <Controller
              control={control}
              name="budget"
              render={({ field }) => (
                <Field
                  label="Presupuesto o detalle del trueque"
                  placeholder="Ej: $5.000 / día o intercambio por..."
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.budget?.message}
                  hint="Puedes dejarlo abierto y acordarlo por chat."
                />
              )}
            />

            <Controller
              control={control}
              name="addressLabel"
              render={({ field }) => (
                <Field
                  label="Referencia de ubicación"
                  placeholder="Ej: Plaza Ñuñoa, Providencia"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.addressLabel?.message}
                  hint="Comparte una referencia aproximada. Tu dirección exacta no se publica."
                />
              )}
            />

            <View className="gap-1.5">
              <AppText variant="label">Foto de referencia</AppText>
              <Pressable
                className="items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50"
                onPress={pickImage}
              >
                {imageAsset ? (
                  <View className="w-full">
                    <Image
                      source={imageAsset.uri}
                      style={{ height: 160, width: '100%' }}
                      contentFit="cover"
                    />
                    <View className="items-center py-3">
                      <AppText className="text-xs font-bold text-brand-dark">Cambiar foto</AppText>
                    </View>
                  </View>
                ) : (
                  <View className="items-center gap-1.5 py-7">
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-soft">
                      <Ionicons name="camera-outline" size={21} color={palette.brandDark} />
                    </View>
                    <AppText className="text-xs font-bold text-brand-dark">
                      Agregar una foto
                    </AppText>
                    <AppText variant="caption">Opcional · ayuda a recibir mejores ofertas</AppText>
                  </View>
                )}
              </Pressable>
            </View>

            <View className="flex-row gap-2.5 rounded-xl bg-brand-soft p-3">
              <Ionicons name="shield-checkmark-outline" size={18} color={palette.brandDark} />
              <AppText variant="caption" className="flex-1 text-brand-dark">
                Usamos tu ubicación aproximada para mostrar el pedido a vecinos cercanos. La
                dirección exacta se comparte solo al aceptar una oferta.
              </AppText>
            </View>

            {submitError ? (
              <View className="flex-row items-start gap-2 rounded-xl bg-danger-soft p-3">
                <Ionicons name="alert-circle-outline" size={17} color={palette.danger} />
                <AppText className="flex-1 text-xs font-semibold text-danger">
                  {submitError}
                </AppText>
              </View>
            ) : null}

            <Button
              label={isRequesting ? 'Obteniendo ubicación...' : 'Publicar pedido'}
              loading={isSubmitting || createNeed.isPending}
              icon={<Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />}
              onPress={onSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
