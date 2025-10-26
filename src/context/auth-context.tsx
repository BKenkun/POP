
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase'; // Simplified import
import { Loader2 } from 'lucide-react';

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // User is signed in, get custom data
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setIsSubscribed(userData.isSubscribed || false);
          setLoyaltyPoints(userData.loyaltyPoints || 0);
        }
      } else {
        // User is signed out, reset data
        setIsSubscribed(false);
        setLoyaltyPoints(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = useMemo(() => {
    return !!user && user.email === 'maryandpopper@gmail.com';
  }, [user]);

  const logout = async () => {
    try {
        await firebaseSignOut(auth);
        await fetch('/api/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = { 
      user, 
      loading, 
      logout,
      isSubscribed,
      loyaltyPoints,
      isAdmin,
    };

    // Show a global loader while Firebase is initializing auth state
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
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
