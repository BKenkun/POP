'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { useAuth as useFirebaseAuthHook, useDoc, useFirestore, useMemoFirebase } from '@/firebase';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  loyaltyPoints: number;
  isSubscribed: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useFirebaseAuthHook();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "users", user.uid);
  }, [user, firestore]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<{ loyaltyPoints: number, isSubscribed: boolean }>(userDocRef);

  const loyaltyPoints = userData?.loyaltyPoints || 0;
  const isSubscribed = userData?.isSubscribed || false;

  const logout = async () => {
    try {
        const auth = useFirebaseAuthHook(); 
        await firebaseSignOut(auth);
        router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const loading = isUserLoading || isUserDataLoading;

  const value = { 
      user, 
      loading, 
      logout,
      loyaltyPoints,
      isSubscribed,
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
