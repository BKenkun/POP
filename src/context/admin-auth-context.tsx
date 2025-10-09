
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface AdminAuthContextType {
  isAdminAsCustomer: boolean;
  setIsAdminAsCustomer: (isViewing: boolean) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'is_admin_as_customer';

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminAsCustomer, setAdminState] = useState(false);
  const pathname = usePathname();

  // On initial load, check localStorage to see if admin was previously viewing as a customer.
  // This persists the "secret link" state across page reloads.
  useEffect(() => {
    try {
      const storedState = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (storedState === 'true') {
        setAdminState(true);
      }
    } catch (e) {
        // localStorage is not available (e.g., in SSR or private browsing)
        console.warn("Could not access localStorage for admin state.");
    }
  }, []);

  // When admin logs out from /admin panel, this effect will clear the flag.
  useEffect(() => {
    if (!pathname.startsWith('/admin')) {
      // If we are not in admin, we don't need to do anything with the session.
      return;
    }
    // If we navigate AWAY from the admin section, it means a logout or similar.
    // However, this logic is flawed. A better check is needed.
    // The main control is now handleSetIsAdminAsCustomer.
  }, [pathname]);

  const handleSetIsAdminAsCustomer = (isViewing: boolean) => {
     try {
        if (isViewing) {
            localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
            setAdminState(true);
        } else {
            localStorage.removeItem(ADMIN_STORAGE_KEY);
            setAdminState(false);
        }
    } catch(e) {
        console.warn("Could not access localStorage to set admin state.");
        setAdminState(isViewing); // Set in memory at least
    }
  };

  const value = { 
    isAdminAsCustomer,
    setIsAdminAsCustomer: handleSetIsAdminAsCustomer,
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
