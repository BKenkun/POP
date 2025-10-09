'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { useAuth as useFirebaseAuthHook, useDoc, useFirestore, useMemoFirebase } from '@/firebase';

// This creates a "fake" user object for the admin when they are logged in as a customer
const createAdminUser = (email: string): User => ({
    uid: 'admin_user',
    email: email,
    displayName: 'Administrador',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    providerId: 'admin',
    // Add dummy implementations for all required User methods
    delete: async () => {},
    getIdToken: async () => 'admin-token',
    getIdTokenResult: async () => ({ token: 'admin-token', claims: {}, authTime: '', expirationTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null }),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null,
    tenantId: null,
});


interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  loyaltyPoints: number;
  isSubscribed: boolean;
  isAdminAsCustomer: boolean;
  loginAsAdminCustomer: (admin: { email: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser, isUserLoading } = useFirebaseAuthHook();
  const firestore = useFirestore();
  const router = useRouter();

  // State to track if the admin is logged in as a customer
  const [isAdminAsCustomer, setIsAdminAsCustomer] = useState(false);
  const [adminUser, setAdminUser] = useState<User | null>(null);

  const user = isAdminAsCustomer ? adminUser : firebaseUser;

  const userDocRef = useMemoFirebase(() => {
    // We don't fetch user data for the admin-as-customer session
    if (!user || isAdminAsCustomer || !firestore) return null;
    return doc(firestore, "users", user.uid);
  }, [user, isAdminAsCustomer, firestore]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<{ loyaltyPoints: number, isSubscribed: boolean }>(userDocRef);

  const loyaltyPoints = userData?.loyaltyPoints || 0;
  const isSubscribed = userData?.isSubscribed || false;

  const loginAsAdminCustomer = (admin: { email: string }) => {
    setAdminUser(createAdminUser(admin.email));
    setIsAdminAsCustomer(true);
  };

  const logout = async () => {
    if (isAdminAsCustomer) {
        setIsAdminAsCustomer(false);
        setAdminUser(null);
        router.push('/');
    } else {
        try {
            const auth = useFirebaseAuthHook(); 
            await firebaseSignOut(auth);
            router.push('/');
        } catch (error) {
          console.error("Error signing out: ", error);
        }
    }
  };
  
  const loading = isUserLoading || isUserDataLoading;

  const value = { 
      user, 
      loading, 
      logout,
      loyaltyPoints,
      isSubscribed,
      isAdminAsCustomer,
      loginAsAdminCustomer
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
