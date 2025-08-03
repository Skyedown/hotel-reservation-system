import sgMail from '@sendgrid/mail';
import { Reservation, Room, EmailType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EmailTemplate {
  templateId?: string; // SendGrid template ID
  subject: string;
  html: string;
  text: string;
  dynamicTemplateData?: Record<string, any>;
}

export class SendGridEmailService {
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.initialized = true;
      console.log('✅ SendGrid email service initialized');
    } else {
      console.log('⚠️ SendGrid API key not found, using fallback email service');
    }
  }

  async sendEmail(to: string, template: EmailTemplate, emailType?: EmailType, reservationId?: string): Promise<void> {
    if (!this.initialized) {
      console.log('SendGrid not configured, skipping email to:', to);
      console.log('Subject:', template.subject);
      return;
    }

    try {
      const emailData: sgMail.MailDataRequired = {
        to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@hotel.com',
          name: process.env.HOTEL_NAME || 'Hotel Reservation System'
        },
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      // Use SendGrid template if provided
      if (template.templateId && template.dynamicTemplateData) {
        emailData.templateId = template.templateId;
        emailData.dynamicTemplateData = template.dynamicTemplateData;
        delete emailData.html;
        delete emailData.text;
        delete emailData.subject;
      }

      await sgMail.send(emailData);
      
      console.log(`✅ Email sent successfully to: ${to} (${emailType || 'notification'})`);

      // Track email in database if it's a reminder
      if (emailType && reservationId) {
        await this.markReminderAsSent(reservationId, emailType);
      }

    } catch (error: any) {
      console.error('❌ Failed to send email:', error);
      
      // Track failed email in database
      if (emailType && reservationId) {
        await this.markReminderAsFailed(reservationId, emailType, error.message);
      }
      
      throw error;
    }
  }

  // Check-in reminder template (24 hours before check-in)
  generateCheckInReminder24H(reservation: Reservation & { room: Room }): EmailTemplate {
    const managementUrl = `${process.env.FRONTEND_URL}/reservation/${reservation.accessToken}`;
    const checkInDate = new Date(reservation.checkIn);
    const checkOutDate = new Date(reservation.checkOut);

    return {
      templateId: process.env.SENDGRID_CHECKIN_REMINDER_TEMPLATE,
      subject: `🏨 Check-in Reminder - Tomorrow at ${checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      dynamicTemplateData: {
        guestName: `${reservation.guestFirstName} ${reservation.guestLastName}`,
        roomNumber: reservation.room.roomNumber,
        roomType: reservation.room.type,
        checkInDate: checkInDate.toLocaleDateString(),
        checkInTime: checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        checkOutDate: checkOutDate.toLocaleDateString(),
        managementUrl,
        reservationId: reservation.id,
        hotelName: process.env.HOTEL_NAME || 'Our Hotel'
      },
      text: `
Check-in Reminder

Dear ${reservation.guestFirstName} ${reservation.guestLastName},

This is a friendly reminder that your check-in is scheduled for tomorrow!

Reservation Details:
- Room: ${reservation.room.roomNumber} (${reservation.room.type})
- Check-in: ${checkInDate.toLocaleDateString()} at ${checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
- Check-out: ${checkOutDate.toLocaleDateString()}

Manage your reservation: ${managementUrl}

We look forward to welcoming you!

Best regards,
${process.env.HOTEL_NAME || 'Hotel'} Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Check-in Reminder</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; background: #f9f9f9; }
    .reminder-box { background: #dbeafe; border: 2px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .reservation-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .time { font-size: 20px; font-weight: bold; color: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏨 Check-in Reminder</h1>
      <div class="time">Tomorrow at ${checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
    
    <div class="content">
      <p>Dear ${reservation.guestFirstName} ${reservation.guestLastName},</p>
      
      <div class="reminder-box">
        <h3>📅 Your stay begins tomorrow!</h3>
        <p>We're excited to welcome you to ${process.env.HOTEL_NAME || 'our hotel'}.</p>
      </div>
      
      <div class="reservation-details">
        <h3>Reservation Details:</h3>
        <p><strong>Room:</strong> ${reservation.room.roomNumber} (${reservation.room.type})</p>
        <p><strong>Check-in:</strong> ${checkInDate.toLocaleDateString()} at ${checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        <p><strong>Check-out:</strong> ${checkOutDate.toLocaleDateString()}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${managementUrl}" class="button">Manage Your Reservation</a>
      </div>
      
      <p>If you need to make any changes or have special requests, please contact us or use the link above.</p>
      
      <p>We look forward to welcoming you!</p>
      
      <p>Best regards,<br>${process.env.HOTEL_NAME || 'Hotel'} Team</p>
    </div>
  </div>
</body>
</html>
      `
    };
  }

  // Payment confirmation email (sent when payment succeeds)
  generatePaymentConfirmationEmail(reservation: Reservation & { room: Room }): EmailTemplate {
    const managementUrl = `${process.env.FRONTEND_URL}/reservation/${reservation.accessToken}`;
    const checkInDate = new Date(reservation.checkIn);
    const checkOutDate = new Date(reservation.checkOut);

    return {
      subject: `✅ Payment Confirmed - Reservation ${reservation.id.slice(-8).toUpperCase()}`,
      text: `
Payment Confirmation

Dear ${reservation.guestFirstName} ${reservation.guestLastName},

Great news! Your payment has been successfully processed and your reservation is now confirmed.

Reservation Details:
- Confirmation #: ${reservation.id.slice(-8).toUpperCase()}
- Room: ${reservation.room.roomNumber} (${reservation.room.type})
- Check-in: ${checkInDate.toLocaleDateString()}
- Check-out: ${checkOutDate.toLocaleDateString()}
- Total Paid: $${reservation.totalPrice}

Manage your reservation: ${managementUrl}

We look forward to welcoming you!

Best regards,
${process.env.HOTEL_NAME || 'Hotel'} Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Confirmed</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; background: #f9f9f9; }
    .success-box { background: #dcfce7; border: 2px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center; }
    .reservation-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
    .button { display: inline-block; background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Confirmed</h1>
      <p>Reservation ${reservation.id.slice(-8).toUpperCase()}</p>
    </div>
    
    <div class="content">
      <p>Dear ${reservation.guestFirstName} ${reservation.guestLastName},</p>
      
      <div class="success-box">
        <h3>🎉 Your reservation is confirmed!</h3>
        <p>Payment successfully processed: <strong>$${reservation.totalPrice}</strong></p>
      </div>
      
      <div class="reservation-details">
        <h3>Reservation Details:</h3>
        <p><strong>Confirmation #:</strong> ${reservation.id.slice(-8).toUpperCase()}</p>
        <p><strong>Room:</strong> ${reservation.room.roomNumber} (${reservation.room.type})</p>
        <p><strong>Check-in:</strong> ${checkInDate.toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${checkOutDate.toLocaleDateString()}</p>
        <p><strong>Total Paid:</strong> $${reservation.totalPrice}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${managementUrl}" class="button">Manage Your Reservation</a>
      </div>
      
      <p>We look forward to welcoming you to ${process.env.HOTEL_NAME || 'our hotel'}!</p>
      
      <p>Best regards,<br>${process.env.HOTEL_NAME || 'Hotel'} Team</p>
    </div>
  </div>
</body>
</html>
      `
    };
  }

  // Send check-in reminder email
  async sendCheckInReminder24H(reservation: Reservation & { room: Room }): Promise<void> {
    const template = this.generateCheckInReminder24H(reservation);
    await this.sendEmail(reservation.guestEmail, template, 'CHECKIN_REMINDER_24H', reservation.id);
  }

  // Send payment confirmation email
  async sendPaymentConfirmationEmail(reservation: Reservation & { room: Room }): Promise<void> {
    const template = this.generatePaymentConfirmationEmail(reservation);
    await this.sendEmail(reservation.guestEmail, template);
  }

  // Send multi-room payment confirmation email  
  async sendMultiRoomPaymentConfirmationEmail(reservations: (Reservation & { room: Room })[]): Promise<void> {
    if (reservations.length === 0) return;
    
    // Use the first reservation for guest info (all should have same guest)
    const primaryReservation = reservations[0];
    const template = this.generateMultiRoomPaymentConfirmationEmail(reservations);
    await this.sendEmail(primaryReservation.guestEmail, template);
  }

  // Generate multi-room payment confirmation email template
  generateMultiRoomPaymentConfirmationEmail(reservations: (Reservation & { room: Room })[]): EmailTemplate {
    if (reservations.length === 0) {
      throw new Error('No reservations provided for multi-room confirmation email');
    }

    const primaryReservation = reservations[0];
    const totalAmount = reservations.reduce((sum, res) => sum + res.totalPrice, 0);
    const checkInDate = new Date(primaryReservation.checkIn);
    const checkOutDate = new Date(primaryReservation.checkOut);
    const managementUrl = `${process.env.FRONTEND_URL}/reservation/${primaryReservation.accessToken}`;

    // Create room details list
    const roomDetails = reservations.map(res => 
      `- Room ${res.room.roomNumber} (${res.room.type}) - ${res.guests} ${res.guests === 1 ? 'guest' : 'guests'} - €${res.totalPrice}`
    ).join('\n');

    const roomDetailsHtml = reservations.map(res => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">Room ${res.room.roomNumber}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${res.room.type}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${res.guests} ${res.guests === 1 ? 'guest' : 'guests'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">€${res.totalPrice}</td>
      </tr>
    `).join('');

    return {
      subject: `✅ Payment Confirmed - ${reservations.length} Rooms Reserved`,
      text: `
Payment Confirmation - Multi-Room Reservation

Dear ${primaryReservation.guestFirstName} ${primaryReservation.guestLastName},

Great news! Your payment has been successfully processed and your ${reservations.length}-room reservation is now confirmed.

Reserved Rooms:
${roomDetails}

Check-in: ${checkInDate.toLocaleDateString()} 
Check-out: ${checkOutDate.toLocaleDateString()}
Total Paid: €${totalAmount}

Manage your reservation: ${managementUrl}

We look forward to welcoming you and your group!

Best regards,
${process.env.HOTEL_NAME || 'Hotel'} Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Confirmed - Multi-Room Reservation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; background: #f9f9f9; }
    .success-box { background: #dcfce7; border: 2px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center; }
    .details { background: white; padding: 20px; margin: 10px 0; border-radius: 4px; border: 1px solid #ddd; }
    .total { font-size: 18px; font-weight: bold; color: #16a34a; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #f3f4f6; padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd; }
    td { padding: 8px; border-bottom: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Payment Confirmed!</h1>
      <p>Your ${reservations.length}-room reservation is ready</p>
    </div>
    
    <div class="content">
      <div class="success-box">
        <h2>✅ Payment Successfully Processed</h2>
        <p>Hello ${primaryReservation.guestFirstName} ${primaryReservation.guestLastName},</p>
        <p>Great news! Your payment has been confirmed and your multi-room reservation is now secured.</p>
      </div>
      
      <div class="details">
        <h3>🏨 Reserved Rooms</h3>
        <table>
          <thead>
            <tr>
              <th>Room</th>
              <th>Type</th>
              <th>Guests</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${roomDetailsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 20px;">
          <p><strong>Check-in:</strong> ${checkInDate.toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${checkOutDate.toLocaleDateString()}</p>
          <p class="total">Total Paid: €${totalAmount}</p>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${managementUrl}" class="button">Manage Your Reservation</a>
      </div>
      
      <p style="text-align: center; color: #666;">
        We look forward to welcoming you and your group!<br>
        <strong>${process.env.HOTEL_NAME || 'Hotel'} Team</strong>
      </p>
    </div>
  </div>
</body>
</html>
      `
    };
  }

  // Cancellation email template
  generateCancellationEmail(reservation: Reservation & { room: Room }): EmailTemplate {
    const checkInDate = new Date(reservation.checkIn);
    const checkOutDate = new Date(reservation.checkOut);

    return {
      subject: `❌ Reservation Cancelled - ${reservation.id.slice(-8).toUpperCase()}`,
      text: `
Reservation Cancellation

Dear ${reservation.guestFirstName} ${reservation.guestLastName},

We're writing to confirm that your reservation has been cancelled.

Cancelled Reservation Details:
- Confirmation #: ${reservation.id.slice(-8).toUpperCase()}
- Room: ${reservation.room.roomNumber} (${reservation.room.type})
- Check-in: ${checkInDate.toLocaleDateString()}
- Check-out: ${checkOutDate.toLocaleDateString()}
- Amount: $${reservation.totalPrice}

If you paid for this reservation, a refund will be processed within 5-7 business days to your original payment method.

If you cancelled by mistake or would like to make a new reservation, please visit our website or contact us directly.

We hope to welcome you in the future.

Best regards,
${process.env.HOTEL_NAME || 'Hotel'} Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reservation Cancelled</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; background: #f9f9f9; }
    .cancellation-box { background: #fef2f2; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center; }
    .reservation-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
    .refund-info { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Reservation Cancelled</h1>
      <p>Confirmation ${reservation.id.slice(-8).toUpperCase()}</p>
    </div>
    
    <div class="content">
      <p>Dear ${reservation.guestFirstName} ${reservation.guestLastName},</p>
      
      <div class="cancellation-box">
        <h3>Your reservation has been cancelled</h3>
        <p>We've processed your cancellation request.</p>
      </div>
      
      <div class="reservation-details">
        <h3>Cancelled Reservation Details:</h3>
        <p><strong>Confirmation #:</strong> ${reservation.id.slice(-8).toUpperCase()}</p>
        <p><strong>Room:</strong> ${reservation.room.roomNumber} (${reservation.room.type})</p>
        <p><strong>Check-in:</strong> ${checkInDate.toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${checkOutDate.toLocaleDateString()}</p>
        <p><strong>Amount:</strong> $${reservation.totalPrice}</p>
      </div>
      
      <div class="refund-info">
        <h4>💳 Refund Information</h4>
        <p>If you paid for this reservation, a refund will be processed within <strong>5-7 business days</strong> to your original payment method.</p>
      </div>
      
      <p>If you cancelled by mistake or would like to make a new reservation, please visit our website or contact us directly.</p>
      
      <p>We hope to welcome you in the future.</p>
      
      <p>Best regards,<br>${process.env.HOTEL_NAME || 'Hotel'} Team</p>
    </div>
  </div>
</body>
</html>
      `
    };
  }

  // Payment failed email template
  generatePaymentFailedEmail(reservation: Reservation & { room: Room }): EmailTemplate {
    const checkInDate = new Date(reservation.checkIn);
    const checkOutDate = new Date(reservation.checkOut);

    return {
      subject: `💳 Payment Failed - Reservation ${reservation.id.slice(-8).toUpperCase()}`,
      text: `
Payment Failed

Dear ${reservation.guestFirstName} ${reservation.guestLastName},

We're sorry to inform you that we were unable to process your payment for the following reservation:

Reservation Details:
- Confirmation #: ${reservation.id.slice(-8).toUpperCase()}
- Room: ${reservation.room.roomNumber} (${reservation.room.type})
- Check-in: ${checkInDate.toLocaleDateString()}
- Check-out: ${checkOutDate.toLocaleDateString()}
- Amount: $${reservation.totalPrice}

Your reservation has been cancelled due to the payment failure. If you still wish to make this reservation, please:

1. Check that your payment method has sufficient funds
2. Verify your card details are correct
3. Try booking again on our website

If you continue to experience issues, please contact us directly for assistance.

Retry booking: ${process.env.FRONTEND_URL}/rooms

We apologize for any inconvenience.

Best regards,
${process.env.HOTEL_NAME || 'Hotel'} Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Failed</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; background: #f9f9f9; }
    .failure-box { background: #fef2f2; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center; }
    .reservation-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
    .action-steps { background: #f0f9ff; border: 2px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💳 Payment Failed</h1>
      <p>Reservation ${reservation.id.slice(-8).toUpperCase()}</p>
    </div>
    
    <div class="content">
      <p>Dear ${reservation.guestFirstName} ${reservation.guestLastName},</p>
      
      <div class="failure-box">
        <h3>⚠️ Payment could not be processed</h3>
        <p>Your reservation has been cancelled due to payment failure.</p>
      </div>
      
      <div class="reservation-details">
        <h3>Failed Reservation Details:</h3>
        <p><strong>Confirmation #:</strong> ${reservation.id.slice(-8).toUpperCase()}</p>
        <p><strong>Room:</strong> ${reservation.room.roomNumber} (${reservation.room.type})</p>
        <p><strong>Check-in:</strong> ${checkInDate.toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${checkOutDate.toLocaleDateString()}</p>
        <p><strong>Amount:</strong> $${reservation.totalPrice}</p>
      </div>
      
      <div class="action-steps">
        <h4>📋 Next Steps</h4>
        <p>If you still wish to make this reservation, please:</p>
        <ol>
          <li>Check that your payment method has sufficient funds</li>
          <li>Verify your card details are correct</li>
          <li>Try booking again on our website</li>
        </ol>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL}/rooms" class="button">Try Booking Again</a>
      </div>
      
      <p>If you continue to experience issues, please contact us directly for assistance.</p>
      
      <p>We apologize for any inconvenience.</p>
      
      <p>Best regards,<br>${process.env.HOTEL_NAME || 'Hotel'} Team</p>
    </div>
  </div>
</body>
</html>
      `
    };
  }

  // Send cancellation email
  async sendCancellationEmail(reservation: Reservation & { room: Room }): Promise<void> {
    const template = this.generateCancellationEmail(reservation);
    await this.sendEmail(reservation.guestEmail, template);
  }

  // Send payment failed email
  async sendPaymentFailedEmail(reservation: Reservation & { room: Room }): Promise<void> {
    const template = this.generatePaymentFailedEmail(reservation);
    await this.sendEmail(reservation.guestEmail, template);
  }

  // Database tracking methods
  private async markReminderAsSent(reservationId: string, emailType: EmailType): Promise<void> {
    try {
      await prisma.emailReminder.updateMany({
        where: {
          reservationId,
          emailType,
          status: 'PENDING'
        },
        data: {
          status: 'SENT',
          sentAt: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to mark reminder as sent:', error);
    }
  }

  private async markReminderAsFailed(reservationId: string, emailType: EmailType, errorMessage: string): Promise<void> {
    try {
      await prisma.emailReminder.updateMany({
        where: {
          reservationId,
          emailType,
          status: 'PENDING'
        },
        data: {
          status: 'FAILED',
          lastError: errorMessage,
          attempts: { increment: 1 }
        }
      });
    } catch (error) {
      console.error('Failed to mark reminder as failed:', error);
    }
  }
}

export const sendGridEmailService = new SendGridEmailService();