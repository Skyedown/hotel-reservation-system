'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { RoomType, CartItem } from '@/lib/types';
import { formatCurrency, getRoomTypeLabel, calculateNights, calculateTotal } from '@/lib/utils';
import { 
  UsersIcon, 
  WifiIcon, 
  CarIcon, 
  CoffeeIcon, 
  TvIcon,
  EyeIcon,
  ShoppingCartIcon,
} from 'lucide-react';

interface RoomCardProps {
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  guests: number;
  onAddToCart: (item: CartItem) => void;
  isInCart?: boolean;
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Wi-Fi': WifiIcon,
  'Parking': CarIcon,
  'Coffee Maker': CoffeeIcon,
  'TV': TvIcon,
  'Television': TvIcon,
  'Free WiFi': WifiIcon,
  'Air Conditioning': CoffeeIcon, // Using coffee as placeholder
  'Mini Bar': CoffeeIcon,
};

export function RoomCard({ 
  roomType, 
  checkIn, 
  checkOut, 
  guests, 
  onAddToCart,
  isInCart = false
}: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = calculateTotal(roomType.price, nights);

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      roomType,
      checkIn,
      checkOut,
      guests,
      nights,
      subtotal: totalPrice,
    };
    onAddToCart(cartItem);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === roomType.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? roomType.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image Gallery */}
      <div className="relative h-64 bg-secondary-200">
        {roomType.images.length > 0 ? (
          <>
            <Image
              src={roomType.images[currentImageIndex]}
              alt={roomType.name}
              fill
              className="object-cover"
            />
            {roomType.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  →
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {roomType.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-secondary-400">Obrázok nie je dostupný</span>
          </div>
        )}
      </div>

      {/* Room Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-semibold text-secondary-900">
              {getRoomTypeLabel(roomType.name)}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">
              {formatCurrency(roomType.price)}
            </div>
            <p className="text-sm text-secondary-600">za noc</p>
          </div>
        </div>

        <p className="text-secondary-700 mb-4 line-clamp-2">{roomType.description}</p>

        {/* Capacity */}
        <div className="flex items-center mb-4">
          <UsersIcon className="h-4 w-4 text-secondary-500 mr-2" />
          <span className="text-sm text-secondary-600">
            Až {roomType.capacity} {roomType.capacity === 1 ? 'hosť' : roomType.capacity < 5 ? 'hostia' : 'hostí'}
          </span>
        </div>

        {/* Amenities */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-secondary-900 mb-2">Vybavenie</h4>
          <div className="flex flex-wrap gap-2">
            {roomType.amenities.slice(0, 4).map((amenity) => {
              const IconComponent = amenityIcons[amenity] || CoffeeIcon;
              return (
                <div key={amenity} className="flex items-center text-xs text-secondary-600">
                  <IconComponent className="h-3 w-3 mr-1" />
                  {amenity}
                </div>
              );
            })}
            {roomType.amenities.length > 4 && (
              <span className="text-xs text-secondary-500">
                +{roomType.amenities.length - 4} ďalších
              </span>
            )}
          </div>
        </div>

        {/* Booking Summary */}
        <div className="border-t pt-4 mb-4">
          <div className="flex justify-between text-sm text-secondary-600">
            <span>{nights} {nights === 1 ? 'noc' : nights < 5 ? 'noci' : 'nocí'}</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
          <div className="flex justify-between font-semibold text-secondary-900 mt-1">
            <span>Celkom</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            Zobraziť detaily
          </Button>
          <Button
            onClick={handleAddToCart}
            className="flex-1"
            disabled={isInCart || roomType.capacity < guests}
          >
            <ShoppingCartIcon className="h-4 w-4 mr-2" />
            {isInCart ? 'Pridané' : 'Pridať do košíka'}
          </Button>
        </div>

        {roomType.capacity < guests && (
          <p className="text-sm text-error-600 mt-2 text-center">
            Táto izba môže ubytovať len {roomType.capacity} {roomType.capacity === 1 ? 'hosťa' : roomType.capacity < 5 ? 'hostí' : 'hostí'}
          </p>
        )}
      </div>
    </div>
  );
}