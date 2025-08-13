'use client';

import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/Button';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCart } from '@/hooks/useCart';
import { ShoppingCartIcon, ArrowLeftIcon } from 'lucide-react';

export default function Cart() {
  const { cartItems, removeFromCart, updateGuests, updateRoomCount, getTotalPrice, isLoading } = useCart();

  const handleRemoveItem = (roomTypeId: string, checkIn: string) => {
    removeFromCart(roomTypeId, checkIn);
  };

  const handleUpdateGuests = (roomTypeId: string, checkIn: string, newGuests: number) => {
    const item = cartItems.find(item => item.roomType.id === roomTypeId && item.checkIn === checkIn);
    if (item) {
      const maxGuests = item.roomType.capacity * item.roomCount;
      updateGuests(roomTypeId, checkIn, Math.max(1, Math.min(newGuests, maxGuests)));
    }
  };

  const handleUpdateRoomCount = (roomTypeId: string, checkIn: string, newRoomCount: number) => {
    if (newRoomCount <= 0) {
      // Remove the item from cart when room count reaches 0
      removeFromCart(roomTypeId, checkIn);
    } else {
      updateRoomCount(roomTypeId, checkIn, newRoomCount);
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    window.location.href = '/checkout';
  };

  const handleContinueShopping = () => {
    window.location.href = '/rooms';
  };

  const totalPrice = getTotalPrice();
  const totalGuests = cartItems.reduce((sum, item) => sum + item.guests, 0);
  const totalRooms = cartItems.reduce((sum, item) => sum + item.roomCount, 0);
  const totalNights = cartItems.length > 0 ? cartItems[0].nights : 0;

  if (isLoading) {
    return (
      <UserLayout>
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-background p-6 rounded-lg">
                  <div className="h-6 bg-secondary-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <ShoppingCartIcon className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-primary-800">Váš košík</h1>
          </div>
          <Button variant="outline" onClick={handleContinueShopping}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Pokračovať v nákupoch
          </Button>
        </div>

        {cartItems.length === 0 ? (
          <EmptyCart onContinueShopping={handleContinueShopping} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-background rounded-lg shadow-md overflow-hidden">
                <div className="bg-primary-50 px-6 py-4 border-b border-primary-100">
                  <h2 className="text-lg font-semibold text-primary-800">
                    Vybraté izby ({totalRooms})
                  </h2>
                </div>
                
                <div className="divide-y divide-secondary-200">
                  {cartItems.map((item) => (
                    <CartItemCard
                      key={item.roomType.id}
                      item={item}
                      onRemove={handleRemoveItem}
                      onUpdateGuests={handleUpdateGuests}
                      onUpdateRoomCount={handleUpdateRoomCount}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <CartSummary
                cartItems={cartItems}
                totalPrice={totalPrice}
                totalGuests={totalGuests}
                totalRooms={totalRooms}
                totalNights={totalNights}
                onProceedToCheckout={handleProceedToCheckout}
                onContinueShopping={handleContinueShopping}
              />
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}