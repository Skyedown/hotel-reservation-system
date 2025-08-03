"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentResolvers = void 0;
const stripe_1 = __importDefault(require("stripe"));
const reservationStateMachine_1 = require("../services/reservationStateMachine");
const stripeWebhook_1 = require("../services/stripeWebhook");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_development');
exports.paymentResolvers = {
    Query: {
        getPaymentStatus: async (_, { accessToken }, { prisma }) => {
            const reservation = await prisma.reservation.findUnique({
                where: { accessToken },
                include: {
                    payments: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            });
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            const latestPayment = reservation.payments[0];
            return {
                reservationId: reservation.id,
                paymentStatus: reservation.paymentStatus,
                reservationStatus: reservation.status,
                paymentIntent: reservation.paymentIntentId,
                amount: reservation.totalPrice,
                payment: latestPayment
            };
        },
    },
    Mutation: {
        createPaymentIntent: async (_, { accessToken }, { prisma }) => {
            const reservation = await prisma.reservation.findUnique({
                where: { accessToken },
                include: {
                    room: true,
                    payments: true
                }
            });
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            if (reservation.paymentStatus !== 'PENDING') {
                throw new Error('Payment has already been processed');
            }
            // Check if reservation has expired
            if (reservation.expiresAt && new Date() > reservation.expiresAt) {
                await reservationStateMachine_1.reservationStateMachine.transition(reservation.id, 'expire');
                throw new Error('Reservation has expired');
            }
            // Create payment intent with enhanced metadata and confirmation method
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(reservation.totalPrice * 100), // Convert to cents
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    reservationId: reservation.id,
                    guestEmail: reservation.guestEmail,
                    roomNumber: reservation.room.roomNumber,
                    checkIn: reservation.checkIn.toISOString(),
                    checkOut: reservation.checkOut.toISOString(),
                },
                description: `Hotel reservation for ${reservation.guestFirstName} ${reservation.guestLastName}`,
                receipt_email: reservation.guestEmail,
            });
            // Create payment record
            await prisma.payment.create({
                data: {
                    reservationId: reservation.id,
                    amount: reservation.totalPrice,
                    currency: 'usd',
                    stripePaymentIntentId: paymentIntent.id,
                    status: 'PROCESSING'
                }
            });
            // Update reservation with payment intent and set timeout
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes to complete payment
            await prisma.reservation.update({
                where: { id: reservation.id },
                data: {
                    paymentIntentId: paymentIntent.id,
                    paymentStatus: 'PROCESSING',
                    expiresAt
                }
            });
            return paymentIntent.client_secret;
        },
        // Admin only: Process refund
        processRefund: async (_, { reservationId, amount, reason }, { admin, prisma }) => {
            if (!admin || admin.role !== 'ADMIN') {
                throw new Error('Admin access required');
            }
            const reservation = await prisma.reservation.findUnique({
                where: { id: reservationId },
                include: { payments: true }
            });
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            if (!reservation.paymentIntentId) {
                throw new Error('No payment to refund');
            }
            // Process refund through Stripe
            const refund = await stripeWebhook_1.stripeWebhookHandler.createRefund(reservation.paymentIntentId, amount ? Math.round(amount * 100) : undefined, // Convert to cents
            reason);
            // Update reservation status to cancelled if full refund
            if (!amount || amount >= reservation.totalPrice) {
                await reservationStateMachine_1.reservationStateMachine.transition(reservationId, 'cancel');
            }
            return {
                id: refund.id,
                amount: refund.amount / 100, // Convert back to dollars
                status: refund.status,
                reason: refund.reason
            };
        },
    },
    Payment: {
        reservation: async (parent, _, { prisma }) => {
            return prisma.reservation.findUnique({
                where: { id: parent.reservationId },
                include: {
                    room: true
                }
            });
        },
    },
};
//# sourceMappingURL=paymentResolvers.js.map