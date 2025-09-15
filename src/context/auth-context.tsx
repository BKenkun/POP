
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';

// Define a type for our simulated admin user
type SimulatedUser = {
  uid: string;
  email: string;
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
  setLoyaltyPoints: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminAsCustomer, setIsAdminAsCustomer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (!isAdminAsCustomer) {
        setUser(authUser);
        if (authUser) {
          const userDocRef = doc(db, "users", authUser.uid);
          const unsubSnapshot = onSnapshot(userDocRef, (doc) => {
            setLoyaltyPoints(doc.data()?.loyaltyPoints || 0);
          });
          return () => unsubSnapshot();
        } else {
            setLoyaltyPoints(0);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdminAsCustomer]);

  const logout = async () => {
    try {
      if (isAdminAsCustomer) {
        setIsAdminAsCustomer(false);
        setUser(null); // Clear simulated user
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
    setLoading(false);
    setLoyaltyPoints(1000); // Give some points to test with
  };

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

  const value = { user: providedUser, loading, logout, loginAsAdminCustomer, loyaltyPoints, setLoyaltyPoints };

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
