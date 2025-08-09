'use client';

import { RoomCard } from '@/components/room/RoomCard';
import { RoomType, CartItem } from '@/lib/types';
import { getTodayLocalDateString, getTomorrowLocalDateString } from '@/lib/utils';

interface RoomsListProps {
  roomTypes: RoomType[];
  filteredRoomTypes: RoomType[];
  loading: boolean;
  cartItems: CartItem[];
  onAddToCart: (item: CartItem) => void;
  isInCart?: (roomTypeId: string, checkIn: string, checkOut: string) => boolean;
}

export function RoomsList({
  roomTypes,
  filteredRoomTypes,
  loading,
  onAddToCart,
  isInCart = () => false,
}: RoomsListProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-primary-800">Dostupné izby</h2>
          <div className="text-sm text-secondary-600">
            Zobrazuje sa {filteredRoomTypes.length} z {roomTypes.length} typov izieb
          </div>
        </div>
        
        {loading ? (
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
        ) : filteredRoomTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoomTypes.map((roomType) => (
              <RoomCard
                key={roomType.id}
                roomType={roomType}
                checkIn={getTodayLocalDateString()}
                checkOut={getTomorrowLocalDateString()}
                guests={1}
                onAddToCart={onAddToCart}
                isInCart={isInCart(roomType.id, getTodayLocalDateString(), getTomorrowLocalDateString())}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-secondary-400 text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Žiadne izby nespĺňajú vaše kritériá
            </h3>
            <p className="text-secondary-600 mb-4">
              Skúste upraviť vaše filtre pre zobrazenie viacerých možnosťí.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}