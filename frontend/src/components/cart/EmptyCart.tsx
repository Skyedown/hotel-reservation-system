'use client';

import { Button } from '@/components/ui/Button';
import { ShoppingCartIcon, BedIcon } from 'lucide-react';

interface EmptyCartProps {
  onContinueShopping: () => void;
}

export function EmptyCart({ onContinueShopping }: EmptyCartProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingCartIcon className="h-12 w-12 text-primary-600" />
      </div>
      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Váš košík je prázdny</h2>
      <p className="text-secondary-600 mb-8 max-w-md mx-auto">
        Zdá sa, že ste ešte nepridali žiadne izby do košíka. 
        Prezrite si naše krásne ubytovanie a nájdite ideálnu izbu pre váš pobyt.
      </p>
      <Button onClick={onContinueShopping} size="lg">
        <BedIcon className="h-5 w-5 mr-2" />
        Prezerať izby
      </Button>
    </div>
  );
}