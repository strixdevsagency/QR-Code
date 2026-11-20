'use client';

import React, { useEffect } from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { analytics } from '../../services/analytics';
import { db } from '../../services/db';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    try {
      const config = db.getAnalyticsConfig();
      analytics.initialize(config);
    } catch {
      // Graceful fallback in non-browser or sandbox environments
    }
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
};
