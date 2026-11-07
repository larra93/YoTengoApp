import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { AppText, Button, Field, Screen } from '@/components/ui';
import { cn } from '@/lib/cn';
import { MOCK_CATEGORIES } from '@/mocks/data';
import { palette } from '@/theme/tokens';
import type { DealType } from '@/types';

const DEAL_OPTIONS: { value: DealType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'rent', label: 'Arriendo', icon: 'key-outline' },
  { value: 'loan', label: 'Préstamo', icon: 'repeat-outline' },
  { value: 'swap', label: 'Trueque', icon: 'swap-horizontal-outline' },
];

interface SelectFieldProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  className?: string;
}

function SelectField({ label, value, icon, onPress, className }: SelectFieldProps) {
  return (
    <View className={cn('gap-1.5', className)}>
      <AppText variant="label">{label}</AppText>
      <Pressable
        className="flex-row items-center justify-between rounded-xl border border-line bg-surface px-3.5 py-3.5"
        onPress={onPress}
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name={icon} size={16} color={palette.brand} />
          <AppText className="text-sm font-semibold text-ink">{value}</AppText>
        </View>
        <Ionicons name="chevron-down" size={16} color={palette.placeholder} />
      </Pressable>
    </View>
  );
}

export default function PublishScreen() {
  const [dealType, setDealType] = useState<DealType>('rent');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const category = MOCK_CATEGORIES[1];

  const showComingSoon = (feature: string) => {
    Alert.alert(feature, 'Esta parte se conectará a Supabase en la Fase 4.');
  };

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
              <View className="flex-row gap-2">
                {DEAL_OPTIONS.map((option) => {
                  const active = dealType === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setDealType(option.value)}
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
            </View>

            <Field
              label="Título del pedido"
              placeholder="Ej: Taladro percutor para colgar repisas"
              value={title}
              onChangeText={setTitle}
              maxLength={80}
            />

            <SelectField
              label="Categoría"
              value={category.name}
              icon={category.icon as keyof typeof Ionicons.glyphMap}
              onPress={() => showComingSoon('Categoría')}
            />

            <View className="flex-row gap-3">
              <SelectField
                label="Desde"
                value="Vie 13 nov"
                icon="calendar-outline"
                className="flex-1"
                onPress={() => showComingSoon('Fecha de inicio')}
              />
              <SelectField
                label="Hasta"
                value="Dom 15 nov"
                icon="calendar-outline"
                className="flex-1"
                onPress={() => showComingSoon('Fecha de término')}
              />
            </View>

            <Field
              label="Descripción"
              placeholder="Describe qué necesitas, para qué y cualquier detalle importante..."
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={600}
              hint={`${description.length}/600 caracteres`}
            />

            <Field
              label="Presupuesto o detalle del trueque"
              placeholder="Ej: $5.000 / día o intercambio por..."
              value={budget}
              onChangeText={setBudget}
              hint="Puedes dejarlo abierto y acordarlo por chat."
            />

            <View className="gap-1.5">
              <AppText variant="label">Foto de referencia</AppText>
              <Pressable
                className="items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-7"
                onPress={() => showComingSoon('Foto de referencia')}
              >
                <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-soft">
                  <Ionicons name="camera-outline" size={21} color={palette.brandDark} />
                </View>
                <AppText className="text-xs font-bold text-brand-dark">Agregar una foto</AppText>
                <AppText variant="caption">Opcional · ayuda a recibir mejores ofertas</AppText>
              </Pressable>
            </View>

            <View className="flex-row gap-2.5 rounded-xl bg-brand-soft p-3">
              <Ionicons name="shield-checkmark-outline" size={18} color={palette.brandDark} />
              <AppText variant="caption" className="flex-1 text-brand-dark">
                Tu dirección exacta solo se comparte cuando aceptas una oferta.
              </AppText>
            </View>

            <Button
              label="Publicar pedido"
              icon={<Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />}
              onPress={() =>
                Alert.alert(
                  'Publicar pedido',
                  'La publicación se conectará a Supabase en la Fase 4.',
                  [{ text: 'Entendido' }],
                )
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
