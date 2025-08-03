'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Room, CartItem } from '@/lib/types';
import { formatCurrency, getRoomTypeLabel, calculateNights, calculateTotal } from '@/lib/utils';
import { 
  X, 
  UsersIcon, 
  WifiIcon, 
  CarIcon, 
  CoffeeIcon, 
  TvIcon,
  ShoppingCartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';

interface RoomDetailsModalProps {
  room: Room;
  checkIn: string;
  checkOut: string;
  guests: number;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  isInCart: boolean;
  onCartAdded?: () => void;
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Wi-Fi': WifiIcon,
  'Parking': CarIcon,
  'Coffee Maker': CoffeeIcon,
  'TV': TvIcon,
  'Television': TvIcon,
  'Free WiFi': WifiIcon,
  'Air Conditioning': CoffeeIcon,
  'Mini Bar': CoffeeIcon,
};

export function RoomDetailsModal({ 
  room, 
  checkIn, 
  checkOut, 
  guests, 
  onClose, 
  onAddToCart,
  isInCart,
  onCartAdded
}: RoomDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = calculateTotal(room.price, nights);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close modal on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === room.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? room.images.length - 1 : prev - 1
    );
  };

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      room,
      checkIn,
      checkOut,
      guests,
      nights,
      subtotal: totalPrice,
    };
    onAddToCart(cartItem);
    if (onCartAdded) {
      onCartAdded();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">
              {getRoomTypeLabel(room.type)}
            </h2>
            <p className="text-secondary-600">Izba {room.roomNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Image Gallery */}
          <div className="relative h-80 bg-secondary-200 rounded-lg mb-6">
            {room.images.length > 0 ? (
              <>
                <Image
                  src={room.images[currentImageIndex]}
                  alt={`${room.type} - ${room.roomNumber}`}
                  fill
                  className="object-cover rounded-lg"
                />
                {room.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-opacity"
                    >
                      <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-opacity"
                    >
                      <ChevronRightIcon className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image thumbnails */}
                {room.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {room.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-opacity ${
                          index === currentImageIndex
                            ? 'bg-white'
                            : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-secondary-400">No image available</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Room Details */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  Description
                </h3>
                <p className="text-secondary-700 leading-relaxed">
                  {room.description}
                </p>
              </div>

              {/* Room Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 text-secondary-500 mr-3" />
                  <div>
                    <p className="font-medium text-secondary-900">Kapacita</p>
                    <p className="text-sm text-secondary-600">
                      Až {room.capacity}{' '}
                      {room.capacity === 1
                        ? 'hosť'
                        : room.capacity < 5
                        ? 'hostia'
                        : 'hostí'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-secondary-900">Typ izby</p>
                  <p className="text-sm text-secondary-600">
                    {getRoomTypeLabel(room.type)}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Vybavenie
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {room.amenities.map((amenity) => {
                    const IconComponent = amenityIcons[amenity] || CoffeeIcon;
                    return (
                      <div key={amenity} className="flex items-center">
                        <IconComponent className="h-4 w-4 text-info-600 mr-3" />
                        <span className="text-secondary-700">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-secondary-50 rounded-lg p-6 sticky top-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-info-600">
                    {formatCurrency(room.price)}
                  </div>
                  <p className="text-sm text-secondary-600">za noc</p>
                </div>

                <div className="space-y-3 text-secondary-900 mb-6">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Check-in</span>
                    <span className="font-bold">
                      {new Date(checkIn).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Check-out</span>
                    <span className="font-bold">
                      {new Date(checkOut).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Hostia</span>
                    <span className="font-bold">{guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Nights</span>
                    <span className="font-bold">{nights}</span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-secondary-600">Celkom</span>
                    <span className="text-info-600">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full"
                  size="lg"
                  disabled={isInCart || room.capacity < guests}
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  {isInCart ? 'Pridané do košíka' : 'Pridať do košíka'}
                </Button>

                {room.capacity < guests && (
                  <p className="text-sm text-error-600 mt-3 text-center">
                    Táto izba môže ubytovať len {room.capacity}{' '}
                    {room.capacity === 1
                      ? 'hosťa'
                      : room.capacity < 5
                      ? 'hostí'
                      : 'hostí'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}