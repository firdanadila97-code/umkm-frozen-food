import { createBrowserClient } from '@supabase/ssr';

export function getSupabasePublicConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://zbvqzufnprwzaxpakvtv.supabase.co';

  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_U8xXsNpQmEI4R_rFdP3UDw_jlF0SEUm';

  return { url, publishableKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, publishableKey } = getSupabasePublicConfig();
  return Boolean(
    url &&
      publishableKey &&
      url.startsWith('http') &&
      !url.includes('your-project-id.supabase.co') &&
      publishableKey !== 'your-supabase-anon-key'
  );
}

export function createClient() {
  const { url, publishableKey } = getSupabasePublicConfig();
  return createBrowserClient(url, publishableKey);
}
