
'use client';

import { Order } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

interface CheckoutData {
  orderId: string | null;
  paymentMethod: string | null;
  orderSummary?: Order; // Use the full Order type
}

interface CheckoutContextType {
  checkoutData: CheckoutData;
  setCheckoutData: (data: CheckoutData) => void;
  clearCheckoutData: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    orderId: null,
    paymentMethod: null,
  });

  // On initial mount, we don't load from sessionStorage anymore.
  // The success page is now responsible for reading it once.
  
  const handleSetCheckoutData = useCallback((data: CheckoutData) => {
    // This is primarily for in-app state management now.
    // The checkout page will write to sessionStorage directly before redirect.
    setCheckoutData(data);
  }, []);
  
  const handleClearCheckoutData = useCallback(() => {
    sessionStorage.removeItem('checkout_data');
    setCheckoutData({ orderId: null, paymentMethod: null, orderSummary: undefined });
  }, []);

  const value = {
    checkoutData,
    setCheckoutData: handleSetCheckoutData,
    clearCheckoutData: handleClearCheckoutData,
  };

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
