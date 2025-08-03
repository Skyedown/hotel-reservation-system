'use client';

import { Elements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { stripePromise, STRIPE_CONFIG } from '@/lib/stripe';
import { ArrowLeftIcon } from 'lucide-react';

interface PaymentStepProps {
  clientSecret: string;
  totalAmount: number;
  guestEmail: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
  onPrev: () => void;
  isLoading: boolean;
}

export function PaymentStep({
  clientSecret,
  totalAmount,
  guestEmail,
  onPaymentSuccess,
  onPaymentError,
  onPrev,
  isLoading,
}: PaymentStepProps) {
  return (
    <div className="bg-background rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-primary-800 mb-6">Platba</h2>
      
      <Elements 
        stripe={stripePromise} 
        options={{ 
          clientSecret,
          appearance: STRIPE_CONFIG.appearance,
        }}
      >
        <PaymentForm
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          isLoading={isLoading}
          totalAmount={totalAmount}
          guestEmail={guestEmail}
        />
      </Elements>
      
      <div className="flex justify-start mt-6">
        <Button variant="outline" onClick={onPrev} type="button">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Späť na kontrolu
        </Button>
      </div>
    </div>
  );
}