'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Define a type for our simulated admin user
type SimulatedUser = {
  uid: string;
  email: string;
  displayName: string;
  isAnonymous: boolean; // Add properties to match Firebase User type
  emailVerified: boolean;
  providerData: any[];
  // Add any other properties your app might use from the User object
};

interface AuthContextType {
  user: User | SimulatedUser | null;
  loading: boolean;
  logout: () => void;
  loginAsAdminCustomer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminAsCustomer, setIsAdminAsCustomer] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isAdminAsCustomer) {
        setUser(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdminAsCustomer]);

  const logout = async () => {
    try {
      if (isAdminAsCustomer) {
        setIsAdminAsCustomer(false);
      } else {
        await firebaseSignOut(auth);
      }
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const loginAsAdminCustomer = () => {
    setIsAdminAsCustomer(true);
    setLoading(false); // Ensure loading is false
  };

  // Determine the final user object to provide
  const providedUser = isAdminAsCustomer 
    ? { 
        uid: 'admin_user', 
        email: 'en_rike@pimp.com',
        displayName: 'Admin (Cliente)',
        isAnonymous: false,
        emailVerified: true,
        providerData: [],
      }
    : user;

  const value = { user: providedUser, loading, logout, loginAsAdminCustomer };

  if (loading && !providedUser) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
