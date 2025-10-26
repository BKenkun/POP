
'use client';

import { Order } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

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

  const handleSetCheckoutData = useCallback((data: CheckoutData) => {
    // sessionStorage allows data to persist across page reloads for this session only.
    sessionStorage.setItem('checkout_data', JSON.stringify(data));
    setCheckoutData(data);
  }, []);
  
  const handleClearCheckoutData = useCallback(() => {
    sessionStorage.removeItem('checkout_data');
    setCheckoutData({ orderId: null, paymentMethod: null, orderSummary: undefined });
  }, []);
  
  // On initial load, try to restore from sessionStorage.
  useState(() => {
    try {
      const storedData = sessionStorage.getItem('checkout_data');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // We need to convert the stored date string back to a Date object
        if (parsedData.orderSummary?.createdAt) {
          parsedData.orderSummary.createdAt = new Date(parsedData.orderSummary.createdAt);
        }
        setCheckoutData(parsedData);
      }
    } catch (e) {
      console.error("Could not restore checkout data from session storage", e);
    }
  });


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

    
