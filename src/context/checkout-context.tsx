
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CheckoutData {
  orderId: string | null;
  paymentMethod: string | null;
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

  const handleSetCheckoutData = (data: CheckoutData) => {
    setCheckoutData(data);
  };
  
  const handleClearCheckoutData = () => {
    setCheckoutData({ orderId: null, paymentMethod: null });
  };

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
