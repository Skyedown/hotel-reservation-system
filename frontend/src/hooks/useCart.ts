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
        const validItems = parsedItems.filter((item: CartItem) => 
          item && 
          item.roomType && 
          item.roomType.id && 
          item.checkIn && 
          item.checkOut
        );
        setCartItems(validItems);
      } catch {
        // Invalid cart data, clear storage
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

  const updateGuests = useCallback((roomTypeId: string, checkIn: string, newGuests: number) => {
    updateCartItem(roomTypeId, checkIn, { guests: newGuests });
  }, [updateCartItem]);

  const updateRoomCount = useCallback((roomTypeId: string, checkIn: string, newRoomCount: number) => {
    // Only update if newRoomCount is positive (negative values should trigger removal in the calling component)
    if (newRoomCount <= 0) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item?.roomType?.id === roomTypeId && item.checkIn === checkIn) {
          const nights = item.nights;
          const pricePerRoom = item.roomType.price * nights;
          return {
            ...item,
            roomCount: newRoomCount,
            subtotal: pricePerRoom * newRoomCount
          };
        }
        return item;
      })
    );
  }, []);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    updateGuests,
    updateRoomCount,
    clearCart,
    getCartCount,
    getTotalPrice,
    isInCart,
    isLoading
  };
}