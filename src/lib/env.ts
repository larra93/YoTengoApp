const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY. Copia .env.example a .env y completa las credenciales.',
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);
