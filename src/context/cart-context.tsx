
"use client";

import type { CartItem, Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

export interface PackItem {
  id: string;
  price: number;
  quantity: number;
  size?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  addCustomPackToCart: (packItems: PackItem[], discountedPrice: number) => void;
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

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prevItems => {
      // Disallow adding regular items if a custom pack is already in the cart.
      if (prevItems.some(item => item.id === 'custom-pack')) {
          toast({
              title: "No se pueden añadir más productos",
              description: "Los packs personalizados deben comprarse por separado. Finaliza tu compra o elimina el pack del carrito para añadir otros productos.",
              variant: "destructive",
          });
          return prevItems;
      }

      const existingItem = prevItems.find(item => item.id === product.id);
      
      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

      if (product.stock !== undefined && newQuantity > product.stock) {
          toast({
            title: "Stock limit reached",
            description: `Cannot add ${quantity} more of ${product.name}. Only ${product.stock - (existingItem?.quantity || 0)} left.`,
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
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  const addCustomPackToCart = (packItems: PackItem[], discountedPrice: number) => {
      const totalQuantity = packItems.reduce((sum, item) => sum + item.quantity, 0);
      const packDescription = packItems.map(item => `${item.quantity}x ${item.id}`).join(', '); // Simple description for now
      
      const customPackItem: CartItem = {
          id: 'custom-pack',
          name: `Pack Personalizado (${totalQuantity} uds)`,
          description: packDescription,
          price: discountedPrice,
          imageUrl: 'https://picsum.photos/seed/pack/400/400',
          imageHint: 'custom pack',
          quantity: 1 // A pack is a single item in the cart
      };

      setCartItems(prevItems => {
          // A custom pack cannot be added with other items.
          const hasRegularItems = prevItems.some(item => item.id !== 'custom-pack');
          if (hasRegularItems) {
            toast({
                title: "No se puede combinar el pack",
                description: "Los packs personalizados deben comprarse por separado. Por favor, vacía tu carrito o finaliza la compra actual primero.",
                variant: "destructive",
            });
            return prevItems;
          }
          const otherItems = prevItems.filter(item => item.id !== 'custom-pack');
          return [...otherItems, customPackItem];
      });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
     if (productId === 'custom-pack') {
        if (quantity <= 0) {
            removeFromCart(productId);
        }
        return;
    }

    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item => {
          if (item.id === productId) {
            if (item.stock !== undefined && quantity > item.stock) {
                toast({
                    title: "Stock limit reached",
                    description: `Only ${item.stock} units of ${item.name} available.`,
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

  const { volumeDiscount, totalWithDiscount } = useMemo(() => {
    // Volume discounts do not apply to custom packs
    if (cartItems.some(item => item.id === 'custom-pack')) {
        return { volumeDiscount: 0, totalWithDiscount: cartTotal };
    }

    let discountPercent = 0;
    if (cartCount >= 144) {
      discountPercent = 0.33;
    } else if (cartCount >= 72) {
      discountPercent = 0.28;
    } else if (cartCount >= 36) {
      discountPercent = 0.21;
    } else if (cartCount >= 18) {
      discountPercent = 0.18;
    } else if (cartCount >= 12) {
      discountPercent = 0.12;
    } else if (cartCount >= 6) {
      discountPercent = 0.06;
    } else if (cartCount >= 3) {
      discountPercent = 0.03;
    }

    const discountAmount = cartTotal * discountPercent;
    const finalTotal = cartTotal - discountAmount;
    
    return { volumeDiscount: discountAmount, totalWithDiscount: finalTotal };
  }, [cartItems, cartCount, cartTotal]);


  const value = {
    cartItems,
    addToCart,
    addCustomPackToCart,
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
