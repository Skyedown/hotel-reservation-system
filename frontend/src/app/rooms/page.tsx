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
import { GET_ALL_ROOMS } from '@/lib/graphql/queries';
import { Room, CartItem, RoomType } from '@/lib/types';
import { useCart } from '@/hooks/useCart';

export default function Rooms() {
  const [selectedType, setSelectedType] = useState<RoomType | 'ALL'>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [minCapacity, setMinCapacity] = useState<number>(1);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const { cartItems, addToCart, isInCart } = useCart();

  const { data, loading } = useQuery(GET_ALL_ROOMS);
  const rooms: Room[] = data?.rooms || [];

  // Filter rooms based on selected criteria
  const filteredRooms = rooms.filter(room => {
    if (selectedType !== 'ALL' && room.type !== selectedType) return false;
    if (room.price > maxPrice) return false;
    if (room.capacity < minCapacity) return false;
    return room.isAvailable;
  });

  const handleAddToCart = (item: CartItem) => {
    addToCart(item);
    setShowCartNotification(true);
  };

  const handleCloseNotification = () => {
    setShowCartNotification(false);
  };


  const handleViewDetails = (room: Room) => {
    // For now, just scroll to the room or open a modal
    console.log('View details for room:', room.id);
  };

  return (
    <UserLayout>
      <RoomHero />
      
      <RoomFilters
        selectedType={selectedType}
        maxPrice={maxPrice}
        minCapacity={minCapacity}
        resultsCount={filteredRooms.length}
        onTypeChange={setSelectedType}
        onPriceChange={setMaxPrice}
        onCapacityChange={setMinCapacity}
      />
      
      <RoomCategories />
      
      <RoomsList
        rooms={rooms}
        filteredRooms={filteredRooms}
        loading={loading}
        cartItems={cartItems}
        onViewDetails={handleViewDetails}
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