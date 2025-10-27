
'use client';

import { Order } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

// Define the shape of the payment-related data
export type PaymentMethod = 'cod_cash' | 'cod_card' | 'cod_bizum' | 'prepaid_bizum' | 'prepaid_transfer';

interface CheckoutData {
  orderId: string | null;
  paymentMethod: PaymentMethod | null;
  orderSummary?: Order; // Use the full Order type
}

interface CheckoutContextType {
  checkoutData: CheckoutData;
  setCheckoutData: (data: CheckoutData) => void;
  clearCheckoutData: () => void;
  paymentMethod: PaymentMethod | null;
  setPaymentMethod: (method: PaymentMethod | null) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    orderId: null,
    paymentMethod: null,
  });
  
  // This state is now local to the provider and will be used by the checkout page
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  const handleSetCheckoutData = useCallback((data: CheckoutData) => {
    setCheckoutData(data);
    if(data.paymentMethod) {
        setPaymentMethod(data.paymentMethod);
    }
  }, []);
  
  const handleClearCheckoutData = useCallback(() => {
    sessionStorage.removeItem('checkout_data');
    setCheckoutData({ orderId: null, paymentMethod: null, orderSummary: undefined });
    setPaymentMethod(null);
  }, []);

  const value = {
    checkoutData,
    setCheckoutData: handleSetCheckoutData,
    clearCheckoutData: handleClearCheckoutData,
    paymentMethod,
    setPaymentMethod,
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
