'use client';

import { CartItem } from '@/lib/types';
import { formatCurrency, getRoomTypeLabel } from '@/lib/utils';
import { 
  TrashIcon,
  CalendarIcon,
  UsersIcon,
  PlusIcon,
  MinusIcon,
  BedIcon,
} from 'lucide-react';
import Image from 'next/image';

interface CartItemCardProps {
  item: CartItem;
  onRemove: (roomId: string, checkIn: string) => void;
  onUpdateGuests: (roomId: string, checkIn: string, newGuests: number) => void;
}

export function CartItemCard({ item, onRemove, onUpdateGuests }: CartItemCardProps) {
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Room Image */}
        <div className="w-full md:w-48 h-32 bg-secondary-200 rounded-lg overflow-hidden flex-shrink-0">
          {item.room.images.length > 0 ? (
            <Image
              src={item.room.images[0]}
              alt={`${item.room.type} - ${item.room.roomNumber}`}
              width={192}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-secondary-400">
              <BedIcon className="h-8 w-8" />
            </div>
          )}
        </div>
        
        {/* Room Details */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-1">
                {getRoomTypeLabel(item.room.type)}
              </h3>
              <p className="text-secondary-600 mb-2">
                Izba {item.room.roomNumber} • Max {item.room.capacity} {item.room.capacity === 1 ? 'hosť' : item.room.capacity < 5 ? 'hostia' : 'hostí'}
              </p>
              <p className="text-secondary-700 text-sm line-clamp-2">
                {item.room.description}
              </p>
            </div>
            <button
              onClick={() => onRemove(item.room.id, item.checkIn)}
              className="text-error-500 hover:text-error-700 p-2 rounded-full hover:bg-error-50 transition-colors"
              title="Odstrániť z košíka"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Booking Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-sm text-secondary-600">
              <CalendarIcon className="h-4 w-4 mr-2 text-primary-600" />
              <div>
                <div className="font-medium">Prihlásenie</div>
                <div>{new Date(item.checkIn).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="flex items-center text-sm text-secondary-600">
              <CalendarIcon className="h-4 w-4 mr-2 text-primary-600" />
              <div>
                <div className="font-medium">Odhlásenie</div>
                <div>{new Date(item.checkOut).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="flex items-center text-sm text-secondary-600">
              <UsersIcon className="h-4 w-4 mr-2 text-primary-600" />
              <div>
                <div className="font-medium">Dĺžka</div>
                <div>{item.nights} {item.nights === 1 ? 'noc' : item.nights < 5 ? 'noci' : 'nocí'}</div>
              </div>
            </div>
          </div>
          
          {/* Guest Count and Pricing */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-secondary-700">Hostia:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateGuests(item.room.id, item.checkIn, item.guests - 1)}
                  disabled={item.guests <= 1}
                  className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-medium">{item.guests}</span>
                <button
                  onClick={() => onUpdateGuests(item.room.id, item.checkIn, item.guests + 1)}
                  disabled={item.guests >= item.room.capacity}
                  className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-secondary-600 mb-1">
                {formatCurrency(item.room.price)} × {item.nights} {item.nights === 1 ? 'noc' : item.nights < 5 ? 'noci' : 'nocí'}
              </div>
              <div className="text-xl font-bold text-primary-600">
                {formatCurrency(item.subtotal)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}