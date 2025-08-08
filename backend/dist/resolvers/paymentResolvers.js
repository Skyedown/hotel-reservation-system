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
                    roomType: true,
                    actualRoom: true,
                    payments: true
                }
            });
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            if (reservation.paymentStatus !== 'PENDING') {
                throw new Error('Payment has already been processed');
            }
            // Find all related reservations (multi-room booking group)
            let allReservations = [reservation];
            if (reservation.paymentIntentId?.startsWith('temp_')) {
                // This is part of a multi-room booking
                allReservations = await prisma.reservation.findMany({
                    where: {
                        paymentIntentId: reservation.paymentIntentId
                    },
                    include: {
                        roomType: true,
                        actualRoom: true,
                        payments: true
                    }
                });
            }
            // Calculate total amount for all reservations
            const totalAmount = allReservations.reduce((sum, res) => sum + res.totalPrice, 0);
            const roomTypes = allReservations.map(res => res.roomType.name).join(', ');
            const roomNumbers = allReservations.map(res => res.actualRoom?.roomNumber || 'TBA').join(', ');
            // Create payment intent with enhanced metadata
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(totalAmount * 100), // Convert to cents
                currency: 'eur',
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    reservationId: reservation.id, // Primary reservation for webhook
                    guestEmail: reservation.guestEmail,
                    roomNumbers: roomNumbers,
                    roomCount: allReservations.length.toString(),
                    checkIn: reservation.checkIn.toISOString(),
                    checkOut: reservation.checkOut.toISOString(),
                    isMultiRoom: allReservations.length > 1 ? 'true' : 'false'
                },
                description: allReservations.length > 1
                    ? `Hotel reservation (${allReservations.length} rooms) for ${reservation.guestFirstName} ${reservation.guestLastName}`
                    : `Hotel reservation for ${reservation.guestFirstName} ${reservation.guestLastName}`,
                receipt_email: reservation.guestEmail,
            });
            // Update ALL reservations in the group with the actual Stripe payment intent ID
            await prisma.$transaction(async (tx) => {
                // Update all reservations in the group
                await tx.reservation.updateMany({
                    where: {
                        OR: [
                            { id: reservation.id },
                            { paymentIntentId: reservation.paymentIntentId }
                        ]
                    },
                    data: {
                        paymentIntentId: paymentIntent.id,
                        paymentStatus: 'PROCESSING'
                    }
                });
                // Create payment record for the primary reservation
                await tx.payment.create({
                    data: {
                        reservationId: reservation.id,
                        amount: totalAmount,
                        currency: 'eur',
                        stripePaymentIntentId: paymentIntent.id,
                        status: 'PROCESSING'
                    }
                });
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
                    roomType: true,
                    actualRoom: true
                }
            });
        },
    },
};
//# sourceMappingURL=paymentResolvers.js.map