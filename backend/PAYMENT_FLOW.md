# Secure Payment Flow with Stripe Webhooks

## Overview

This implementation provides a secure, production-ready payment flow using Stripe webhooks with a comprehensive reservation state machine for the hotel reservation system.

## Key Features

### 🔐 Security Features
- **Webhook Signature Verification**: All Stripe webhooks are cryptographically verified
- **Idempotency**: Prevents duplicate webhook processing
- **Access Token-based Reservations**: No user authentication required
- **Payment Intent Metadata**: Rich context for all transactions

### 🔄 State Machine
The reservation system uses a robust state machine with the following states:
- `PENDING` → Initial reservation state
- `CONFIRMED` → Payment completed, reservation confirmed
- `CHECKED_IN` → Guest has checked in
- `CHECKED_OUT` → Guest has completed stay
- `CANCELLED` → Reservation cancelled

### 📧 Email Notifications
Automated email notifications for:
- Payment confirmation
- Reservation confirmation  
- Payment failures
- Cancellations
- Refund processing

### ⏰ Timeout Handling
- **Payment Timeout**: 30 minutes to complete payment
- **Reservation Expiry**: Automatic cleanup of expired reservations
- **Cron Jobs**: Automated cleanup every 5 minutes
- **Grace Periods**: Configurable timeouts for different scenarios

## Architecture

### Payment Flow Sequence

```
1. Guest creates reservation → PENDING state
2. Payment intent created → 30-minute timeout set
3. Guest completes payment → Stripe webhook triggered
4. Webhook verifies signature → Updates payment status
5. State machine transitions → PENDING → CONFIRMED
6. Confirmation email sent → Reservation active
```

### Webhook Events Handled

- `payment_intent.succeeded` → Confirm reservation
- `payment_intent.payment_failed` → Cancel reservation  
- `payment_intent.canceled` → Cancel reservation
- `charge.dispute.created` → Flag for admin review

### Database Schema Updates

#### Reservation Model
```prisma
model Reservation {
  // ... existing fields
  expiresAt        DateTime?  // Timeout handling
  lastStatusChange DateTime   // State tracking
  notes            String?    // Admin notes
}
```

#### Payment Model  
```prisma
model Payment {
  // ... existing fields
  webhookEventId   String?  // Idempotency
  failureReason    String?  // Error tracking
  refundAmount     Float?   // Refund tracking
}
```

## API Endpoints

### GraphQL Mutations

#### Guest Operations
```graphql
# Create payment intent
createPaymentIntent(accessToken: String!): String!

# Check payment status
getPaymentStatus(accessToken: String!): PaymentStatusResult!

# Cancel reservation
cancelReservation(accessToken: String!): Reservation!
```

#### Admin Operations
```graphql
# Process refunds
processRefund(
  reservationId: ID!, 
  amount: Float, 
  reason: String
): RefundResult!

# Update reservation status
updateReservationStatus(
  id: ID!, 
  status: ReservationStatus!
): Reservation!
```

### REST Endpoints

#### Stripe Webhook
```
POST /webhook/stripe
- Verifies webhook signature
- Processes payment events
- Updates reservation states
- Triggers email notifications
```

#### Health Check
```
GET /health
- Server status
- Database connectivity
```

## State Machine Transitions

### Valid Transitions

| From | To | Trigger | Conditions |
|------|----|---------| -----------|
| PENDING | CONFIRMED | Payment Success | Payment completed |
| PENDING | CANCELLED | Payment Failed/Timeout | Payment failed or expired |
| CONFIRMED | CHECKED_IN | Manual/Admin | Within check-in window |
| CHECKED_IN | CHECKED_OUT | Manual/Admin | During stay |
| CONFIRMED/PENDING | CANCELLED | Manual/Admin | Before check-in |

### Automatic Transitions

- **Payment Success** → PENDING to CONFIRMED (via webhook)
- **Payment Failure** → PENDING to CANCELLED (via webhook)  
- **Timeout Expiry** → PENDING/CONFIRMED to CANCELLED (via cron)

## Email Templates

Professional HTML email templates for:

1. **Confirmation Email**
   - Reservation details
   - Management link
   - Check-in instructions

2. **Payment Failed Email**
   - Error explanation
   - Next steps
   - Support contact

3. **Cancellation Email**
   - Cancellation confirmation
   - Refund information
   - Timeline expectations

## Cron Jobs

### Scheduled Tasks

1. **Expired Reservations Cleanup** (Every 5 minutes)
   - Finds expired reservations
   - Transitions to CANCELLED
   - Sends notifications

2. **Expiration Reminders** (Hourly)
   - Upcoming payment deadlines
   - Check-in reminders

3. **Daily Cleanup** (2 AM)
   - Archive old reservations
   - Clean up sensitive data

## Environment Configuration

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Configuration  
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Security Best Practices

### Implemented Security Measures

1. **Webhook Verification**
   - Cryptographic signature validation
   - Timestamp verification
   - Replay attack prevention

2. **Access Control**
   - Token-based reservation access
   - Admin-only operations
   - Role-based permissions

3. **Data Protection**
   - Secure password hashing
   - Environment variable secrets
   - Database connection encryption

4. **Error Handling**
   - Graceful failure modes
   - Detailed logging
   - User-friendly error messages

## Monitoring & Logging

### Key Metrics to Monitor

- Webhook processing success rate
- Payment completion rate  
- Email delivery success
- Cron job execution status
- Database connection health

### Log Events

- All webhook events
- State transitions
- Email sending status
- Error occurrences
- Performance metrics

## Production Deployment

### Required Steps

1. **Stripe Configuration**
   - Set up production keys
   - Configure webhook endpoints
   - Test webhook delivery

2. **Email Service**
   - Configure SMTP provider
   - Set up domain authentication
   - Test email delivery

3. **Database**
   - Run Prisma migrations
   - Seed initial data
   - Set up backups

4. **Monitoring**
   - Set up error tracking
   - Configure alerts
   - Monitor webhook health

## Testing

### Test Scenarios

1. **Happy Path**
   - Create reservation → Pay → Confirm → Check-in → Check-out

2. **Payment Failures**
   - Insufficient funds → Cancellation + Email
   - Network errors → Retry mechanism
   - Expired cards → Proper error handling

3. **Timeout Scenarios**
   - Payment timeout → Auto-cancellation
   - Check-in timeout → Reservation expiry

4. **Admin Operations**
   - Manual status changes
   - Refund processing
   - Bulk operations

This implementation provides a robust, secure, and scalable payment system that handles all edge cases and provides excellent user experience through automated notifications and proper error handling.