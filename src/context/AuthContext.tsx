import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  loginAsDemo: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => db.getCurrentUser());

  useEffect(() => {
    db.setCurrentUser(user);
  }, [user]);

  const login = async (email: string): Promise<boolean> => {
    const existing = db.findUserByEmail(email);
    if (existing) {
      setUser(existing);
      return true;
    }
    // Auto-create user if not found for seamless testing
    const created = db.createUser(email.split('@')[0], email, 'user');
    setUser(created);
    return true;
  };

  const register = async (name: string, email: string): Promise<boolean> => {
    const existing = db.findUserByEmail(email);
    if (existing) {
      setUser(existing);
      return true;
    }
    const created = db.createUser(name, email, 'user');
    setUser(created);
    return true;
  };

  const loginAsDemo = (role: UserRole) => {
    const targetEmail = role === 'admin' ? 'admin@strixdevs.com' : 'user@strixdevs.com';
    const existing = db.findUserByEmail(targetEmail);
    if (existing) {
      setUser(existing);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        loginAsDemo,
        logout,
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
