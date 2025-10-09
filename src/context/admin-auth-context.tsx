'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

const VERIFY_KEY = 'admin_verified';
const AUTH_KEY = 'admin_authenticated';

interface AdminAuthContextType {
  isVerified: boolean;         // Step 1: Logged in as customer admin
  isAuthenticated: boolean;    // Step 2: Confirmed in admin panel
  loading: boolean;
  verify: () => void;          // Action for Step 1
  login: () => void;           // Action for Step 2
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const verifiedSession = sessionStorage.getItem(VERIFY_KEY);
      const authSession = sessionStorage.getItem(AUTH_KEY);
      setIsVerified(verifiedSession === 'true');
      setIsAuthenticated(authSession === 'true');
    } catch (e) {
      console.error('Could not access session storage:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const verify = () => {
    try {
      sessionStorage.setItem(VERIFY_KEY, 'true');
      setIsVerified(true);
    } catch (e) {
      console.error('Could not set session storage for verification:', e);
    }
  };

  const login = () => {
    try {
      sessionStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Could not set session storage for auth:', e);
    }
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(VERIFY_KEY);
      sessionStorage.removeItem(AUTH_KEY);
    } catch (e) {
      console.error('Could not clear session storage:', e);
    }
    setIsVerified(false);
    setIsAuthenticated(false);
    router.push('/');
  };

  const value = { isVerified, isAuthenticated, loading, verify, login, logout };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
