import { loadStripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export const STRIPE_CONFIG = {
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#D97706', // amber-600
      colorBackground: '#ffffff',
      colorText: '#374151', // gray-700
      colorDanger: '#DC2626', // red-600
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '6px',
    },
    rules: {
      '.Input': {
        borderColor: '#D1D5DB', // gray-300
        boxShadow: '0 0 0 1px transparent',
      },
      '.Input:focus': {
        borderColor: '#D97706', // amber-600
        boxShadow: '0 0 0 2px rgba(217, 119, 6, 0.2)',
      },
      '.Label': {
        fontWeight: '500',
        marginBottom: '4px',
      },
    },
  },
};