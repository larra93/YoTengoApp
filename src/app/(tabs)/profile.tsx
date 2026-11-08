import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { CategoryThumb } from '@/components/needs';
import { AppText, Avatar, Badge, Screen, SectionHeader } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { useProfileStats } from '@/features/profile/use-profile-stats';
import { cn } from '@/lib/cn';
import { formatDateRange, getInitials } from '@/lib/format';
import { NEED_STATUS_LABEL } from '@/lib/labels';
import { MOCK_MY_NEEDS } from '@/mocks/data';
import { palette } from '@/theme/tokens';

const MENU_ITEMS: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
}[] = [
  { label: 'Mis ofertas', icon: 'pricetags-outline' },
  { label: 'Reseñas y reputación', icon: 'star-outline' },
  { label: 'Métodos de contacto', icon: 'call-outline' },
  { label: 'Configuración', icon: 'settings-outline' },
  { label: 'Ayuda y soporte', icon: 'help-circle-outline' },
  { label: 'Cerrar sesión', icon: 'log-out-outline', danger: true },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const statsQuery = useProfileStats(user?.id);
  const fullName = profile?.full_name?.trim() || 'Vecino';
  const neighborhood = profile?.neighborhood?.trim() || 'Sin barrio';
  const stats = [
    { label: 'Pedidos', value: statsQuery.data ? statsQuery.data.needs : '—' },
    { label: 'Ofertas', value: statsQuery.data ? statsQuery.data.offers : '—' },
    { label: 'Matches', value: statsQuery.data ? statsQuery.data.matches : '—' },
  ];

  const handleSignOut = () => {
    Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert('No pudimos cerrar sesión', 'Intenta nuevamente.');
          }
        },
      },
    ]);
  };

  const handleMenuPress = (label: string, danger?: boolean) => {
    if (danger) {
      handleSignOut();
      return;
    }

    Alert.alert(label, 'Esta sección se habilitará en una próxima fase.');
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
          <AppText variant="title">Mi perfil</AppText>
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full border border-line bg-surface"
            onPress={() => handleMenuPress('Configuración')}
          >
            <Ionicons name="settings-outline" size={19} color={palette.ink} />
          </Pressable>
        </View>

        <View className="px-5">
          <View className="overflow-hidden rounded-card">
            <LinearGradient
              colors={['#115E59', '#0D9488'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View className="p-5">
                <View className="flex-row items-center gap-3">
                  <Avatar
                    size="lg"
                    uri={profile?.avatar_url}
                    initials={getInitials(fullName) || '?'}
                    className="border-2 border-white/40"
                  />
                  <View className="flex-1 gap-1">
                    <AppText className="text-xl font-extrabold text-white">{fullName}</AppText>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="location-outline" size={12} color="#CCFBF1" />
                      <AppText className="text-[11px] font-semibold text-teal-50">
                        {neighborhood}
                      </AppText>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Ionicons name="star" size={12} color="#FCD34D" />
                      <AppText className="text-[11px] font-bold text-white">
                        {Number(profile?.rating_avg ?? 0).toFixed(1)} · {profile?.rating_count ?? 0}{' '}
                        reseñas
                      </AppText>
                      <Badge label="Vecino" tone="success" className="ml-1" />
                    </View>
                  </View>
                  <Pressable
                    accessibilityLabel="Editar perfil"
                    className="h-9 w-9 items-center justify-center rounded-full bg-white/15"
                    onPress={() => router.push('/edit-profile')}
                  >
                    <Ionicons name="pencil-outline" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>

                <View className="mt-5 flex-row rounded-xl bg-white/10 p-3">
                  {stats.map((stat, index) => (
                    <View
                      key={stat.label}
                      className={cn(
                        'flex-1 items-center gap-0.5',
                        index < stats.length - 1 && 'border-r border-white/20',
                      )}
                    >
                      <AppText className="text-lg font-extrabold text-white">{stat.value}</AppText>
                      <AppText className="text-[10px] font-semibold uppercase tracking-wide text-teal-50">
                        {stat.label}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        <SectionHeader
          className="mt-6 px-5"
          title="Mis pedidos"
          actionLabel="Ver todos"
          onAction={() => handleMenuPress('Mis pedidos')}
        />

        <View className="mt-3 gap-2 px-5">
          {MOCK_MY_NEEDS.slice(0, 3).map((need) => (
            <Pressable
              key={need.id}
              className="flex-row items-center gap-3 rounded-xl border border-line bg-surface p-3"
              onPress={() => router.push({ pathname: '/need/[id]', params: { id: need.id } })}
            >
              <CategoryThumb
                category={need.category}
                className="h-11 w-11 rounded-lg"
                iconSize={20}
              />
              <View className="flex-1 gap-0.5">
                <AppText variant="subtitle" className="text-[13px]" numberOfLines={1}>
                  {need.title}
                </AppText>
                <AppText variant="caption">
                  {formatDateRange(need.start_date, need.end_date)} · {need.offers_count} ofertas
                </AppText>
              </View>
              <Badge
                label={NEED_STATUS_LABEL[need.status]}
                tone={
                  need.status === 'completed'
                    ? 'success'
                    : need.status === 'open'
                      ? 'open'
                      : 'neutral'
                }
              />
            </Pressable>
          ))}
        </View>

        <View className="mx-5 mt-6 overflow-hidden rounded-card border border-line bg-surface">
          {MENU_ITEMS.map((item, index) => (
            <Pressable
              key={item.label}
              className={cn(
                'flex-row items-center gap-3 px-4 py-3.5',
                index < MENU_ITEMS.length - 1 && 'border-b border-line',
              )}
              onPress={() => handleMenuPress(item.label, item.danger)}
            >
              <View
                className={cn(
                  'h-8 w-8 items-center justify-center rounded-lg',
                  item.danger ? 'bg-danger-soft' : 'bg-slate-100',
                )}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={item.danger ? palette.danger : palette.muted}
                />
              </View>
              <AppText
                className={cn(
                  'flex-1 text-sm font-semibold',
                  item.danger ? 'text-danger' : 'text-ink',
                )}
              >
                {item.label}
              </AppText>
              <Ionicons name="chevron-forward" size={16} color={palette.placeholder} />
            </Pressable>
          ))}
        </View>

        <AppText variant="caption" className="mt-5 text-center">
          YoTengoApp · v1.0.0
        </AppText>
      </ScrollView>
    </Screen>
  );
}
