'use client';

import { Button } from '@/components/ui/Button';
import { Reservation } from '@/lib/types';
import { formatCurrency, getRoomTypeLabel } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

interface ConfirmationStepProps {
  completedReservations: Reservation[];
  totalPrice: number;
  paymentIntentId: string | null;
}

export function ConfirmationStep({
  completedReservations,
  totalPrice,
  paymentIntentId,
}: ConfirmationStepProps) {
  return (
    <div className="bg-background rounded-lg shadow-md p-8 text-center">
      <div className="relative">
        <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <CheckIcon className="h-10 w-10 text-success-600" />
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 border-4 border-success-200 rounded-full animate-ping"></div>
      </div>

      <h2 className="text-3xl font-bold text-secondary-900 mb-4">
        🎉 Rezervácia potvrdená!
      </h2>
      <p className="text-secondary-600 mb-8 text-lg">
        Ďakujeme, že ste si vybrali Luxury Hotel! Vaša platba bola úspešne
        spracovaná.
      </p>

      <div className="bg-primary-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-primary-800 mb-4">
          Súhrn rezervácie
        </h3>
        <div className="space-y-4 text-left">
          {completedReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-background border border-primary-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-secondary-900">
                    {getRoomTypeLabel(reservation.room?.type || 'STANDARD')}
                  </h4>
                  <p className="text-secondary-600">
                    Room {reservation.room?.roomNumber}
                  </p>
                  <p className="text-sm text-primary-700 font-mono bg-primary-100 inline-block px-2 py-1 rounded mt-1">
                    Confirmation: #
                    {reservation.accessToken.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary-600">
                    {formatCurrency(reservation.totalPrice)}
                  </div>
                  <div className="text-sm text-secondary-600">
                    {new Date(reservation.checkIn).toLocaleDateString()} -{' '}
                    {new Date(reservation.checkOut).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-200 pt-4 mt-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Celková zaplatená suma:</span>
            <span className="text-primary-600">
              {formatCurrency(totalPrice)}
            </span>
          </div>
          {paymentIntentId && (
            <p className="text-sm text-secondary-600 mt-2">
              ID platby: {paymentIntentId}
            </p>
          )}
        </div>
      </div>

      <div className="bg-info-50 border border-info-200 rounded-lg p-4 mb-8 text-left">
        <h4 className="font-semibold text-info-800 mb-2">📧 Čo ďalšie?</h4>
        <ul className="text-sm text-info-700 space-y-1">
          <li>
            • Skontrolujte si email pre podrobné potvrdenie a pokyny na
            prihlásenie
          </li>
          <li>• Prijďte do hotela po 15:00 v deň vašho prihlásenia</li>
          <li>
            • Prineste si platný doklad totožnosti a kreditnú kartu použitú pre
            rezerváciu
          </li>
          <li>• Kontaktujte nás na +1 (555) 123-4567, ak potrebujete pomoc</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => (window.location.href = '/')}
          size="lg"
        >
          Späť domov
        </Button>
        <Button onClick={() => (window.location.href = '/rooms')} size="lg">
          Rezervovať ďalší pobyt
        </Button>
      </div>
    </div>
  );
}
