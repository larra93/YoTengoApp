import { File } from 'expo-file-system';
import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

export function getImageExtension(asset: ImagePickerAsset) {
  return asset.mimeType?.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
}

export async function imageAssetToArrayBuffer(asset: ImagePickerAsset) {
  if (Platform.OS === 'web') {
    const response = await fetch(asset.uri);
    return response.arrayBuffer();
  }

  return new File(asset.uri).arrayBuffer();
}
