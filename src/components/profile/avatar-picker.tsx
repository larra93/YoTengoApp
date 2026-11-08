import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import type { ImagePickerAsset } from 'expo-image-picker';
import { Alert, View } from 'react-native';

import { AppText, Avatar, Button } from '@/components/ui';
import { getInitials } from '@/lib/format';
import { palette } from '@/theme/tokens';

export interface AvatarPickerProps {
  name: string;
  uri: string | null;
  onPick: (asset: ImagePickerAsset) => void;
}

export function AvatarPicker({ name, uri, onPick }: AvatarPickerProps) {
  const handlePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permiso necesario',
        'Necesitamos acceso a tus fotos para cambiar tu imagen de perfil.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onPick(result.assets[0]);
    }
  };

  return (
    <View className="items-center gap-3">
      <Avatar
        size="lg"
        uri={uri}
        initials={getInitials(name)}
        className="border-4 border-brand-soft"
      />
      <Button
        size="sm"
        variant="secondary"
        label={uri ? 'Cambiar foto' : 'Agregar foto'}
        icon={<Ionicons name="camera-outline" size={15} color={palette.brandDark} />}
        onPress={handlePick}
      />
      <AppText variant="caption">Opcional. Una foto ayuda a generar confianza.</AppText>
    </View>
  );
}
