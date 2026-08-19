import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface SupabaseEnv {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  SUPABASE_ANON_KEY?: string;
}

function getEnvValue(key: keyof SupabaseEnv): string | undefined {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
}

export function getSupabaseCredentials() {
  const url =
    getEnvValue("NEXT_PUBLIC_SUPABASE_URL") ||
    getEnvValue("SUPABASE_URL") ||
    (typeof window !== "undefined" && (window as unknown as { __ENV?: SupabaseEnv }).__ENV?.NEXT_PUBLIC_SUPABASE_URL);

  const anonKey =
    getEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    getEnvValue("SUPABASE_PUBLISHABLE_KEY") ||
    getEnvValue("SUPABASE_ANON_KEY") ||
    (typeof window !== "undefined" && (window as unknown as { __ENV?: SupabaseEnv }).__ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return { url: url || undefined, anonKey: anonKey || undefined };
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey) {
    return null;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return cachedClient;
  } catch {
    return null;
  }
}

export const supabase = getSupabaseClient();
