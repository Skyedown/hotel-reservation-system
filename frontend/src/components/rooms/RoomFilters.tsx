'use client';

import { RoomType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { FilterIcon } from 'lucide-react';

interface RoomFiltersProps {
  selectedType: RoomType | 'ALL';
  maxPrice: number;
  minCapacity: number;
  resultsCount: number;
  onTypeChange: (type: RoomType | 'ALL') => void;
  onPriceChange: (price: number) => void;
  onCapacityChange: (capacity: number) => void;
}

export function RoomFilters({
  selectedType,
  maxPrice,
  minCapacity,
  resultsCount,
  onTypeChange,
  onPriceChange,
  onCapacityChange,
}: RoomFiltersProps) {
  const roomTypes: { value: RoomType | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Všetky izby' },
    { value: 'STANDARD', label: 'Štandardná' },
    { value: 'DELUXE', label: 'Deluxe' },
    { value: 'SUITE', label: 'Apartmán' },
    { value: 'PRESIDENTIAL', label: 'Prezidentský' },
  ];

  return (
    <section className="py-8 bg-white border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <FilterIcon className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold text-primary-800">
            Filtrovať izby
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Room Type Filter */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Typ izby
            </label>
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value as RoomType | 'ALL')}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-secondary-900"
            >
              {roomTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Max Price Filter */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Max. cena: {formatCurrency(maxPrice)}
            </label>
            <input
              type="range"
              min="50"
              max="500"
              step="25"
              value={maxPrice}
              onChange={(e) => onPriceChange(parseInt(e.target.value))}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-secondary-500 mt-1">
              <span>€50</span>
              <span>€500</span>
            </div>
          </div>

          {/* Capacity Filter */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Min. kapacita
            </label>
            <select
              value={minCapacity}
              onChange={(e) => onCapacityChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-secondary-900"
            >
              <option value={1}>1+ hostí</option>
              <option value={2}>2+ hostia</option>
              <option value={4}>4+ hostia</option>
              <option value={6}>6+ hostí</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="text-sm text-secondary-600">
              <span className="font-semibold text-primary-800">
                {resultsCount}
              </span>{' '}
              {resultsCount === 1
                ? 'izba dostupná'
                : resultsCount < 5
                ? 'izby dostupné'
                : 'izieb dostupných'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}