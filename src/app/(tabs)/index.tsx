import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { NeedCard } from '@/components/needs';
import { AppText, Avatar, Screen, SectionHeader } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { getInitials } from '@/lib/format';
import { CURRENT_USER_ID, MOCK_CATEGORIES, MOCK_NEEDS } from '@/mocks/data';
import { palette } from '@/theme/tokens';

export default function ExploreScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const nearbyNeeds = MOCK_NEEDS.filter((need) => need.user_id !== CURRENT_USER_ID);
  const fullName = profile?.full_name?.trim() || 'vecino';
  const firstName = fullName.split(' ')[0];
  const neighborhood = profile?.neighborhood?.trim() || 'Elige tu barrio';

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="flex-row items-start justify-between px-5 pt-2">
          <View className="flex-1 gap-0.5">
            <AppText variant="caption" className="uppercase tracking-[2px]">
              YoTengoApp
            </AppText>
            <AppText variant="display" className="text-[26px]">
              Hola, {firstName}
            </AppText>
            <Pressable
              className="mt-1 flex-row items-center gap-1 self-start"
              onPress={() => router.push('/edit-profile')}
            >
              <Ionicons name="location-sharp" size={13} color={palette.brand} />
              <AppText variant="caption">{neighborhood}</AppText>
              <Ionicons name="chevron-down" size={12} color={palette.muted} />
            </Pressable>
          </View>

          <View className="flex-row items-center gap-2.5">
            <Pressable
              accessibilityLabel="Notificaciones"
              className="h-11 w-11 items-center justify-center rounded-full border border-line bg-surface"
              onPress={() =>
                Alert.alert('Notificaciones', 'Todavía no tienes notificaciones nuevas.')
              }
            >
              <Ionicons name="notifications-outline" size={20} color={palette.ink} />
              <View className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-accent" />
            </Pressable>
            <Pressable accessibilityLabel="Ir al perfil" onPress={() => router.push('/profile')}>
              <Avatar size="md" uri={profile?.avatar_url} initials={getInitials(fullName) || '?'} />
            </Pressable>
          </View>
        </View>

        <Pressable
          className="mx-5 mt-4 flex-row items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3"
          onPress={() =>
            Alert.alert('Buscar', 'La búsqueda llegará con la conexión a Supabase en la Fase 4.')
          }
        >
          <Ionicons name="search" size={18} color={palette.muted} />
          <AppText variant="muted" className="flex-1 text-[13px]">
            ¿Qué necesitas hoy?
          </AppText>
          <View className="rounded-lg bg-brand-soft p-1.5">
            <Ionicons name="options-outline" size={17} color={palette.brandDark} />
          </View>
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {MOCK_CATEGORIES.map((item) => (
            <Pressable
              key={item.id}
              className="flex-row items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2"
              onPress={() =>
                Alert.alert(item.name, 'El filtro por categoría se activará en la Fase 4.')
              }
            >
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={palette.brand}
              />
              <AppText className="text-xs font-bold text-slate-600">{item.name}</AppText>
            </Pressable>
          ))}
        </ScrollView>

        <SectionHeader
          className="mt-6 px-5"
          title="Cerca de ti"
          subtitle="Pedidos publicados en tu barrio"
          actionLabel="Ver todo"
          onAction={() =>
            Alert.alert('Pedidos cercanos', 'El listado completo se conectará en la Fase 4.')
          }
        />

        <View className="mt-3 gap-3 px-5">
          {nearbyNeeds.map((need) => (
            <NeedCard
              key={need.id}
              need={need}
              onPress={() => router.push({ pathname: '/need/[id]', params: { id: need.id } })}
            />
          ))}
        </View>

        <Pressable
          className="mx-5 mt-5 flex-row items-center gap-3 rounded-card border border-brand/20 bg-brand-soft p-4"
          onPress={() => router.push('/publish')}
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-brand">
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </View>
          <View className="flex-1 gap-0.5">
            <AppText variant="subtitle">¿No encuentras lo que buscas?</AppText>
            <AppText variant="caption">
              Publica tu pedido y deja que tus vecinos te ofrezcan.
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={palette.brandDark} />
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
