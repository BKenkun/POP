
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { User, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useAuth as useFirebaseAuthHook, useDoc, useFirestore, useMemoFirebase } from '@/firebase';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  isSubscribed: boolean;
  loyaltyPoints: number;
  isAdminAsCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading: authLoading, auth } = useFirebaseAuthHook();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "users", user.uid);
  }, [user, firestore]);

  const { data: userData, isLoading: userDocLoading } = useDoc<{ loyaltyPoints?: number, isSubscribed?: boolean }>(userDocRef);

  const isSubscribed = userData?.isSubscribed ?? false;
  const loyaltyPoints = userData?.loyaltyPoints ?? 0;
  
  const isAdminAsCustomer = false; // This functionality is removed to simplify auth.

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
  
  const loading = authLoading || userDocLoading;

  const value = { 
      user, 
      loading, 
      logout,
      isSubscribed,
      loyaltyPoints,
      isAdminAsCustomer,
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
