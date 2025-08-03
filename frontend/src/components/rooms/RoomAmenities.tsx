'use client';

import { WifiIcon, CoffeeIcon } from 'lucide-react';

export function RoomAmenities() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary-800 mb-4">Vybavenie izieb</h2>
          <p className="text-secondary-600 text-lg">Každá izba obsahuje tieto prémiové funkcie</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <WifiIcon className="h-8 w-8 text-primary-600" />
            </div>
            <p className="text-sm font-medium text-secondary-800">Bezplatná Wi-Fi</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📺</span>
            </div>
            <p className="text-sm font-medium text-secondary-800">Smart TV</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">❄️</span>
            </div>
            <p className="text-sm font-medium text-secondary-800">Klimatizácia</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <CoffeeIcon className="h-8 w-8 text-primary-600" />
            </div>
            <p className="text-sm font-medium text-secondary-800">Kávovar</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🛁</span>
            </div>
            <p className="text-sm font-medium text-secondary-800">Luxusná kúpeľňa</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🧴</span>
            </div>
            <p className="text-sm font-medium text-secondary-800">Prémiové toaletné potreby</p>
          </div>
        </div>
      </div>
    </section>
  );
}