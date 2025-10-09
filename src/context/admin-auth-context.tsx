
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
  logout: () => void;
  checkSession: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AdminSession | null>(null);

  const checkSession = async () => {
    const sessionData = await getAdminSession();
    setSession(sessionData);
  };
  
  useEffect(() => {
    checkSession();
  }, []);

  const logout = async () => {
    await adminLogout();
    setSession(null);
  };
  
  const isAuthenticated = !!session;

  const value = { 
    session,
    isAuthenticated,
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
