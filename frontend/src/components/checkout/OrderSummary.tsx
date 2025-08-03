'use client';

import { CartItem } from '@/lib/types';
import { formatCurrency, getRoomTypeLabel } from '@/lib/utils';
import { LockIcon } from 'lucide-react';

interface OrderSummaryProps {
  cartItems: CartItem[];
  totalPrice: number;
  totalGuests: number;
  totalRooms: number;
}

export function OrderSummary({ 
  cartItems, 
  totalPrice, 
  totalGuests, 
  totalRooms 
}: OrderSummaryProps) {
  return (
    <div className="bg-background rounded-lg shadow-md p-6 sticky top-4">
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">Súhrn objednávky</h3>
      
      <div className="space-y-3 border-b pb-4">
        <div className="flex justify-between text-sm">
          <span className="text-secondary-600">Izby:</span>
          <span>{totalRooms}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary-600">Celkom hostí:</span>
          <span>{totalGuests}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary-600">Dĺžka pobytu:</span>
          <span>
            {cartItems[0]?.nights || 0} 
            {(cartItems[0]?.nights || 0) === 1 ? ' noc' : 
             (cartItems[0]?.nights || 0) >= 2 && (cartItems[0]?.nights || 0) <= 4 ? ' noci' : ' nocí'}
          </span>
        </div>
      </div>
      
      <div className="pt-4 space-y-2">
        {cartItems.map((item) => (
          <div key={item.room.id} className="flex justify-between text-sm">
            <span className="text-secondary-600">
              {getRoomTypeLabel(item.room.type)} × {item.nights}
            </span>
            <span>{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Celkom</span>
          <span className="text-2xl font-bold text-primary-600">
            {formatCurrency(totalPrice)}
          </span>
        </div>
      </div>
      
      <div className="mt-6 text-xs text-secondary-500 text-center">
        <LockIcon className="h-4 w-4 inline mr-1" />
        Zabezpečená platba od Stripe
      </div>
    </div>
  );
}