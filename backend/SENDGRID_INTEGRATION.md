# SendGrid Email Integration & Payment Reminder System

## Overview

This document outlines the complete SendGrid integration with automated payment reminder sequences for the hotel reservation system.

## Features Implemented

### 🔐 SendGrid Email Service
- **Professional Email Templates**: HTML and text versions with hotel branding
- **Dynamic Template Support**: Optional SendGrid dynamic templates with fallback
- **Error Handling & Retry Logic**: Automatic retry mechanism with failure tracking
- **Database Tracking**: All email reminders tracked in the database

### 📧 Email Types & Templates

#### Payment Reminders
1. **24-Hour Reminder** (`PAYMENT_REMINDER_24H`)
   - Sent when payment expires in 24 hours
   - Professional design with amber/warning theme
   - Complete reservation details and payment link

2. **1-Hour Urgent Reminder** (`PAYMENT_REMINDER_1H`)
   - Sent when payment expires in 1 hour
   - Red/urgent theme with blinking animations
   - Critical action required messaging

3. **Final Warning - 15 Minutes** (`PAYMENT_FINAL_WARNING`)
   - Last chance notification before cancellation
   - Maximum urgency design with pulsing animations
   - Clear consequences of inaction

#### Other Email Types
4. **Check-in Reminder** (`CHECKIN_REMINDER_24H`)
   - Sent 24 hours before check-in
   - Includes check-in instructions and what to bring
   - Professional blue theme

## Automated Reminder System

### Cron Job Schedule
- **Reminder Scheduling**: Every hour - Creates reminder database entries
- **Reminder Processing**: Every 15 minutes - Sends scheduled emails
- **Cleanup Tasks**: Every 5 minutes - Expired reservations

### Smart Scheduling Logic
```typescript
// Payment reminder timeline:
24+ hours until expiry → Schedule 24h reminder
1-24 hours until expiry → Schedule 1h reminder  
15min-1hour until expiry → Schedule final warning
```

### Database Schema

#### EmailReminder Model
```prisma
model EmailReminder {
  id            String        @id @default(cuid())
  reservationId String
  emailType     EmailType
  scheduledFor  DateTime
  sentAt        DateTime?
  status        ReminderStatus @default(PENDING)
  attempts      Int           @default(0)
  lastError     String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  reservation Reservation @relation(fields: [reservationId], references: [id], onDelete: Cascade)
}
```

#### Email Types
- `PAYMENT_REMINDER_24H`
- `PAYMENT_REMINDER_1H`  
- `PAYMENT_FINAL_WARNING`
- `CHECKIN_REMINDER_24H`
- `CHECKIN_REMINDER_2H`
- `CHECKOUT_REMINDER`

#### Reminder Status
- `PENDING` - Scheduled but not sent
- `SENT` - Successfully delivered
- `FAILED` - Failed after max attempts
- `CANCELLED` - No longer needed

## Configuration

### Environment Variables
```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Optional: SendGrid Dynamic Template IDs
SENDGRID_PAYMENT_REMINDER_24H_TEMPLATE=d-24hour-template-id
SENDGRID_PAYMENT_REMINDER_1H_TEMPLATE=d-1hour-template-id
SENDGRID_PAYMENT_FINAL_TEMPLATE=d-final-template-id
SENDGRID_CHECKIN_REMINDER_TEMPLATE=d-checkin-template-id

# Hotel Branding
HOTEL_NAME=Your Hotel Name
FRONTEND_URL=http://localhost:3000
```

### Fallback Behavior
- If SendGrid API key is not configured, the service logs messages instead of sending
- Built-in HTML templates used if dynamic templates not configured
- Graceful degradation ensures system continues operating

## Email Templates

### Design Features
- **Professional Branding**: Consistent hotel theme across all emails
- **Mobile Responsive**: Optimized for all device sizes
- **Clear Call-to-Actions**: Prominent payment buttons with direct links
- **Visual Hierarchy**: Color-coded urgency levels (amber → red → critical red)
- **Complete Information**: All reservation details included in every email

### Template Structure
1. **Header Section**: Hotel branding and urgency level
2. **Message Body**: Personalized greeting and clear action required
3. **Reservation Details**: Room info, dates, pricing
4. **Action Button**: Direct link to payment page
5. **Footer**: Contact information and legal text

## Error Handling & Monitoring

### Retry Logic
- **Maximum Attempts**: 3 tries per email
- **Retry Delay**: 5 minutes between attempts
- **Failure Tracking**: Database logging of all errors
- **Automatic Cancellation**: Stop trying if reservation status changes

### Monitoring Points
- Email delivery success rate
- Template rendering errors
- SendGrid API response codes
- Database operation failures
- Cron job execution status

## Integration Points

### State Machine Integration
- `reservationStateMachine.ts` uses SendGrid service for all confirmations
- Automatic email sending on status transitions
- Consistent branding across all reservation communications

### Cron Service Integration
- Automated reminder scheduling based on reservation timeline
- Intelligent deduplication prevents duplicate emails
- Status-aware processing (skip reminders for completed payments)

## Production Deployment

### SendGrid Setup
1. **Create SendGrid Account** and obtain API key
2. **Domain Authentication** for better deliverability
3. **Optional**: Create dynamic templates in SendGrid dashboard
4. **Configure Environment Variables** in production

### Monitoring Setup
1. **SendGrid Analytics** - Track open rates, click rates
2. **Database Monitoring** - Monitor EmailReminder table growth
3. **Log Monitoring** - Track email sending success/failure rates
4. **Alert Setup** - Notify on high failure rates

## Testing

### Test Scenarios
1. **Happy Path**: Reservation → Reminder scheduling → Email delivery
2. **Payment Completion**: Verify reminders cancelled when payment succeeds
3. **Failure Handling**: Test retry logic with invalid email addresses
4. **Template Rendering**: Verify all email templates render correctly
5. **Timing Logic**: Test reminder scheduling at different payment windows

### Manual Testing Commands
```bash
# Check scheduled reminders
SELECT * FROM email_reminders WHERE status = 'PENDING';

# Check reminder processing
SELECT emailType, status, COUNT(*) FROM email_reminders GROUP BY emailType, status;

# Test email templates (in development)
# Create test reservation and trigger reminder manually
```

## Security Considerations

### Email Security
- **API Key Protection**: SendGrid API key stored in environment variables
- **Access Token Links**: Reservation links use secure access tokens
- **No Sensitive Data**: Credit card info never included in emails
- **Unsubscribe Compliance**: Follow email marketing regulations

### Data Privacy
- **Minimal Data Exposure**: Only necessary reservation info in emails
- **Secure Links**: All management links use HTTPS
- **Data Retention**: Email reminders cleaned up after 30 days

## Performance Optimization

### Batch Processing
- Process multiple reminders in single database query
- Efficient cron job scheduling reduces database load
- Connection pooling for database operations

### Email Delivery
- Asynchronous sending prevents blocking operations
- Retry logic with exponential backoff
- Rate limiting to stay within SendGrid limits

## Maintenance Tasks

### Regular Monitoring
- Check EmailReminder table size monthly
- Monitor SendGrid usage and costs
- Review failure rates and common error patterns
- Update email templates based on guest feedback

### Cleanup Tasks
- Archive old email reminders (automated daily cleanup)
- Remove cancelled reminders periodically
- Monitor database growth and optimize queries

This comprehensive SendGrid integration provides a professional, reliable email system for the hotel reservation platform with automated payment reminders and excellent error handling.