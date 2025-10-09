
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAdminSession, logout as adminLogout } from '@/app/actions/admin-auth';

interface AdminSession {
  email: string;
  isAdmin: true;
}

interface AdminAuthContextType {
  session: AdminSession | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  checkSession: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    setLoading(true);
    const sessionData = await getAdminSession();
    setSession(sessionData);
    setLoading(false);
  };
  
  useEffect(() => {
    checkSession();
  }, []);

  const logout = async () => {
    await adminLogout();
    setSession(null);
    window.location.href = '/'; // Redirect to home on logout
  };
  
  const isAuthenticated = !loading && !!session;

  const value = { 
    session,
    isAuthenticated,
    loading, 
    logout,
    checkSession,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
