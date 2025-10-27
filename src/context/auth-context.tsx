
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

const ADMIN_VIEW_AS_CUSTOMER_KEY = 'admin_view_as_customer';

interface AuthContextType {
  user: User | null;
  userDoc: any | null; // Full user document from Firestore
  setUserDoc: (doc: any) => void;
  loading: boolean;
  logout: () => void;
  isSubscribed: boolean;
  loyaltyPoints: number;
  isAdmin: boolean;
  isViewingAsCustomer: boolean;
  setIsViewingAsCustomer: (isViewing: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isViewingAsCustomer, setViewingAsCustomer] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const storedState = localStorage.getItem(ADMIN_VIEW_AS_CUSTOMER_KEY);
    setViewingAsCustomer(storedState === 'true');
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserDoc(docSnap.data());
            } else {
                setUserDoc(null);
            }
            setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        setUserDoc(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const isActualAdmin = useMemo(() => {
    return !!user && user.email === 'maryandpopper@gmail.com';
  }, [user]);

  const isAdmin = useMemo(() => {
    return isActualAdmin && !isViewingAsCustomer;
  }, [isActualAdmin, isViewingAsCustomer]);
  
  const isSubscribed = useMemo(() => userDoc?.isSubscribed || false, [userDoc]);
  const loyaltyPoints = useMemo(() => userDoc?.loyaltyPoints || 0, [userDoc]);

  const logout = async () => {
    try {
        await firebaseSignOut(auth);
        await fetch('/api/logout', { method: 'POST' });
        localStorage.removeItem(ADMIN_VIEW_AS_CUSTOMER_KEY);
        setViewingAsCustomer(false);
        router.push('/');
        router.refresh();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const handleSetIsViewingAsCustomer = (isViewing: boolean) => {
    if (isActualAdmin) {
      localStorage.setItem(ADMIN_VIEW_AS_CUSTOMER_KEY, isViewing.toString());
      setViewingAsCustomer(isViewing);
    }
  };

  const value = { 
      user, 
      userDoc,
      setUserDoc,
      loading, 
      logout,
      isSubscribed,
      loyaltyPoints,
      isAdmin,
      isViewingAsCustomer,
      setIsViewingAsCustomer: handleSetIsViewingAsCustomer,
    };

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
