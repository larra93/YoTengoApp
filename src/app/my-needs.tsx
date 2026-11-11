import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { NeedCard } from '@/components/needs';
import { AppText, Screen } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { useMyNeeds } from '@/features/needs/use-needs';
import { palette } from '@/theme/tokens';

export default function MyNeedsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const needsQuery = useMyNeeds(user?.id);
  const needs = needsQuery.data ?? [];

  return (
    <Screen>
      <View className="flex-row items-center gap-3 px-5 py-2">
        <Pressable
          accessibilityLabel="Volver"
          className="h-10 w-10 items-center justify-center rounded-full border border-line bg-surface"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={19} color={palette.ink} />
        </Pressable>
        <View className="flex-1">
          <AppText variant="subtitle">Mis pedidos</AppText>
          <AppText variant="caption">Abiertos, en trato, completados y cancelados</AppText>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={needsQuery.isRefetching}
            onRefresh={() => needsQuery.refetch()}
            tintColor={palette.brand}
          />
        }
      >
        <View className="mt-3 gap-3 px-5">
          {needsQuery.isLoading ? (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
              <ActivityIndicator size="small" color={palette.brand} />
              <AppText variant="muted">Cargando tus pedidos...</AppText>
            </View>
          ) : needsQuery.isError ? (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
              <Ionicons name="cloud-offline-outline" size={26} color={palette.placeholder} />
              <AppText variant="subtitle">No pudimos cargar tus pedidos</AppText>
              <AppText variant="caption" className="text-center">
                Revisa tu conexión e intenta nuevamente.
              </AppText>
            </View>
          ) : needs.length > 0 ? (
            needs.map((need) => (
              <NeedCard
                key={need.id}
                need={need}
                showStatus
                onPress={() => router.push({ pathname: '/need/[id]', params: { id: need.id } })}
              />
            ))
          ) : (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
              <Ionicons name="document-text-outline" size={30} color={palette.placeholder} />
              <AppText variant="subtitle">Todavía no publicas pedidos</AppText>
              <AppText variant="caption" className="text-center">
                Publica lo que necesitas y deja que tus vecinos te ofrezcan.
              </AppText>
              <Pressable
                className="mt-2 rounded-xl bg-brand px-4 py-2.5"
                onPress={() => router.push('/publish')}
              >
                <AppText className="text-xs font-extrabold text-white">Publicar pedido</AppText>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
