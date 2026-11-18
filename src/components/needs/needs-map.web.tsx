import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText } from '@/components/ui';
import { cn } from '@/lib/cn';

import type { NeedsMapProps } from './needs-map';

export function NeedsMap({ className }: NeedsMapProps) {
  return (
    <View
      className={cn(
        'flex-1 items-center justify-center gap-2 border border-dashed border-slate-300 bg-surface px-6',
        className,
      )}
    >
      <Ionicons name="map-outline" size={26} color="#94A3B8" />
      <AppText variant="subtitle">Mapa solo en la app móvil</AppText>
      <AppText variant="caption" className="text-center">
        Instala el APK de YoTengoApp para ver los pedidos cercanos en el mapa.
      </AppText>
    </View>
  );
}
