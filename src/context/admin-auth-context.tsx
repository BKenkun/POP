
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const SESSION_STORAGE_KEY = 'admin_auth_session';

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

  useEffect(() => {
    // Check sessionStorage on initial load
    try {
      const session = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (session === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Could not access session storage:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = () => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Could not set session storage:', e);
    }
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.error('Could not remove session storage:', e);
    }
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  const value = { isAuthenticated, loading, login, logout };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
