'use client';

import { Button } from '@/components/ui/Button';
import { CartItem } from '@/lib/types';
import { formatCurrency, getRoomTypeLabel } from '@/lib/utils';
import { ArrowRightIcon } from 'lucide-react';

interface CartSummaryProps {
  cartItems: CartItem[];
  totalPrice: number;
  totalGuests: number;
  totalRooms: number;
  totalNights: number;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export function CartSummary({
  cartItems,
  totalPrice,
  totalGuests,
  totalRooms,
  totalNights,
  onProceedToCheckout,
  onContinueShopping,
}: CartSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h3 className="text-xl font-semibold text-primary-800 mb-6">Súhrn rezervácie</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-secondary-600">Celkom izieb:</span>
          <span className="font-medium">{totalRooms}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary-600">Celkom hostí:</span>
          <span className="font-medium">{totalGuests}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary-600">Dĺžka pobytu:</span>
          <span className="font-medium">{totalNights} {totalNights === 1 ? 'noc' : totalNights < 5 ? 'noci' : 'nocí'}</span>
        </div>
      </div>
      
      <div className="border-t pt-4 space-y-3">
        {cartItems.map((item) => (
          <div key={item.roomType.id} className="flex justify-between text-sm">
            <span className="text-secondary-600">
              {getRoomTypeLabel(item.roomType.name)} × {item.nights}
            </span>
            <span className="font-medium">{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-4 mt-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-semibold text-secondary-900">Celková suma</span>
          <span className="text-2xl font-bold text-primary-600">
            {formatCurrency(totalPrice)}
          </span>
        </div>
        
        <Button
          onClick={onProceedToCheckout}
          className="w-full"
          size="lg"
          disabled={cartItems.length === 0}
        >
          Pokračovať na platbu
          <ArrowRightIcon className="h-4 w-4 ml-2" />
        </Button>
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={onContinueShopping}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          ← Pokračovať v nákupoch
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-primary-50 rounded-lg">
        <h4 className="font-medium text-primary-800 mb-2">Potrebujete pomoc?</h4>
        <p className="text-sm text-primary-700 mb-3">
          Náš concierge tím je k dispozícii 24/7 na pomáhanie s vašou rezerváciou.
        </p>
        <a
          href="/contact"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          Kontaktujte nás →
        </a>
      </div>
    </div>
  );
}