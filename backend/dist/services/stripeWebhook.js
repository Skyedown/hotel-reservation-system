"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookHandler = exports.StripeWebhookHandler = void 0;
const stripe_1 = __importDefault(require("stripe"));
const client_1 = require("@prisma/client");
const reservationStateMachine_1 = require("./reservationStateMachine");
const sendGridEmailService_1 = require("./sendGridEmailService");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_development');
const prisma = new client_1.PrismaClient();
class StripeWebhookHandler {
    constructor() {
        this.endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    }
    // Verify webhook signature
    verifyWebhookSignature(payload, signature) {
        if (!this.endpointSecret) {
            throw new Error('Stripe webhook secret not configured');
        }
        try {
            return stripe.webhooks.constructEvent(payload, signature, this.endpointSecret);
        }
        catch (error) {
            console.error('Webhook signature verification failed:', error);
            throw new Error('Invalid webhook signature');
        }
    }
    // Handle webhook events
    async handleWebhookEvent(event) {
        console.log(`Processing Stripe webhook: ${event.type} - ${event.id}`);
        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSucceeded(event.data.object, event.id);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailed(event.data.object, event.id);
                    break;
                case 'payment_intent.canceled':
                    await this.handlePaymentCanceled(event.data.object, event.id);
                    break;
                case 'charge.dispute.created':
                    await this.handleChargeDispute(event.data.object);
                    break;
                case 'invoice.payment_succeeded':
                    // Handle recurring payments if needed
                    break;
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }
        }
        catch (error) {
            console.error(`Error processing webhook ${event.type}:`, error);
            throw error;
        }
    }
    async handlePaymentSucceeded(paymentIntent, eventId) {
        const reservationId = paymentIntent.metadata?.reservationId;
        if (!reservationId) {
            console.error('No reservationId in payment intent metadata');
            return;
        }
        console.log(`Processing payment_intent.succeeded for reservation: ${reservationId}, payment_intent: ${paymentIntent.id}`);
        // Use database transaction to ensure consistency
        const allRelatedReservations = await prisma.$transaction(async (tx) => {
            // Find the primary reservation with payments
            const primaryReservation = await tx.reservation.findUnique({
                where: { id: reservationId },
                include: { payments: true, room: true }
            });
            if (!primaryReservation) {
                console.error(`Reservation not found: ${reservationId}`);
                throw new Error(`Reservation not found: ${reservationId}`);
            }
            console.log(`Found primary reservation ${reservationId} with payment status: ${primaryReservation.paymentStatus}`);
            // Find ALL reservations with the same paymentIntentId (for multi-room bookings)
            const allReservations = await tx.reservation.findMany({
                where: {
                    paymentIntentId: primaryReservation.paymentIntentId
                },
                include: { room: true }
            });
            console.log(`Found ${allReservations.length} reservations for paymentIntentId: ${primaryReservation.paymentIntentId}`);
            // Find the specific payment record
            const payment = await tx.payment.findFirst({
                where: {
                    stripePaymentIntentId: paymentIntent.id,
                    reservationId: reservationId
                }
            });
            if (!payment) {
                console.error(`Payment record not found for PaymentIntent: ${paymentIntent.id}`);
                throw new Error(`Payment record not found for PaymentIntent: ${paymentIntent.id}`);
            }
            console.log(`Found payment record ${payment.id} with status: ${payment.status}`);
            // Update payment record with correct webhook event ID
            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: client_1.PaymentStatus.COMPLETED,
                    webhookEventId: eventId,
                    updatedAt: new Date()
                }
            });
            // Update ALL reservations with the same paymentIntentId
            await tx.reservation.updateMany({
                where: {
                    paymentIntentId: primaryReservation.paymentIntentId
                },
                data: {
                    paymentStatus: client_1.PaymentStatus.COMPLETED,
                    updatedAt: new Date()
                }
            });
            console.log(`Updated payment and reservation status to COMPLETED for ${allReservations.length} reservations`);
            return allReservations;
        });
        // Transition ALL reservations to confirmed (outside transaction to avoid deadlocks)
        try {
            for (const reservation of allRelatedReservations) {
                await reservationStateMachine_1.reservationStateMachine.transition(reservation.id, 'confirm_payment');
                console.log(`Reservation ${reservation.id} confirmed after successful payment`);
            }
            // Send ONE payment confirmation email with ALL rooms
            try {
                await sendGridEmailService_1.sendGridEmailService.sendMultiRoomPaymentConfirmationEmail(allRelatedReservations);
                console.log(`Multi-room payment confirmation email sent for ${allRelatedReservations.length} reservations`);
            }
            catch (emailError) {
                console.error(`Failed to send payment confirmation email:`, emailError);
                // Don't fail the webhook if email fails
            }
        }
        catch (error) {
            console.error(`Failed to confirm reservations:`, error);
            // This is not critical - the payment status is already updated
        }
    }
    async handlePaymentFailed(paymentIntent, eventId) {
        const reservationId = paymentIntent.metadata?.reservationId;
        if (!reservationId) {
            console.error('No reservationId in payment intent metadata');
            return;
        }
        const failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
        // Update payment record
        await prisma.payment.updateMany({
            where: {
                stripePaymentIntentId: paymentIntent.id,
                reservationId: reservationId
            },
            data: {
                status: client_1.PaymentStatus.FAILED,
                failureReason,
                webhookEventId: eventId,
                updatedAt: new Date()
            }
        });
        // Update reservation payment status
        await prisma.reservation.update({
            where: { id: reservationId },
            data: {
                paymentStatus: client_1.PaymentStatus.FAILED,
                updatedAt: new Date()
            }
        });
        // Cancel the reservation due to payment failure
        try {
            await reservationStateMachine_1.reservationStateMachine.transition(reservationId, 'payment_failed');
            console.log(`Reservation ${reservationId} cancelled due to payment failure`);
        }
        catch (error) {
            console.error(`Failed to cancel reservation ${reservationId}:`, error);
        }
    }
    async handlePaymentCanceled(paymentIntent, eventId) {
        const reservationId = paymentIntent.metadata?.reservationId;
        if (!reservationId) {
            console.error('No reservationId in payment intent metadata');
            return;
        }
        // Update payment record
        await prisma.payment.updateMany({
            where: {
                stripePaymentIntentId: paymentIntent.id,
                reservationId: reservationId
            },
            data: {
                status: client_1.PaymentStatus.FAILED,
                failureReason: 'Payment was cancelled',
                webhookEventId: eventId,
                updatedAt: new Date()
            }
        });
        // Cancel the reservation
        try {
            await reservationStateMachine_1.reservationStateMachine.transition(reservationId, 'cancel');
            console.log(`Reservation ${reservationId} cancelled due to payment cancellation`);
        }
        catch (error) {
            console.error(`Failed to cancel reservation ${reservationId}:`, error);
        }
    }
    async handleChargeDispute(dispute) {
        const charge = await stripe.charges.retrieve(dispute.charge);
        const paymentIntentId = charge.payment_intent;
        if (!paymentIntentId)
            return;
        const payment = await prisma.payment.findFirst({
            where: { stripePaymentIntentId: paymentIntentId },
            include: { reservation: true }
        });
        if (!payment) {
            console.error(`Payment not found for disputed charge: ${dispute.charge}`);
            return;
        }
        // Add note to reservation about dispute
        await prisma.reservation.update({
            where: { id: payment.reservationId },
            data: {
                notes: `Charge disputed: ${dispute.reason} - Amount: $${dispute.amount / 100}`,
                updatedAt: new Date()
            }
        });
        console.log(`Dispute created for reservation ${payment.reservationId}: ${dispute.reason}`);
    }
    // Create a refund
    async createRefund(paymentIntentId, amount, reason) {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount, // If not provided, refunds full amount
            reason: reason || 'requested_by_customer'
        });
        // Update payment record with refund info
        await prisma.payment.updateMany({
            where: { stripePaymentIntentId: paymentIntentId },
            data: {
                status: client_1.PaymentStatus.REFUNDED,
                refundAmount: refund.amount / 100, // Convert from cents
                updatedAt: new Date()
            }
        });
        return refund;
    }
    // Check if webhook event was already processed (idempotency)
    async isEventProcessed(eventId) {
        const existingPayment = await prisma.payment.findFirst({
            where: { webhookEventId: eventId }
        });
        return !!existingPayment;
    }
}
exports.StripeWebhookHandler = StripeWebhookHandler;
exports.stripeWebhookHandler = new StripeWebhookHandler();
//# sourceMappingURL=stripeWebhook.js.map