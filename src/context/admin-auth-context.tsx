'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useClientAuthContext } from './auth-context';

const ADMIN_AUTHENTICATED_KEY = 'admin_session_active';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { loading: clientAuthLoading } = useClientAuthContext();

  useEffect(() => {
    // Wait for the client auth context to be ready.
    // This is crucial to avoid race conditions.
    if (clientAuthLoading) {
      return;
    }

    try {
      const authSession = sessionStorage.getItem(ADMIN_AUTHENTICATED_KEY);
      if (authSession === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Could not access session storage:', e);
    } finally {
      setLoading(false);
    }
  }, [clientAuthLoading]);

  const login = () => {
    try {
      sessionStorage.setItem(ADMIN_AUTHENTICATED_KEY, 'true');
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Could not set session storage for admin auth:', e);
    }
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(ADMIN_AUTHENTICATED_KEY);
    } catch (e) {
      console.error('Could not clear session storage for admin auth:', e);
    }
    setIsAuthenticated(false);
    // Redirect to the main site page after admin logout, not the verify page.
    router.push('/');
  };

  // The final loading state depends on both contexts.
  const finalLoading = clientAuthLoading || loading;

  const value = { isAuthenticated, loading: finalLoading, login, logout };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
