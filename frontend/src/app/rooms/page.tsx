'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { UserLayout } from '@/components/layout/UserLayout';
import { CartNotification } from '@/components/cart/CartNotification';
import { RoomHero } from '@/components/rooms/RoomHero';
import { RoomFilters } from '@/components/rooms/RoomFilters';
import { RoomCategories } from '@/components/rooms/RoomCategories';
import { RoomsList } from '@/components/rooms/RoomsList';
import { RoomAmenities } from '@/components/rooms/RoomAmenities';
import { GET_ALL_ROOM_TYPES } from '@/lib/graphql/queries';
import { RoomType, CartItem } from '@/lib/types';
import { useCart } from '@/hooks/useCart';

export default function Rooms() {
  const [selectedType, setSelectedType] = useState<string | 'ALL'>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [minCapacity, setMinCapacity] = useState<number>(1);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const { cartItems, addToCart, isInCart } = useCart();

  const { data, loading } = useQuery(GET_ALL_ROOM_TYPES);
  const roomTypes: RoomType[] = data?.roomTypes || [];

  // Filter room types based on selected criteria
  const filteredRoomTypes = roomTypes.filter(roomType => {
    if (selectedType !== 'ALL' && roomType.name !== selectedType) return false;
    if (roomType.price > maxPrice) return false;
    if (roomType.capacity < minCapacity) return false;
    return true; // Room types are always available for selection
  });

  const handleAddToCart = (item: CartItem) => {
    addToCart(item);
    setShowCartNotification(true);
  };

  const handleCloseNotification = () => {
    setShowCartNotification(false);
  };

  return (
    <UserLayout>
      <RoomHero />
      
      <RoomFilters
        selectedType={selectedType}
        maxPrice={maxPrice}
        minCapacity={minCapacity}
        resultsCount={filteredRoomTypes.length}
        onTypeChange={setSelectedType}
        onPriceChange={setMaxPrice}
        onCapacityChange={setMinCapacity}
      />
      
      <RoomCategories />
      
      <RoomsList
        roomTypes={roomTypes}
        filteredRoomTypes={filteredRoomTypes}
        loading={loading}
        cartItems={cartItems}
        onAddToCart={handleAddToCart}
        isInCart={isInCart}
      />
      
      <RoomAmenities />

      {/* Cart Notification */}
      <CartNotification
        isVisible={showCartNotification}
        cartItems={cartItems}
        onClose={handleCloseNotification}
      />
    </UserLayout>
  );
}