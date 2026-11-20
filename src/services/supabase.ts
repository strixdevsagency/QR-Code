import { createClient, type SupabaseClient, type Session, type User as SupabaseUser } from '@supabase/supabase-js';
import { getBaseAppUrl } from '../utils/url';

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
 * Sign in with OAuth provider (Google)
 * Supports cross-subdomain redirect for *.strixdevs.com
 */
export async function signInWithOAuth(provider: 'google' = 'google'): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error('Supabase is not configured') };
  }
  // Ensure redirect always uses canonical production application URL
  const baseAppUrl = getBaseAppUrl();
  const redirectTo = `${baseAppUrl}/`;

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
 * Retrieve the active session (from cached storage)
 */
export async function getActiveSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Retrieve fresh user data directly from the Supabase Auth server (bypasses stale cached JWT)
 */
export async function getFreshUser(): Promise<SupabaseUser | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Force a token and claims refresh from the Supabase server
 */
export async function refreshSession(): Promise<Session | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data?.session) return null;
    return data.session;
  } catch {
    return null;
  }
}

/**
 * Upload an image file to Supabase Cloud Storage ('logos' bucket)
 * Returns the permanent public CDN URL and storage path
 */
export async function uploadImageToSupabase(
  userId: string,
  file: File
): Promise<{ url: string | null; storagePath: string | null; error: Error | null }> {
  if (!supabase) {
    return { url: null, storagePath: null, error: new Error('Supabase is not configured') };
  }

  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, '');
    const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;

    const { data, error } = await supabase.storage.from('logos').upload(fileName, file, {
      cacheControl: '31536000',
      upsert: true,
      contentType: file.type || 'image/png',
    });

    if (error) {
      return { url: null, storagePath: null, error };
    }

    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(data.path);
    return { url: publicUrl, storagePath: data.path, error: null };
  } catch (err: any) {
    return { url: null, storagePath: null, error: err };
  }
}

/**
 * Delete an image file from Supabase Storage
 */
export async function deleteImageFromSupabase(storagePath: string): Promise<boolean> {
  if (!supabase || !storagePath) return false;
  try {
    const { error } = await supabase.storage.from('logos').remove([storagePath]);
    return !error;
  } catch {
    return false;
  }
}
