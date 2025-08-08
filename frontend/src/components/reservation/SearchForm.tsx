'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchFormData } from '@/lib/types';
import {
  getMinCheckInDate,
  getMinCheckOutDate,
  isValidDateRange,
  sanitizeNumber,
} from '@/lib/utils';
import { CalendarIcon, UsersIcon } from 'lucide-react';

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
  isLoading?: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SearchFormData>({
    defaultValues: {
      guests: 2,
    },
  });

  const guests = watch('guests');

  const handleCheckInChange = (date: Date | null) => {
    setCheckIn(date);
    if (date) {
      setValue('checkIn', date);
      // Auto-adjust checkout if it's before the new check-in
      if (checkOut && checkOut <= date) {
        const newCheckOut = getMinCheckOutDate(date);
        setCheckOut(newCheckOut);
        setValue('checkOut', newCheckOut);
      }
    }
  };

  const handleCheckOutChange = (date: Date | null) => {
    setCheckOut(date);
    if (date) {
      setValue('checkOut', date);
    }
  };

  const onSubmit = (data: SearchFormData) => {
    if (!checkIn || !checkOut) {
      return;
    }

    if (!isValidDateRange(checkIn, checkOut)) {
      return;
    }

    // Sanitize guest count
    const sanitizedGuests = sanitizeNumber(data.guests, 1, 10);

    onSearch({
      checkIn,
      checkOut,
      guests: sanitizedGuests,
    });
  };

  return (
    <div className="bg-background rounded-lg shadow-lg p-6 -mt-16 relative z-10 mx-4 max-w-4xl lg:mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Check-in Date */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Check-in
            </label>
            <div className="relative">
              <DatePicker
                selected={checkIn}
                onChange={handleCheckInChange}
                minDate={getMinCheckInDate()}
                placeholderText="Vybrat datum"
                className="w-full h-10 px-3 py-2 border bg-background border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 placeholder:text-secondary-400"
                dateFormat="MMM dd, yyyy"
              />
              <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-secondary-400 pointer-events-none" />
            </div>
            {errors.checkIn && (
              <p className="mt-1 text-sm text-error-600">
                {errors.checkIn.message}
              </p>
            )}
          </div>

          {/* Check-out Date */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Check-out
            </label>
            <div className="relative">
              <DatePicker
                selected={checkOut}
                onChange={handleCheckOutChange}
                minDate={
                  checkIn ? getMinCheckOutDate(checkIn) : getMinCheckInDate()
                }
                placeholderText="Vybrat datum"
                className="w-full h-10 px-3 py-2 border bg-background border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 placeholder:text-secondary-400"
                dateFormat="MMM dd, yyyy"
              />
              <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-secondary-400 pointer-events-none" />
            </div>
            {errors.checkOut && (
              <p className="mt-1 text-sm text-error-600">
                {errors.checkOut.message}
              </p>
            )}
          </div>

          {/* Guests */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Hostia
            </label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                max="10"
                placeholder="1"
                {...register('guests', {
                  required: 'Počet hostí je povinný',
                  min: { value: 1, message: 'Minimálne 1 hosť je povinný' },
                  max: { value: 10, message: 'Maximálne 10 hostí je povolené' },
                  valueAsNumber: true,
                })}
                error={errors.guests?.message}
              />
              <UsersIcon className="absolute right-8 top-3 h-4 w-4 text-secondary-400 pointer-events-none" />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              disabled={!checkIn || !checkOut || !guests}
            >
              Vyhľadať izby
            </Button>
          </div>
        </div>

        {/* Validation Messages */}
        {checkIn && checkOut && !isValidDateRange(checkIn, checkOut) && (
          <p className="text-sm text-error-600 text-center">
            Prosím vyberte platné dátumy. Odhlásenie musí byť po prihlásení a
            minimálne 1 noc.
          </p>
        )}
      </form>
    </div>
  );
}
