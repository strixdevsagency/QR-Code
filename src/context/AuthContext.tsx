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
} from '../services/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCloudAuth: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserTier: (tier: UserTier) => void;
  activateLicenseKey: (key: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const isCloud = isSupabaseConfigured();

  // Map Supabase User to App User format
  const mapSupabaseUser = (sbUser: any): User => {
    const meta = sbUser.user_metadata || {};
    const email = sbUser.email || '';
    const isAdmin = meta.role === 'admin' || email.toLowerCase().endsWith('@strixdevs.com');
    const tier: UserTier = isAdmin ? 'enterprise' : (meta.tier || 'free');

    return {
      id: sbUser.id,
      name: meta.name || email.split('@')[0] || 'Strix User',
      email,
      role: isAdmin ? 'admin' : 'user',
      tier,
      createdAt: sbUser.created_at || new Date().toISOString(),
    };
  };

  useEffect(() => {
    // 1. If Supabase is configured, listen to real auth changes
    if (isCloud && supabase) {
      getActiveSession().then((session) => {
        if (session?.user) {
          const appUser = mapSupabaseUser(session.user);
          setUser(appUser);
          db.setCurrentUser(appUser);
        } else {
          setUser(db.getCurrentUser());
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const appUser = mapSupabaseUser(session.user);
          setUser(appUser);
          db.setCurrentUser(appUser);
        } else {
          setUser(null);
          db.setCurrentUser(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
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
        const appUser = mapSupabaseUser(sbUser);
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
        const appUser = mapSupabaseUser(sbUser);
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

  const loginWithOAuth = async (provider: 'google' | 'github'): Promise<{ success: boolean; error?: string }> => {
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

  const updateUserTier = (tier: UserTier) => {
    if (user) {
      const updated = { ...user, tier };
      setUser(updated);
      db.updateUserTier(user.id, tier);
    }
  };

  /**
   * Activate Pro with a license key without requiring email/password login
   */
  const activateLicenseKey = (key: string): { success: boolean; error?: string } => {
    const cleanKey = key.trim().toUpperCase();
    const VALID_KEYS = ['STRIX-PRO', 'STRIX-PRO-VIP', 'STRIX2026', 'PRO-PASS'];
    
    if (VALID_KEYS.includes(cleanKey) || cleanKey.startsWith('STRIX-PRO-') || cleanKey.startsWith('PRO-')) {
      const activeUser: User = user
        ? { ...user, tier: 'pro' }
        : {
            id: `pro_license_${Date.now()}`,
            name: 'Pro License Member',
            email: 'pro-member@strixdevs.com',
            role: 'user',
            tier: 'pro',
            createdAt: new Date().toISOString(),
          };

      setUser(activeUser);
      db.setCurrentUser(activeUser);
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid license key. Please check the code provided by StrixDevs billing.',
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
        updateUserTier,
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
