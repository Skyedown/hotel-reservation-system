import { ReservationStatus, PaymentStatus, PrismaClient } from '@prisma/client';
import { sendGridEmailService } from './sendGridEmailService';

const prisma = new PrismaClient();

export interface ReservationTransition {
  from: ReservationStatus[];
  to: ReservationStatus;
  conditions?: (reservation: any) => boolean;
  actions?: (reservation: any) => Promise<void>;
}

export class ReservationStateMachine {
  private transitions: Map<string, ReservationTransition> = new Map();

  constructor() {
    this.defineTransitions();
  }

  private defineTransitions() {
    // Payment completed -> Confirmed
    this.transitions.set('confirm_payment', {
      from: [ReservationStatus.PENDING],
      to: ReservationStatus.CONFIRMED,
      conditions: (reservation) => reservation.paymentStatus === PaymentStatus.COMPLETED,
      actions: async (reservation) => {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { 
            lastStatusChange: new Date()
          }
        });
        
        // Note: Payment confirmation emails are handled by the webhook service 
        // to avoid duplicate emails for multi-room bookings
        console.log(`Reservation ${reservation.id} confirmed via payment`);
      }
    });

    // Guest checks in
    this.transitions.set('check_in', {
      from: [ReservationStatus.CONFIRMED],
      to: ReservationStatus.CHECKED_IN,
      conditions: (reservation) => {
        const now = new Date();
        const checkIn = new Date(reservation.checkIn);
        // Allow check-in 4 hours before scheduled time
        checkIn.setHours(checkIn.getHours() - 4);
        return now >= checkIn;
      },
      actions: async (reservation) => {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { 
            lastStatusChange: new Date()
          }
        });
        
        console.log(`Guest checked in for reservation ${reservation.id}`);
      }
    });

    // Guest checks out
    this.transitions.set('check_out', {
      from: [ReservationStatus.CHECKED_IN],
      to: ReservationStatus.CHECKED_OUT,
      actions: async (reservation) => {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { lastStatusChange: new Date() }
        });
        
        console.log(`Guest checked out for reservation ${reservation.id}`);
      }
    });

    // Cancel reservation
    this.transitions.set('cancel', {
      from: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
      to: ReservationStatus.CANCELLED,
      actions: async (reservation) => {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { 
            lastStatusChange: new Date()
          }
        });

        // If payment was completed, initiate refund
        if (reservation.paymentStatus === PaymentStatus.COMPLETED) {
          // TODO: Initiate 
          //  refund
          console.log(`Initiating refund for cancelled reservation ${reservation.id}`);
        }

        // Send cancellation email
        try {
          await sendGridEmailService.sendCancellationEmail(reservation);
        } catch (error) {
          console.error(`Failed to send cancellation email for reservation ${reservation.id}:`, error);
        }
        
        console.log(`Reservation ${reservation.id} cancelled`);
      }
    });

    // Payment failed
    this.transitions.set('payment_failed', {
      from: [ReservationStatus.PENDING],
      to: ReservationStatus.CANCELLED,
      actions: async (reservation) => {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { 
            lastStatusChange: new Date(),
            paymentStatus: PaymentStatus.FAILED
          }
        });
        
        // Send payment failed email
        try {
          await sendGridEmailService.sendPaymentFailedEmail(reservation);
        } catch (error) {
          console.error(`Failed to send payment failed email for reservation ${reservation.id}:`, error);
        }
        
        console.log(`Payment failed for reservation ${reservation.id} - reservation cancelled`);
      }
    });

  }

  async transition(reservationId: string, action: string): Promise<boolean> {
    const transition = this.transitions.get(action);
    if (!transition) {
      throw new Error(`Invalid transition action: ${action}`);
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { payments: true, room: true }
    });

    if (!reservation) {
      throw new Error(`Reservation not found: ${reservationId}`);
    }

    // Check if current status allows this transition
    if (!transition.from.includes(reservation.status)) {
      throw new Error(
        `Cannot transition from ${reservation.status} to ${transition.to} with action ${action}`
      );
    }

    // Check conditions if any
    if (transition.conditions && !transition.conditions(reservation)) {
      throw new Error(`Conditions not met for transition ${action}`);
    }

    // Update status
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { 
        status: transition.to,
        lastStatusChange: new Date()
      }
    });

    // Execute actions
    if (transition.actions) {
      await transition.actions(reservation);
    }

    return true;
  }

  async canTransition(reservationId: string, action: string): Promise<boolean> {
    try {
      const transition = this.transitions.get(action);
      if (!transition) return false;

      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { payments: true }
      });

      if (!reservation) return false;

      if (!transition.from.includes(reservation.status)) return false;

      if (transition.conditions && !transition.conditions(reservation)) return false;

      return true;
    } catch {
      return false;
    }
  }

  getAvailableTransitions(status: ReservationStatus): string[] {
    const available: string[] = [];
    
    for (const [action, transition] of this.transitions) {
      if (transition.from.includes(status)) {
        available.push(action);
      }
    }
    
    return available;
  }

}

export const reservationStateMachine = new ReservationStateMachine();