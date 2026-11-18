import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * SERVER-ONLY Supabase Admin Client.
 * Supports SUPABASE_SECRET_KEY (new Supabase API key format) or SUPABASE_SERVICE_ROLE_KEY.
 * NEVER import this file in client components.
 */
export function createAdminSupabaseClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !secretKey ||
    secretKey.includes('YOUR_UNMASKED_SECRET_KEY_HERE')
  ) {
    throw new Error(
      'Konfigurasi SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY belum diisi lengkap di .env.local.'
    );
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
