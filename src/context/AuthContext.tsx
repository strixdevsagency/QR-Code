'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole, UserTier } from '../types';
import { db } from '../services/db';
import {
  supabase,
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signInWithOAuth,
  signOutUser,
  getActiveSession,
  getFreshUser,
  refreshSession,
  resetPasswordForEmail,
  updateUserPassword,
} from '../services/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCloudAuth: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithOAuth: (provider?: 'google') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  updateUserTier: (tier: UserTier) => void;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
  activateLicenseKey: (key: string) => {
    success: boolean;
    tier?: UserTier;
    error?: string;
    isTeamCode?: boolean;
    remainingUses?: number;
    durationDays?: number;
    tierExpiresAt?: string | null;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const isCloud = isSupabaseConfigured();

  // Map and sync Supabase User to App User format with public.profiles DB check
  const resolveUserProfile = async (sbUser: any): Promise<User> => {
    const userMeta = sbUser.user_metadata || {};
    const appMeta = sbUser.app_metadata || {};
    const email: string = (sbUser.email || '').toLowerCase().trim();

    // 1. Initial base defaults
    let role: UserRole = 'user';
    let tier: UserTier = 'free';
    let name: string = userMeta.full_name || userMeta.name || email.split('@')[0] || 'Strix User';
    let avatarUrl: string | undefined = userMeta.avatar_url || userMeta.picture || undefined;

    // Check if Supabase JWT carries verified admin claim
    if (appMeta.role === 'admin' || userMeta.role === 'admin' || appMeta.claims_admin === true) {
      role = 'admin';
      tier = 'enterprise';
    }

    // Check local storage cache for subscription expiry and active code
    const localUser = db.getCurrentUser();
    const activeLicense = db.getActiveLicenseSession();
    let tierExpiresAt = activeLicense?.tierExpiresAt || userMeta.tierExpiresAt || (localUser?.email?.toLowerCase() === email ? localUser?.tierExpiresAt : null);
    let activeRedeemedCode = activeLicense?.code || userMeta.activeRedeemedCode || (localUser?.email?.toLowerCase() === email ? localUser?.activeRedeemedCode : null);
    if (activeLicense && role !== 'admin') {
      tier = activeLicense.tier;
    }

    // 2. Query Supabase public.profiles table by BOTH ID and EMAIL
    if (supabase && email) {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`id.eq.${sbUser.id},email.ilike.${email}`);

        if (!error && profiles && profiles.length > 0) {
          // Prefer exact id match, otherwise email match
          const profile = profiles.find((p: any) => p.id === sbUser.id) || profiles[0];

          // Priority 1: Respect the role explicitly set in public.profiles!
          if (profile.role) {
            role = profile.role as UserRole;
          }
          if (activeLicense && role !== 'admin') {
            tier = activeLicense.tier;
            // Mirror active license to profiles
            if (profile.tier !== tier) {
              supabase.from('profiles').update({ tier, updated_at: new Date().toISOString() }).eq('email', email);
            }
          } else if (profile.tier) {
            tier = profile.tier as UserTier;
          }
          if (profile.name) {
            name = profile.name;
          }
          if (profile.avatar_url) {
            avatarUrl = profile.avatar_url;
          }

          // If the profile in DB has a legacy/different id, update its id to sbUser.id so it is permanently linked
          if (profile.id !== sbUser.id) {
            await supabase
              .from('profiles')
              .update({ id: sbUser.id, updated_at: new Date().toISOString() })
              .eq('email', email);
          }
        } else {
          // If no row exists yet in public.profiles, create it
          await supabase.from('profiles').upsert({
            id: sbUser.id,
            email,
            name,
            role,
            tier,
            avatar_url: avatarUrl || null,
            created_at: sbUser.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Could not query public.profiles:', err);
      }
    }

    // Enforce subscription duration & expiration
    if (tier !== 'free' && role !== 'admin' && tierExpiresAt) {
      if (new Date(tierExpiresAt).getTime() < Date.now()) {
        tier = 'free';
        tierExpiresAt = null;
        if (supabase) {
          supabase.from('profiles').update({ tier: 'free', updated_at: new Date().toISOString() }).eq('email', email);
          supabase.auth.updateUser({ data: { tier: 'free', tierExpiresAt: null } }).catch(() => {});
        }
      }
    }

    const appUser: User = {
      id: sbUser.id,
      name,
      email,
      role,
      tier,
      avatarUrl,
      tierExpiresAt: tier === 'free' ? null : tierExpiresAt,
      activeRedeemedCode: tier === 'free' ? null : activeRedeemedCode,
      createdAt: sbUser.created_at || new Date().toISOString(),
    };

    // Store in local DB cache for fast hydration
    db.saveUserProfile(appUser);
    return appUser;
  };

  useEffect(() => {
    // Re-verify session and DB profile
    const verifyAndSyncUser = async () => {
      if (isCloud && supabase) {
        const session = await getActiveSession();
        if (session?.user) {
          // Also call getFreshUser() to pull fresh server-side auth metadata
          const freshUser = await getFreshUser();
          const targetSbUser = freshUser || session.user;
          const appUser = await resolveUserProfile(targetSbUser);
          setUser(appUser);
          db.setCurrentUser(appUser);
          return;
        }
      }

      // If a local user session exists, check if public.profiles has an update for their email
      const localUser = db.getCurrentUser();
      if (localUser && isCloud && supabase && localUser.email) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .or(`id.eq.${localUser.id},email.ilike.${localUser.email.toLowerCase().trim()}`)
            .maybeSingle();

          if (profile) {
            const updated: User = {
              ...localUser,
              name: profile.name || localUser.name,
              role: (profile.role as UserRole) || localUser.role,
              tier: (profile.tier as UserTier) || localUser.tier,
              avatarUrl: profile.avatar_url || localUser.avatarUrl,
            };
            setUser(updated);
            db.setCurrentUser(updated);
            db.saveUserProfile(updated);
            return;
          }
        } catch {
          // fallback to cached
        }
      }

      setUser(db.getCurrentUser());
    };

    verifyAndSyncUser();

    // 1. If Supabase is configured, listen to real auth changes
    if (isCloud && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const freshUser = await getFreshUser();
          const targetSbUser = freshUser || session.user;
          const appUser = await resolveUserProfile(targetSbUser);
          setUser(appUser);
          db.setCurrentUser(appUser);
        } else if (event === 'SIGNED_OUT') {
          // Explicit sign out triggered
          db.clearActiveLicenseSession();
          db.setCurrentUser(null);
          setUser(null);
        } else {
          // Preserves active local session or redeemed key session across page reloads
          const current = db.getCurrentUser();
          if (current) {
            setUser(current);
          } else {
            setUser(null);
          }
        }
      });

      // Window focus listener: When switching back from Supabase dashboard to this tab, auto-refresh!
      const handleWindowFocus = () => {
        verifyAndSyncUser();
      };
      window.addEventListener('focus', handleWindowFocus);

      // Realtime listener on public.profiles: Instant live sync when database is edited!
      const profileChannel = supabase
        .channel('public:profiles')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          async (payload: any) => {
            const changed = payload.new;
            if (changed && changed.email) {
              const current = db.getCurrentUser();
              if (current && (changed.id === current.id || changed.email.toLowerCase() === current.email.toLowerCase())) {
                const updatedUser: User = {
                  ...current,
                  role: (changed.role as UserRole) || current.role,
                  tier: (changed.tier as UserTier) || current.tier,
                  name: changed.name || current.name,
                };
                setUser(updatedUser);
                db.setCurrentUser(updatedUser);
                db.saveUserProfile(updatedUser);
              }
            }
          }
        )
        .subscribe();

      return () => {
        authListener.subscription.unsubscribe();
        window.removeEventListener('focus', handleWindowFocus);
        if (supabase) {
          supabase.removeChannel(profileChannel);
        }
      };
    } else {
      // 2. Local Storage Mock Mode
      setUser(db.getCurrentUser());
    }
  }, [isCloud]);

  useEffect(() => {
    if (user) {
      db.setCurrentUser(user);
    }
  }, [user]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (isCloud) {
      if (!password) {
        return { success: false, error: 'Please enter your password to sign in.' };
      }
      const { user: sbUser, error } = await signInWithEmail(email, password);
      if (error) {
        return { success: false, error: error.message };
      }
      if (sbUser) {
        const appUser = await resolveUserProfile(sbUser);
        setUser(appUser);
        return { success: true };
      }
      return { success: false, error: 'User could not be loaded' };
    }

    // Local fallback mode
    const existing = db.loginUser(email);
    if (existing) {
      setUser(existing);
      return { success: true };
    }
    const created = db.registerUser(email.split('@')[0], email);
    setUser(created);
    return { success: true };
  };

  const register = async (name: string, email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (isCloud) {
      if (!password) {
        return { success: false, error: 'Please enter a password with at least 6 characters.' };
      }
      const role: UserRole = email.toLowerCase().endsWith('@strixdevs.com') ? 'admin' : 'user';
      const { user: sbUser, error } = await signUpWithEmail(email, password, name, role);
      if (error) {
        return { success: false, error: error.message };
      }
      if (sbUser) {
        const appUser = await resolveUserProfile(sbUser);
        setUser(appUser);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    }

    // Local fallback mode
    const created = db.registerUser(name, email);
    setUser(created);
    return { success: true };
  };

  const loginWithOAuth = async (provider: 'google' = 'google'): Promise<{ success: boolean; error?: string }> => {
    if (isCloud) {
      const { error } = await signInWithOAuth(provider);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }

    return {
      success: false,
      error: 'OAuth requires NEXT_PUBLIC_SUPABASE_URL in production environment variables.',
    };
  };

  const logout = async () => {
    if (isCloud) {
      await signOutUser();
    }
    db.logout();
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (isCloud) {
      const { error } = await resetPasswordForEmail(email);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }
    // Local simulation
    return { success: true };
  };

  const updatePassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    if (isCloud) {
      const { error } = await updateUserPassword(password);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }
    return { success: true };
  };

  const updateUserTier = (tier: UserTier) => {
    if (user) {
      const updated = { ...user, tier };
      setUser(updated);
      db.updateUserTier(user.id, tier);
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    db.updateUserRole(userId, role);
    if (user && user.id === userId) {
      setUser({ ...user, role });
    }
  };

  const refreshUser = async () => {
    if (isCloud && supabase) {
      // Force refresh auth token
      await refreshSession();
      const freshUser = await getFreshUser();
      if (freshUser) {
        const appUser = await resolveUserProfile(freshUser);
        setUser(appUser);
        db.setCurrentUser(appUser);
        return;
      }
      const session = await getActiveSession();
      if (session?.user) {
        const appUser = await resolveUserProfile(session.user);
        setUser(appUser);
        db.setCurrentUser(appUser);
        return;
      }
    }

    // Direct check of public.profiles for the active user's email
    const local = db.getCurrentUser();
    if (local && isCloud && supabase && local.email) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .or(`id.eq.${local.id},email.ilike.${local.email.toLowerCase().trim()}`)
          .maybeSingle();

        if (profile && profile.role) {
          const updated: User = {
            ...local,
            role: profile.role as UserRole,
            tier: (profile.tier as UserTier) || local.tier,
          };
          setUser(updated);
          db.setCurrentUser(updated);
          db.saveUserProfile(updated);
          return;
        }
      } catch {
        // ignore
      }
    }

    setUser(db.getCurrentUser());
  };

  /**
   * Activate Pro/Enterprise with a single-use or team redemption code with duration & session preservation
   */
  const activateLicenseKey = (key: string): {
    success: boolean;
    tier?: UserTier;
    error?: string;
    isTeamCode?: boolean;
    remainingUses?: number;
    durationDays?: number;
    tierExpiresAt?: string | null;
  } => {
    const cleanKey = key.trim().toUpperCase();
    const result = db.redeemLicenseCode(cleanKey, user?.email);

    if (result.success && result.tier) {
      const activeTier: UserTier = result.tier;
      const tierExpiresAt = result.tierExpiresAt ?? null;
      const activeUser: User = user
        ? {
            ...user,
            tier: activeTier,
            tierExpiresAt,
            activeRedeemedCode: cleanKey,
          }
        : {
            id: `pro_license_${Date.now()}`,
            name: 'Pro License Member',
            email: 'pro-member@strixdevs.com',
            role: 'user',
            tier: activeTier,
            tierExpiresAt,
            activeRedeemedCode: cleanKey,
            createdAt: new Date().toISOString(),
          };

      setUser(activeUser);
      db.setCurrentUser(activeUser);
      db.saveUserProfile(activeUser);
      db.updateUserTier(activeUser.id, activeTier, tierExpiresAt, cleanKey);

      // Persist to Supabase so it NEVER vanishes on page reload / refresh
      if (isCloud && supabase) {
        // 1. Update public.profiles
        supabase
          .from('profiles')
          .update({
            tier: activeTier,
            updated_at: new Date().toISOString(),
          })
          .or(`id.eq.${activeUser.id},email.ilike.${activeUser.email.toLowerCase().trim()}`)
          .then(({ error }) => {
            if (error) console.warn('[Strix Auth] Profile tier update notice:', error);
          });

        // 2. Update Supabase Auth user_metadata
        supabase.auth
          .updateUser({
            data: {
              tier: activeTier,
              tierExpiresAt,
              activeRedeemedCode: cleanKey,
            },
          })
          .catch(() => {});
      }

      return {
        success: true,
        tier: activeTier,
        isTeamCode: result.isTeamCode,
        remainingUses: result.remainingUses,
        durationDays: result.durationDays,
        tierExpiresAt,
      };
    }

    return {
      success: false,
      error: result.error || 'Invalid license key. Please check the code provided by StrixDevs billing.',
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isCloudAuth: isCloud,
        login,
        register,
        loginWithOAuth,
        logout,
        resetPassword,
        updatePassword,
        updateUserTier,
        updateUserRole,
        refreshUser,
        activateLicenseKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
