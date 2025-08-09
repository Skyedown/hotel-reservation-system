'use client';

import { useState, useEffect, useCallback } from 'react';
import { CartItem } from '@/lib/types';

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart items from localStorage on mount
  useEffect(() => {
    const storedItems = localStorage.getItem('hotelCartItems');
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems);
        // Filter out invalid items that might cause errors
        const validItems = parsedItems.filter((item: any) => 
          item && 
          item.roomType && 
          item.roomType.id && 
          item.checkIn && 
          item.checkOut
        );
        setCartItems(validItems);
      } catch (error) {
        console.error('Error parsing stored cart items:', error);
        localStorage.removeItem('hotelCartItems');
      }
    }
    setIsLoading(false);
  }, []);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('hotelCartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  const addToCart = useCallback((item: CartItem) => {
    setCartItems(prevItems => {
      // Check if item already exists
      const existingItemIndex = prevItems.findIndex(
        existingItem => 
          existingItem?.roomType?.id === item?.roomType?.id &&
          existingItem.checkIn === item.checkIn &&
          existingItem.checkOut === item.checkOut
      );

      if (existingItemIndex !== -1) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = item;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, item];
      }
    });
  }, []);

  const removeFromCart = useCallback((roomTypeId: string, checkIn: string) => {
    setCartItems(prevItems => 
      prevItems.filter(item => 
        !(item?.roomType?.id === roomTypeId && item.checkIn === checkIn)
      )
    );
  }, []);

  const updateCartItem = useCallback((roomTypeId: string, checkIn: string, updates: Partial<CartItem>) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item?.roomType?.id === roomTypeId && item.checkIn === checkIn
          ? { ...item, ...updates }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartCount = useCallback(() => {
    return cartItems.length;
  }, [cartItems]);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.subtotal, 0);
  }, [cartItems]);

  const isInCart = useCallback((roomTypeId: string, checkIn: string, checkOut: string) => {
    return cartItems.some(item => 
      item?.roomType?.id === roomTypeId && 
      item.checkIn === checkIn && 
      item.checkOut === checkOut
    );
  }, [cartItems]);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartCount,
    getTotalPrice,
    isInCart,
    isLoading
  };
}