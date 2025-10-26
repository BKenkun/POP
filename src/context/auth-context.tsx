
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

// Chave para guardar o estado de visualização do admin no localStorage.
const ADMIN_VIEW_AS_CUSTOMER_KEY = 'admin_view_as_customer';

interface AuthContextType {
  user: User | null;
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
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [isViewingAsCustomer, setViewingAsCustomer] = useState(false);

  const router = useRouter();

  // Carrega o estado de visualização do localStorage quando o componente é montado no cliente.
  useEffect(() => {
    const storedState = localStorage.getItem(ADMIN_VIEW_AS_CUSTOMER_KEY);
    setViewingAsCustomer(storedState === 'true');
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setIsSubscribed(userData.isSubscribed || false);
          setLoyaltyPoints(userData.loyaltyPoints || 0);
        }
      } else {
        setIsSubscribed(false);
        setLoyaltyPoints(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // O usuário é um administrador real se o email corresponder.
  const isActualAdmin = useMemo(() => {
    return !!user && user.email === 'maryandpopper@gmail.com';
  }, [user]);

  // A aplicação "pensa" que o usuário é um admin apenas se for um admin real E não estiver no modo "Ver como Cliente".
  const isAdmin = useMemo(() => {
    return isActualAdmin && !isViewingAsCustomer;
  }, [isActualAdmin, isViewingAsCustomer]);

  const logout = async () => {
    try {
        await firebaseSignOut(auth);
        await fetch('/api/logout', { method: 'POST' });
        // Limpa também o modo de visualização ao sair.
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
      loading, 
      logout,
      isSubscribed,
      loyaltyPoints,
      isAdmin, // Este é o valor que o resto da aplicação usará.
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
