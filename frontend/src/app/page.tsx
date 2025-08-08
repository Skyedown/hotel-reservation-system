'use client';

import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SearchForm } from '@/components/reservation/SearchForm';
import { RoomList } from '@/components/room/RoomList';
import { UserLayout } from '@/components/layout/UserLayout';
import { CartNotification } from '@/components/cart/CartNotification';
import { GET_AVAILABLE_ROOM_TYPES } from '@/lib/graphql/queries';
import { SearchFormData, RoomType, CartItem } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { toLocalDateString } from '@/lib/utils';

export default function Home() {
  const [searchData, setSearchData] = useState<SearchFormData | null>(null);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const { cartItems, addToCart, isInCart } = useCart();

  const [searchRoomTypes, { data, loading, error }] = useLazyQuery(GET_AVAILABLE_ROOM_TYPES);

  const handleSearch = (data: SearchFormData) => {
    setSearchData(data);
    searchRoomTypes({
      variables: {
        checkIn: toLocalDateString(data.checkIn),
        checkOut: toLocalDateString(data.checkOut),
        guests: data.guests,
      },
    });
  };

  const handleAddToCart = (item: CartItem) => {
    addToCart(item);
    setShowCartNotification(true);
  };

  const handleCloseNotification = () => {
    setShowCartNotification(false);
  };


  const roomTypes: RoomType[] = data?.availableRoomTypes || [];

  return (
    <UserLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-24">
        <div className="absolute inset-0 bg-secondary-900 opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Rezervujte si svoj dokonalý pobyt
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Zažite luxus a pohodlie v našom prémiom hoteli
          </p>
        </div>

        {/* Search Form */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchForm onSearch={handleSearch} isLoading={loading} />
        </div>
      </section>

      {/* Search Results */}
      {searchData && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">
                Dostupné typy izieb
              </h3>
              <p className="text-secondary-600">
                {searchData.guests} {searchData.guests === 1 ? 'hosť' : searchData.guests < 5 ? 'hostia' : 'hostí'} • {' '}
                {searchData.checkIn.toLocaleDateString()} - {searchData.checkOut.toLocaleDateString()}
              </p>
              {roomTypes.length > 0 && (
                <p className="text-sm text-secondary-500 mt-1">
                  {roomTypes.length} {roomTypes.length === 1 ? 'typ izby dostupný' : roomTypes.length < 5 ? 'typy izieb dostupné' : 'typov izieb dostupných'}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
                <p className="text-error-800">
                  Nepodarilo sa načítať izby. Skúste to znovu.
                </p>
              </div>
            )}

            <RoomList
              roomTypes={roomTypes}
              checkIn={toLocalDateString(searchData.checkIn)}
              checkOut={toLocalDateString(searchData.checkOut)}
              guests={searchData.guests}
              onAddToCart={handleAddToCart}
              cartItems={cartItems}
              isLoading={loading}
              isInCart={isInCart}
              onCartAdded={() => setShowCartNotification(true)}
            />
          </div>
        </section>
      )}

      {/* Welcome Section (shown when no search) */}
      {!searchData && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl font-bold text-secondary-900 mb-6">
              Vítame vás v našom hoteli
            </h3>
            <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
              Objavte pohodlie a eleganciu pri každom pobyte. Použite vyhľadávací formulár vyššie 
              na nájdenie ideálnej izby pre vaše dátumy a veľkosť skupiny.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl mb-4">🏨</div>
                <h4 className="text-lg font-semibold mb-2">Luxusné izby</h4>
                <p className="text-secondary-600">Prémiové ubytovanie s moderným vybavením</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🌟</div>
                <h4 className="text-lg font-semibold mb-2">5-hviezdkové služby</h4>
                <p className="text-secondary-600">Výjimočná pohostinnosť a osobná starostlivosť</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📍</div>
                <h4 className="text-lg font-semibold mb-2">Výborná lokalita</h4>
                <p className="text-secondary-600">Pohodný prístup k hlavným atrakciám</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cart Notification */}
      <CartNotification
        isVisible={showCartNotification}
        cartItems={cartItems}
        onClose={handleCloseNotification}
      />
    </UserLayout>
  );
}