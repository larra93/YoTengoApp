import { File } from 'expo-file-system';
import type { ImagePickerAsset } from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { Profile } from '@/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export function getAuthRedirectUrl() {
  return Linking.createURL('/auth/callback');
}

function mapProfile(row: ProfileRow): Profile {
  return {
    ...row,
    location: row.location as string | null,
  };
}

async function createMissingProfile(userId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadataName = user?.user_metadata.full_name;
  const fullName = typeof metadataName === 'string' ? metadataName : '';

  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, full_name: fullName })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data);
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return createMissingProfile(userId);
  }

  return mapProfile(data);
}

export type ProfileUpdate = Partial<
  Pick<Profile, 'full_name' | 'avatar_url' | 'phone' | 'neighborhood'>
>;

export async function updateProfile(userId: string, values: ProfileUpdate) {
  const { data, error } = await supabase
    .from('profiles')
    .update(values)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data);
}

async function assetToArrayBuffer(asset: ImagePickerAsset) {
  if (Platform.OS === 'web') {
    const response = await fetch(asset.uri);
    return response.arrayBuffer();
  }

  return new File(asset.uri).arrayBuffer();
}

export async function uploadAvatar(userId: string, asset: ImagePickerAsset) {
  const extension = asset.mimeType?.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const path = `${userId}/avatar-${Date.now()}.${extension}`;
  const bytes = await assetToArrayBuffer(asset);

  const { error } = await supabase.storage.from('avatars').upload(path, bytes, {
    contentType: asset.mimeType ?? 'image/jpeg',
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);

  return data.publicUrl;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }

  return data;
}

export async function signUpWithEmail(fullName: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function resendConfirmationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: getAuthRedirectUrl() },
  });

  if (error) {
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
