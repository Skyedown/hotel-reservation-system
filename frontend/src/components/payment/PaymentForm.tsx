'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import { LockIcon } from 'lucide-react';

interface PaymentFormProps {
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  isLoading: boolean;
  totalAmount: number;
  guestEmail: string;
}

export function PaymentForm({
  onPaymentSuccess,
  onPaymentError,
  isLoading,
  totalAmount,
  guestEmail,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout?payment_intent_client_secret={CHECKOUT_SESSION_ID}`,
        receipt_email: guestEmail,
      },
      redirect: 'if_required',
    });

    setIsProcessing(false);

    if (error) {
      onPaymentError(error.message || 'An error occurred during payment processing');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Celková suma:</span>
          <span className="text-primary-600">
            €{(totalAmount / 100).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">Platobné údaje</h3>
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <div className="bg-info-50 border border-info-200 rounded-lg p-4">
        <div className="flex items-start">
          <LockIcon className="h-5 w-5 text-info-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-info-800">
            <p className="font-medium mb-1">Zabezpečená platba</p>
            <p>Vaše platobné informácie sú šifrované a zabezpečené. Používame priemyselný štandard SSL šifrovania a nikdy neukladáme vaše platobné údaje.</p>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || !elements || isLoading || isProcessing}
        isLoading={isProcessing}
        className="w-full"
        size="lg"
      >
        <LockIcon className="h-4 w-4 mr-2" />
        {isProcessing ? 'Spracovávam platbu...' : `Zaplatiť €${(totalAmount / 100).toFixed(2)}`}
      </Button>

      <p className="text-xs text-secondary-500 text-center">
        Dokončením nákupu súhlasíte s našimi obchodnými podmienkami a zásadami ochrany súkromia.
      </p>
    </form>
  );
}