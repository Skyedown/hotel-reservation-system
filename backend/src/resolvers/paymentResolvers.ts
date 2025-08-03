import { Context } from '../context';
import Stripe from 'stripe';
import { reservationStateMachine } from '../services/reservationStateMachine';
import { stripeWebhookHandler } from '../services/stripeWebhook';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_development');

export const paymentResolvers = {
  Query: {
    getPaymentStatus: async (_: any, { accessToken }: any, { prisma }: Context) => {
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
    createPaymentIntent: async (_: any, { accessToken }: any, { prisma }: Context) => {
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


      // Find all related reservations (multi-room booking group)
      let allReservations = [reservation];
      if (reservation.paymentIntentId?.startsWith('temp_')) {
        // This is part of a multi-room booking
        allReservations = await prisma.reservation.findMany({
          where: {
            paymentIntentId: reservation.paymentIntentId
          },
          include: {
            room: true,
            payments: true
          }
        });
      }

      // Calculate total amount for all reservations
      const totalAmount = allReservations.reduce((sum, res) => sum + res.totalPrice, 0);
      const roomNumbers = allReservations.map(res => res.room.roomNumber).join(', ');
      
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
    processRefund: async (_: any, { reservationId, amount, reason }: any, { admin, prisma }: Context) => {
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
      const refund = await stripeWebhookHandler.createRefund(
        reservation.paymentIntentId,
        amount ? Math.round(amount * 100) : undefined, // Convert to cents
        reason
      );

      // Update reservation status to cancelled if full refund
      if (!amount || amount >= reservation.totalPrice) {
        await reservationStateMachine.transition(reservationId, 'cancel');
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
    reservation: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.reservation.findUnique({
        where: { id: parent.reservationId },
        include: {
          room: true
        }
      });
    },
  },
};