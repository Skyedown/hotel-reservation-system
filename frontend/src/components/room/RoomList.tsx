'use client';

import { RoomType, CartItem } from '@/lib/types';
import { RoomCard } from './RoomCard';
import { RoomDetailsModal } from './RoomDetailsModal';
import { useState } from 'react';

interface RoomListProps {
  roomTypes: RoomType[];
  checkIn: string;
  checkOut: string;
  guests: number;
  onAddToCart: (item: CartItem) => void;
  cartItems: CartItem[];
  isLoading?: boolean;
  isInCart?: (roomTypeId: string, checkIn: string, checkOut: string) => boolean;
  onCartAdded?: () => void;
}

export function RoomList({ 
  roomTypes, 
  checkIn, 
  checkOut, 
  guests, 
  onAddToCart, 
  isLoading,
  isInCart = () => false,
  onCartAdded
}: RoomListProps) {
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);

  const handleViewDetails = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
  };

  const closeModal = () => {
    setSelectedRoomType(null);
  };

  const isRoomTypeInCart = (roomTypeId: string) => {
    return isInCart(roomTypeId, checkIn, checkOut);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-secondary-200 h-64 rounded-t-lg"></div>
            <div className="bg-white p-6 rounded-b-lg">
              <div className="h-6 bg-secondary-200 rounded mb-2"></div>
              <div className="h-4 bg-secondary-200 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-secondary-200 rounded mb-2 w-1/2"></div>
              <div className="h-4 bg-secondary-200 rounded mb-4 w-2/3"></div>
              <div className="h-10 bg-secondary-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (roomTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-secondary-400 text-6xl mb-4">🏨</div>
        <h3 className="text-xl font-semibold text-secondary-900 mb-2">
          Žiadne typy izieb nie sú dostupné
        </h3>
        <p className="text-secondary-600 mb-4">
          Pre vaše vybrané dátumy a počet hostí nie sú dostupné žiadne typy izieb.
        </p>
        <p className="text-sm text-secondary-500">
          Skúste upraviť vaše dátumy alebo znížiť počet hostí.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roomTypes.map((roomType) => (
          <RoomCard
            key={roomType.id}
            roomType={roomType}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onViewDetails={handleViewDetails}
            onAddToCart={onAddToCart}
            isInCart={isRoomTypeInCart(roomType.id)}
          />
        ))}
      </div>

      {/* Room Details Modal */}
      {selectedRoomType && (
        <RoomDetailsModal
          roomType={selectedRoomType}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          onClose={closeModal}
          onAddToCart={onAddToCart}
          isInCart={isRoomTypeInCart(selectedRoomType.id)}
          onCartAdded={onCartAdded}
        />
      )}
    </>
  );
}