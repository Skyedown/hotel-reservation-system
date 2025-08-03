# Stripe Payment Integration Setup

This project now uses Stripe's PaymentElement for secure payment processing. Here's how to set it up:

## 1. Stripe Account Setup

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard

## 2. Environment Variables

Update your `.env.local` file with your actual Stripe keys:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here

# GraphQL API Endpoint
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

**Important:** 
- Use test keys (`pk_test_...` and `sk_test_...`) for development
- Never commit real keys to version control
- The `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is safe to expose to the client
- The `STRIPE_SECRET_KEY` should only be used on the server side

## 3. Backend Integration Required

You'll need to implement the following GraphQL mutation in your backend:

```graphql
mutation CreateCheckoutPaymentIntent($input: CreatePaymentIntentInput!) {
  createCheckoutPaymentIntent(input: $input) {
    clientSecret
    paymentIntentId
  }
}
```

### Input Type:
```typescript
interface CreatePaymentIntentInput {
  amount: number;      // Amount in cents (e.g., 5000 = $50.00)
  currency: string;    // e.g., "usd"
  guestEmail: string;  // Customer email
  description: string; // Payment description
}
```

### Response Type:
```typescript
interface PaymentIntentResponse {
  clientSecret: string;   // For client-side payment confirmation
  paymentIntentId: string; // For tracking and reference
}
```

## 4. Payment Flow

The integration follows this flow:

1. **Guest Information** - Collect customer details
2. **Review Booking** - Show order summary and terms acceptance
3. **Create Payment Intent** - Backend creates Stripe PaymentIntent
4. **Payment Processing** - Stripe PaymentElement handles payment
5. **Confirmation** - Create reservations and show success

## 5. Security Features

- **PCI Compliance** - Stripe handles all payment data
- **3D Secure** - Automatic strong customer authentication
- **Fraud Prevention** - Built-in Stripe fraud detection
- **SSL Encryption** - All payment data is encrypted
- **No Card Storage** - Payment details never touch your servers

## 6. Test Cards

For testing, use these Stripe test card numbers:

- **Successful payment:** 4242 4242 4242 4242
- **Requires 3D Secure:** 4000 0000 0000 3220
- **Declined payment:** 4000 0000 0000 0002

Use any future expiry date, any 3-digit CVC, and any billing details.

## 7. Customization

The payment form appearance is configured in `src/lib/stripe.ts` with your brand colors (amber/gold theme). You can customize:

- Colors and fonts
- Field styling
- Error messages
- Payment method types

## 8. Production Checklist

Before going live:

- [ ] Switch to live Stripe keys
- [ ] Set up webhooks for payment confirmations
- [ ] Configure proper error handling
- [ ] Test with real bank accounts
- [ ] Set up monitoring and logging
- [ ] Implement receipt/invoice generation

## Support

- Stripe Documentation: [https://stripe.com/docs](https://stripe.com/docs)
- PaymentElement Guide: [https://stripe.com/docs/payments/payment-element](https://stripe.com/docs/payments/payment-element)
- Test Cards: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)