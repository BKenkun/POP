
"use client";

import type { CartItem, Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  volumeDiscount: number;
  totalWithDiscount: number; // Added this back
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock === 0) {
        toast({ title: "Agotado", description: `${product.name} no está disponible.`, variant: "destructive" });
        return;
    }
      
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

      if (product.stock !== undefined && newQuantity > product.stock) {
          toast({
            title: "Límite de stock alcanzado",
            description: `No se pueden añadir más unidades de ${product.name}. Solo quedan ${product.stock - (existingItem?.quantity || 0)}.`,
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
      title: "Añadido al carrito",
      description: `${quantity} x ${product.name} se ha añadido a tu carrito.`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado de tu carrito.",
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
                    title: "Límite de stock alcanzado",
                    description: `Solo hay ${item.stock} unidades de ${item.name} disponibles.`,
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
