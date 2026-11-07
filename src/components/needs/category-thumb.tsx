import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { cn } from '@/lib/cn';
import type { Category } from '@/types';

const GRADIENTS: Record<string, [string, string]> = {
  default: ['#115E59', '#0D9488'],
  disfraces: ['#0F766E', '#14B8A6'],
  herramientas: ['#1E3A8A', '#3B82F6'],
  libros: ['#92400E', '#F59E0B'],
  juegos: ['#5B21B6', '#8B5CF6'],
  deportes: ['#166534', '#22C55E'],
  fiestas: ['#9D174D', '#EC4899'],
  hogar: ['#334155', '#64748B'],
  musica: ['#7C2D12', '#F97316'],
};

export function getCategoryGradient(slug?: string): [string, string] {
  return GRADIENTS[slug ?? 'default'] ?? GRADIENTS.default;
}

export interface CategoryThumbProps {
  category: Category | null;
  className?: string;
  iconSize?: number;
}

export function CategoryThumb({ category, className, iconSize = 28 }: CategoryThumbProps) {
  return (
    <View className={cn('overflow-hidden', className)}>
      <LinearGradient
        colors={getCategoryGradient(category?.slug)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View className="flex-1 items-center justify-center">
          <Ionicons
            name={(category?.icon ?? 'cube-outline') as keyof typeof Ionicons.glyphMap}
            size={iconSize}
            color="#FFFFFF"
          />
        </View>
      </LinearGradient>
    </View>
  );
}
