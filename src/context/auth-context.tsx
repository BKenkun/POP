
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useDoc, useFirestore, useMemoFirebase } from '@/firebase';


// Define a type for our simulated admin user
type SimulatedUser = {
  uid: string;
  email: string | null;
  displayName: string;
  isAnonymous: boolean;
  emailVerified: boolean;
  providerData: any[];
};

interface AuthContextType {
  user: User | SimulatedUser | null;
  loading: boolean;
  logout: () => void;
  loginAsAdminCustomer: () => void;
  loyaltyPoints: number;
  isSubscribed: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser, isUserLoading } = useFirebaseAuth();
  const firestore = useFirestore();
  const [isAdminAsCustomer, setIsAdminAsCustomer] = useState(false);
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!firebaseUser || !firestore) return null;
    return doc(firestore, "users", firebaseUser.uid);
  }, [firebaseUser, firestore]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<{ loyaltyPoints: number, isSubscribed: boolean }>(userDocRef);

  const loyaltyPoints = userData?.loyaltyPoints || 0;
  const isSubscribed = userData?.isSubscribed || false;

  const logout = async () => {
    try {
      if (isAdminAsCustomer) {
        setIsAdminAsCustomer(false);
        router.push('/');
      } else {
        const auth = useFirebaseAuth(); // Get auth instance here
        await firebaseSignOut(auth);
        router.push('/');
      }
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const loginAsAdminCustomer = () => {
    setIsAdminAsCustomer(true);
  };
  
  const loading = isUserLoading || isUserDataLoading;

  const providedUser = isAdminAsCustomer 
    ? { 
        uid: 'admin_user', 
        email: process.env.ADMIN_EMAIL || null,
        displayName: 'Admin (Cliente)',
        isAnonymous: false,
        emailVerified: true,
        providerData: [],
      }
    : firebaseUser;

  const value = { 
      user: providedUser, 
      loading, 
      logout, 
      loginAsAdminCustomer, 
      loyaltyPoints: isAdminAsCustomer ? 1000 : loyaltyPoints,
      isSubscribed: isAdminAsCustomer ? true : isSubscribed 
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
