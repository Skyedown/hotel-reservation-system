"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
class EmailService {
    constructor() {
        // Initialize SendGrid with API key
        if (process.env.SENDGRID_API_KEY) {
            mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
        }
    }
    async sendEmail(to, template) {
        if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
            console.log('SendGrid not configured, skipping email to:', to);
            console.log('Subject:', template.subject);
            return;
        }
        try {
            const msg = {
                to,
                from: {
                    email: process.env.SENDGRID_FROM_EMAIL,
                    name: process.env.HOTEL_NAME || 'Hotel Reservation System'
                },
                subject: template.subject,
                text: template.text,
                html: template.html,
            };
            await mail_1.default.send(msg);
            console.log(`Email sent successfully to: ${to}`);
        }
        catch (error) {
            console.error('Failed to send email via SendGrid:', error);
            throw error;
        }
    }
    // Reservation confirmation email
    generateConfirmationEmail(reservation) {
        const checkInDate = new Date(reservation.checkIn).toLocaleDateString();
        const checkOutDate = new Date(reservation.checkOut).toLocaleDateString();
        const managementUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reservation/${reservation.accessToken}`;
        return {
            subject: `Reservation Confirmed - ${reservation.guestFirstName} ${reservation.guestLastName}`,
            text: `
Dear ${reservation.guestFirstName} ${reservation.guestLastName},

Your hotel reservation has been confirmed!

Reservation Details:
- Confirmation ID: ${reservation.id}
- Room: ${reservation.room.roomNumber} (${reservation.room.type})
- Check-in: ${checkInDate}
- Check-out: ${checkOutDate}
- Guests: ${reservation.guests}
- Total Amount: $${reservation.totalPrice}

You can manage your reservation at: ${managementUrl}

Thank you for choosing our hotel!

Best regards,
Hotel Management Team
      `,
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reservation Confirmed</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2563eb; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Reservation Confirmed!</h1>
    </div>
    
    <div class="content">
      <p>Dear <strong>${reservation.guestFirstName} ${reservation.guestLastName}</strong>,</p>
      
      <p>Great news! Your hotel reservation has been confirmed and payment has been processed successfully.</p>
      
      <div class="details">
        <h3>📋 Reservation Details</h3>
        <p><strong>Confirmation ID:</strong> ${reservation.id}</p>
        <p><strong>Room:</strong> ${reservation.room.roomNumber} (${reservation.room.type})</p>
        <p><strong>Check-in:</strong> ${checkInDate}</p>
        <p><strong>Check-out:</strong> ${checkOutDate}</p>
        <p><strong>Guests:</strong> ${reservation.guests}</p>
        <p><strong>Total Amount:</strong> $${reservation.totalPrice}</p>
        ${reservation.specialRequests ? `<p><strong>Special Requests:</strong> ${reservation.specialRequests}</p>` : ''}
      </div>
      
      <p>You can view or modify your reservation using the link below:</p>
      <a href="${managementUrl}" class="button">Manage Reservation</a>
      
      <p><strong>Important:</strong></p>
      <ul>
        <li>Check-in time: 3:00 PM</li>
        <li>Check-out time: 11:00 AM</li>
        <li>Please bring a valid ID for check-in</li>
        <li>If you need to cancel, please do so at least 24 hours before check-in</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>Thank you for choosing our hotel!</p>
      <p>Questions? Contact us at: support@hotel.com</p>
    </div>
  </div>
</body>
</html>
      `
        };
    }
    // Payment failed email
    generatePaymentFailedEmail(reservation) {
        const managementUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reservation/${reservation.accessToken}`;
        return {
            subject: `Payment Failed - Action Required for Your Reservation`,
            text: `
Dear ${reservation.guestFirstName} ${reservation.guestLastName},

We encountered an issue processing the payment for your hotel reservation.

Reservation Details:
- Reservation ID: ${reservation.id}
- Room: ${reservation.room.roomNumber} (${reservation.room.type})
- Total Amount: $${reservation.totalPrice}

Your reservation has been cancelled due to the payment failure. If you'd like to make a new reservation, please visit our website.

If you believe this is an error, please contact us immediately.

Manage reservation: ${managementUrl}

Best regards,
Hotel Management Team
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
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc2626; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Payment Failed</h1>
    </div>
    
    <div class="content">
      <p>Dear <strong>${reservation.guestFirstName} ${reservation.guestLastName}</strong>,</p>
      
      <p>We encountered an issue processing the payment for your hotel reservation.</p>
      
      <div class="details">
        <h3>📋 Reservation Details</h3>
        <p><strong>Reservation ID:</strong> ${reservation.id}</p>
        <p><strong>Room:</strong> ${reservation.room.roomNumber} (${reservation.room.type})</p>
        <p><strong>Total Amount:</strong> $${reservation.totalPrice}</p>
      </div>
      
      <p><strong>What happens next:</strong></p>
      <ul>
        <li>Your reservation has been automatically cancelled</li>
        <li>No charges have been made to your payment method</li>
        <li>The room is now available for other guests</li>
      </ul>
      
      <p>If you'd like to make a new reservation or if you believe this is an error, please contact us.</p>
      
      <a href="${managementUrl}" class="button">View Reservation Details</a>
    </div>
    
    <div class="footer">
      <p>Questions? Contact us at: support@hotel.com</p>
    </div>
  </div>
</body>
</html>
      `
        };
    }
    // Cancellation confirmation email
    generateCancellationEmail(reservation) {
        return {
            subject: `Reservation Cancelled - ${reservation.guestFirstName} ${reservation.guestLastName}`,
            text: `
Dear ${reservation.guestFirstName} ${reservation.guestLastName},

Your hotel reservation has been cancelled as requested.

Cancelled Reservation:
- Reservation ID: ${reservation.id}
- Room: ${reservation.room.roomNumber} (${reservation.room.type})
- Original Amount: $${reservation.totalPrice}

If you paid for this reservation, a refund will be processed within 5-7 business days.

Thank you for your understanding.

Best regards,
Hotel Management Team
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
    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f59e0b; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reservation Cancelled</h1>
    </div>
    
    <div class="content">
      <p>Dear <strong>${reservation.guestFirstName} ${reservation.guestLastName}</strong>,</p>
      
      <p>Your hotel reservation has been successfully cancelled.</p>
      
      <div class="details">
        <h3>📋 Cancelled Reservation</h3>
        <p><strong>Reservation ID:</strong> ${reservation.id}</p>
        <p><strong>Room:</strong> ${reservation.room.roomNumber} (${reservation.room.type})</p>
        <p><strong>Original Amount:</strong> $${reservation.totalPrice}</p>
      </div>
      
      <p><strong>Refund Information:</strong></p>
      <ul>
        <li>If you paid for this reservation, a refund will be processed automatically</li>
        <li>Refunds typically take 5-7 business days to appear on your statement</li>
        <li>You will receive a separate email confirmation once the refund is processed</li>
      </ul>
      
      <p>We're sorry to see you go and hope to serve you again in the future!</p>
    </div>
    
    <div class="footer">
      <p>Questions about your refund? Contact us at: support@hotel.com</p>
    </div>
  </div>
</body>
</html>
      `
        };
    }
    // Send confirmation email
    async sendConfirmationEmail(reservation) {
        const template = this.generateConfirmationEmail(reservation);
        await this.sendEmail(reservation.guestEmail, template);
    }
    // Send payment failed email
    async sendPaymentFailedEmail(reservation) {
        const template = this.generatePaymentFailedEmail(reservation);
        await this.sendEmail(reservation.guestEmail, template);
    }
    // Send cancellation email
    async sendCancellationEmail(reservation) {
        const template = this.generateCancellationEmail(reservation);
        await this.sendEmail(reservation.guestEmail, template);
    }
}
exports.EmailService = EmailService;
exports.emailService = new EmailService();
//# sourceMappingURL=emailService.js.map