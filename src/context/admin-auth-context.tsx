'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useFirebaseClientAuth } from './auth-context'; // Use the main auth context

const VERIFY_KEY = 'admin_verified';
const AUTH_KEY = 'admin_authenticated';

interface AdminAuthContextType {
  isVerified: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  verify: () => void;
  login: () => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const router = useRouter();

  // Get the loading state from the main Firebase auth context
  const { loading: firebaseAuthLoading } = useFirebaseClientAuth();

  useEffect(() => {
    // CRITICAL: Wait for Firebase auth to be ready before checking admin session state.
    // This prevents the race condition where admin checks run before Firebase is initialized.
    if (firebaseAuthLoading) {
      return;
    }

    try {
      const verifiedSession = sessionStorage.getItem(VERIFY_KEY);
      const authSession = sessionStorage.getItem(AUTH_KEY);
      setIsVerified(verifiedSession === 'true');
      setIsAuthenticated(authSession === 'true');
    } catch (e) {
      console.error('Could not access session storage:', e);
    } finally {
      setSessionLoading(false);
    }
  }, [firebaseAuthLoading]); // This effect now depends on the Firebase auth loading state

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

  // The overall loading state depends on BOTH Firebase auth and the admin session check
  const loading = firebaseAuthLoading || sessionLoading;

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
