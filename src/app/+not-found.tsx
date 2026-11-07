import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, Screen } from '@/components/ui';
import { palette } from '@/theme/tokens';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <Screen className="items-center justify-center gap-3 px-8">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-soft">
        <Ionicons name="compass-outline" size={30} color={palette.brandDark} />
      </View>
      <AppText variant="title">Pantalla no encontrada</AppText>
      <AppText variant="muted" className="text-center">
        La ruta que buscas no existe o todavía no está disponible.
      </AppText>
      <Button label="Volver al inicio" onPress={() => router.replace('/')} className="mt-2" />
    </Screen>
  );
}
