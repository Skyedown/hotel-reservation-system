'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { CartItem } from '@/lib/types';
import { formatCurrency, getRoomTypeLabel } from '@/lib/utils';
import { CalendarIcon, UsersIcon, ArrowLeftIcon } from 'lucide-react';

interface CheckoutFormData {
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  terms: boolean;
}

interface ReviewStepProps {
  cartItems: CartItem[];
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
}

export function ReviewStep({ 
  cartItems, 
  register, 
  errors, 
  onNext, 
  onPrev, 
  isLoading 
}: ReviewStepProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-primary-800 mb-6">Skontrolujte vašu rezerváciu</h2>
      
      <div className="space-y-6">
        {cartItems.map((item) => (
          <div key={item.roomType.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900">
                  {getRoomTypeLabel(item.roomType.name)}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary-600">
                  {formatCurrency(item.subtotal)}
                </div>
                <div className="text-sm text-secondary-600">
                  {item.nights === 1 ? '1 noc' : item.nights >= 2 && item.nights <= 4 ? `${item.nights} noci` : `${item.nights} nocí`}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center text-secondary-600">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <div>
                  <div>Prihlásenie</div>
                  <div className="font-medium">{new Date(item.checkIn).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center text-secondary-600">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <div>
                  <div>Odhlásenie</div>
                  <div className="font-medium">{new Date(item.checkOut).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center text-secondary-600">
                <UsersIcon className="h-4 w-4 mr-2" />
                <div>
                  <div>Hostia</div>
                  <div className="font-medium">{item.guests}</div>
                </div>
              </div>
              <div className="flex items-center text-secondary-600">
                <div>
                  <div>Cena</div>
                  <div className="font-medium">{formatCurrency(item.roomType.price)}/noc</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-6 mt-6">
        <label className="flex items-start">
          <input
            type="checkbox"
            {...register('terms', { required: true })}
            className="mt-1 mr-3"
          />
          <span className="text-sm text-secondary-700">
            Súhlasím s{' '}
            <a href="/terms" className="text-primary-600 hover:text-primary-700 underline">
              obchodnými podmienkami
            </a>{' '}
            a{' '}
            <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
              zásadami ochrany súkromia
            </a>
          </span>
        </label>
        {errors.terms && (
          <p className="text-error-600 text-sm mt-1">Prosím prijmite obchodné podmienky</p>
        )}
      </div>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onPrev} type="button">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Späť
        </Button>
        <Button onClick={onNext} type="button" isLoading={isLoading}>
          Pokračovať na platbu
        </Button>
      </div>
    </div>
  );
}