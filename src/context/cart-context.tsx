
"use client";

import type { CartItem, Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useTranslation } from './language-context';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  volumeDiscount: number;
  totalWithDiscount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock === 0) {
        toast({ title: t('cart.item_unavailable'), description: `${product.name} is not available.`, variant: "destructive" });
        return;
    }
      
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

      if (product.stock !== undefined && newQuantity > product.stock) {
          toast({
            title: t('cart.stock_limit_reached'),
            description: `Only ${product.stock - (existingItem?.quantity || 0)} more units of ${product.name} can be added.`,
            variant: "destructive"
          });
          return prevItems;
      }
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }
      return [...prevItems, { ...product, quantity: quantity }];
    });

    toast({
      title: t('cart.item_added'),
      description: `${quantity} x ${product.name}`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast({
        title: t('cart.item_removed'),
        description: "The product has been removed from your cart.",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item => {
          if (item.id === productId) {
            if (item.stock !== undefined && quantity > item.stock) {
                toast({
                    title: t('cart.stock_limit_reached'),
                    description: `Only ${item.stock} units of ${item.name} are available.`,
                    variant: "destructive"
                });
                return { ...item, quantity: item.stock };
            }
            return { ...item, quantity };
          }
          return item;
        })
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const cartTotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);
  
  const volumeDiscount = useMemo(() => {
    let discountPercent = 0;
    if (cartCount >= 200) {
        discountPercent = 0.29; // 29%
    } else if (cartCount >= 180) {
        discountPercent = 0.26; // 26%
    } else if (cartCount >= 144) {
        discountPercent = 0.21; // 21%
    } else if (cartCount >= 72) {
        discountPercent = 0.15; // 15%
    } else if (cartCount >= 36) {
        discountPercent = 0.12; // 12%
    } else if (cartCount >= 19) {
        discountPercent = 0.09; // 9%
    } else if (cartCount >= 12) {
        discountPercent = 0.06; // 6%
    } else if (cartCount >= 6) {
        discountPercent = 0.03; // 3%
    } else if (cartCount >= 3) {
        discountPercent = 0.02; // 2%
    }
    return Math.round(cartTotal * discountPercent);
  }, [cartCount, cartTotal]);

  const totalWithDiscount = useMemo(() => cartTotal - volumeDiscount, [cartTotal, volumeDiscount]);


  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    volumeDiscount,
    totalWithDiscount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
