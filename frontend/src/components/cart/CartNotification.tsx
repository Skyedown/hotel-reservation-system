'use client';

import { useEffect, useState } from 'react';
import { CartItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { CheckCircleIcon, X, ShoppingCartIcon } from 'lucide-react';
import Link from 'next/link';

interface CartNotificationProps {
  isVisible: boolean;
  cartItems: CartItem[];
  onClose: () => void;
}

export function CartNotification({ isVisible, cartItems, onClose }: CartNotificationProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      // Delay unmounting for animation
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!shouldRender) return null;

  const totalItems = cartItems.length;
  const totalPrice = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const latestItem = cartItems[cartItems.length - 1];

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
        isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg border border-secondary-200 p-4 min-w-80 max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-success-600 mr-2" />
            <h3 className="font-semibold text-secondary-900">Pridané do košíka</h3>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Latest added item */}
        {latestItem && (
          <div className="mb-3 p-2 bg-primary-50 rounded border border-primary-200">
            <p className="font-medium text-secondary-900 text-sm">
              {latestItem.room.type} - {latestItem.room.roomNumber}
            </p>
            <p className="text-xs text-secondary-600">
              {new Date(latestItem.checkIn).toLocaleDateString()} - {new Date(latestItem.checkOut).toLocaleDateString()}
            </p>
            <p className="text-xs text-secondary-600">
              {latestItem.guests} {latestItem.guests === 1 ? 'hosť' : 'hostia'} • {latestItem.nights} {latestItem.nights === 1 ? 'noc' : 'noci'}
            </p>
            <p className="font-semibold text-primary-700 text-sm">
              {formatCurrency(latestItem.subtotal)}
            </p>
          </div>
        )}

        {/* Cart summary */}
        <div className="border-t border-secondary-200 pt-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <ShoppingCartIcon className="h-4 w-4 text-secondary-600 mr-1" />
              <span className="text-sm text-secondary-600">
                {totalItems} {totalItems === 1 ? 'položka' : 'položky'} v košíku
              </span>
            </div>
            <span className="font-semibold text-secondary-900">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 text-sm font-medium text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-md transition-colors"
            >
              Pokračovať v nákupe
            </button>
            <Link
              href="/cart"
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors text-center"
              onClick={onClose}
            >
              Zobraziť košík
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}