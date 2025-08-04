'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CheckoutFormData {
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  terms: boolean;
}

interface GuestInfoStepProps {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  onNext: () => void;
}

export function GuestInfoStep({ register, errors, onNext }: GuestInfoStepProps) {
  return (
    <div className="bg-background rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-primary-800 mb-6">Informácie o hosťovi</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Krstné meno"
          {...register('guestFirstName', { required: 'Krstné meno je povinné' })}
          error={errors.guestFirstName?.message}
          placeholder="John"
        />
        
        <Input
          label="Priezvisko"
          {...register('guestLastName', { required: 'Priezvisko je povinné' })}
          error={errors.guestLastName?.message}
          placeholder="Doe"
        />
        
        <Input
          label="Emailová adresa"
          type="email"
          {...register('guestEmail', {
            required: 'Email je povinný',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Zadajte platnú emailovú adresu',
            },
          })}
          error={errors.guestEmail?.message}
          placeholder="john@example.com"
        />
        
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Phone Number
          </label>
          <input
            {...register('guestPhone', { 
              required: 'Phone number is required',
              pattern: {
                value: /^\+?[\d\s\-\(\)]+$/,
                message: 'Please enter a valid phone number'
              }
            })}
            type="tel"
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 placeholder-secondary-500"
            placeholder="+1 (555) 123-4567"
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length > 0) {
                if (value.length <= 3) {
                  value = `(${value}`;
                } else if (value.length <= 6) {
                  value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                } else {
                  value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                }
              }
              e.target.value = value;
            }}
          />
          {errors.guestPhone && (
            <p className="mt-1 text-sm text-error-600">{errors.guestPhone.message}</p>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Special Requests (Optional)
        </label>
        <textarea
          {...register('specialRequests')}
          rows={4}
          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 placeholder-secondary-500"
          placeholder="Any special requests or requirements..."
        />
      </div>
      
      <div className="flex justify-end mt-8">
        <Button onClick={onNext} type="button">
          Pokračovať na kontrolu
        </Button>
      </div>
    </div>
  );
}