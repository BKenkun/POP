
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { User, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useAuth as useFirebaseAuthHook, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useAdminAuth } from './admin-auth-context';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  isSubscribed: boolean;
  loyaltyPoints: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading: authLoading, auth } = useFirebaseAuthHook();
  const { isAdminAsCustomer } = useAdminAuth(); // Use admin context
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    // Prevent Firestore reads if there's no user OR if the admin is viewing as a customer
    if (!user || !firestore || isAdminAsCustomer) return null;
    return doc(firestore, "users", user.uid);
  }, [user, firestore, isAdminAsCustomer]);

  const { data: userData, isLoading: userDocLoading } = useDoc<{ loyaltyPoints?: number, isSubscribed?: boolean }>(userDocRef);

  const isSubscribed = userData?.isSubscribed ?? false;
  const loyaltyPoints = userData?.loyaltyPoints ?? 0;
  
  const logout = async () => {
    try {
        if (auth) {
            await firebaseSignOut(auth);
        }
        router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  // Doc is only loading if we are fetching it (i.e., not an admin)
  const loading = authLoading || (user && !isAdminAsCustomer ? userDocLoading : false);

  const value = { 
      user, 
      loading, 
      logout,
      isSubscribed,
      loyaltyPoints,
    };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
