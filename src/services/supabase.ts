import { createClient, type SupabaseClient, type Session, type User as SupabaseUser } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Accepts the latest Supabase publishable key format (sb_publishable_...) or fallback legacy anon key
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if valid credentials are provided (not empty or template placeholder)
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id') &&
    (supabaseKey.startsWith('sb_publishable_') || supabaseKey.startsWith('eyJ') || supabaseKey.length > 20) &&
    !supabaseKey.includes('your-supabase')
  );
};

// Initialize Supabase client
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<{ user: SupabaseUser | null; error: Error | null }> {
  if (!supabase) {
    return { user: null, error: new Error('Supabase is not configured') };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data.user, error };
}

/**
 * Sign up with email, password, and custom metadata (e.g. name, role)
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  role: 'user' | 'admin' = 'user'
): Promise<{ user: SupabaseUser | null; error: Error | null }> {
  if (!supabase) {
    return { user: null, error: new Error('Supabase is not configured') };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  });
  return { user: data.user, error };
}

/**
 * Sign in with OAuth provider (Google, GitHub)
 * Supports cross-subdomain redirect for *.strixdevs.com
 */
export async function signInWithOAuth(provider: 'google' | 'github'): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error('Supabase is not configured') };
  }
  const redirectTo = typeof window !== 'undefined'
    ? `${window.location.origin}/`
    : 'https://qr.strixdevs.com/';

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });
  return { error };
}

/**
 * Sign out current session
 */
export async function signOutUser(): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: null };
  }
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Retrieve the active session
 */
export async function getActiveSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}
