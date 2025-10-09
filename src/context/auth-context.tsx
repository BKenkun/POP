
'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
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
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading: authLoading, auth } = useFirebaseAuthHook();
  const firestore = useFirestore();
  const router = useRouter();

  // Memoize the admin check.
  const isAdmin = useMemo(() => {
    // Check against the environment variable, ensuring it's available on the client.
    return !!user && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  }, [user]);

  const userDocRef = useMemoFirebase(() => {
    // Prevent Firestore reads if there's no user OR if the user is an admin.
    if (!user || !firestore || isAdmin) return null;
    return doc(firestore, "users", user.uid);
  }, [user, firestore, isAdmin]);

  const { data: userData, isLoading: userDocLoading } = useDoc<{ loyaltyPoints?: number, isSubscribed?: boolean }>(userDocRef);

  const isSubscribed = userData?.isSubscribed ?? false;
  const loyaltyPoints = userData?.loyaltyPoints ?? 0;
  
  const logout = async () => {
    try {
        // First, sign out from Firebase client
        if (auth) {
            await firebaseSignOut(auth);
        }
        // Then, hit the API endpoint to clear the server-side session cookie
        await fetch('/api/logout', { method: 'POST' });

        // Redirect to home
        router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  // Doc is only loading if we are fetching it (i.e., not an admin)
  const loading = authLoading || (user && !isAdmin ? userDocLoading : false);

  const value = { 
      user, 
      loading, 
      logout,
      isSubscribed,
      loyaltyPoints,
      isAdmin,
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
