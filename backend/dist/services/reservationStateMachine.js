"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservationStateMachine = exports.ReservationStateMachine = void 0;
const client_1 = require("@prisma/client");
const sendGridEmailService_1 = require("./sendGridEmailService");
const prisma = new client_1.PrismaClient();
class ReservationStateMachine {
    constructor() {
        this.transitions = new Map();
        this.defineTransitions();
    }
    defineTransitions() {
        // Payment completed -> Confirmed
        this.transitions.set('confirm_payment', {
            from: [client_1.ReservationStatus.PENDING],
            to: client_1.ReservationStatus.CONFIRMED,
            conditions: (reservation) => reservation.paymentStatus === client_1.PaymentStatus.COMPLETED,
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
            from: [client_1.ReservationStatus.CONFIRMED],
            to: client_1.ReservationStatus.CHECKED_IN,
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
            from: [client_1.ReservationStatus.CHECKED_IN],
            to: client_1.ReservationStatus.CHECKED_OUT,
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
            from: [client_1.ReservationStatus.PENDING, client_1.ReservationStatus.CONFIRMED],
            to: client_1.ReservationStatus.CANCELLED,
            actions: async (reservation) => {
                await prisma.reservation.update({
                    where: { id: reservation.id },
                    data: {
                        lastStatusChange: new Date()
                    }
                });
                // If payment was completed, initiate refund
                if (reservation.paymentStatus === client_1.PaymentStatus.COMPLETED) {
                    // TODO: Initiate 
                    //  refund
                    console.log(`Initiating refund for cancelled reservation ${reservation.id}`);
                }
                // Send cancellation email
                try {
                    await sendGridEmailService_1.sendGridEmailService.sendCancellationEmail(reservation);
                }
                catch (error) {
                    console.error(`Failed to send cancellation email for reservation ${reservation.id}:`, error);
                }
                console.log(`Reservation ${reservation.id} cancelled`);
            }
        });
        // Payment failed
        this.transitions.set('payment_failed', {
            from: [client_1.ReservationStatus.PENDING],
            to: client_1.ReservationStatus.CANCELLED,
            actions: async (reservation) => {
                await prisma.reservation.update({
                    where: { id: reservation.id },
                    data: {
                        lastStatusChange: new Date(),
                        paymentStatus: client_1.PaymentStatus.FAILED
                    }
                });
                // Send payment failed email
                try {
                    await sendGridEmailService_1.sendGridEmailService.sendPaymentFailedEmail(reservation);
                }
                catch (error) {
                    console.error(`Failed to send payment failed email for reservation ${reservation.id}:`, error);
                }
                console.log(`Payment failed for reservation ${reservation.id} - reservation cancelled`);
            }
        });
    }
    async transition(reservationId, action) {
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
            throw new Error(`Cannot transition from ${reservation.status} to ${transition.to} with action ${action}`);
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
    async canTransition(reservationId, action) {
        try {
            const transition = this.transitions.get(action);
            if (!transition)
                return false;
            const reservation = await prisma.reservation.findUnique({
                where: { id: reservationId },
                include: { payments: true }
            });
            if (!reservation)
                return false;
            if (!transition.from.includes(reservation.status))
                return false;
            if (transition.conditions && !transition.conditions(reservation))
                return false;
            return true;
        }
        catch {
            return false;
        }
    }
    getAvailableTransitions(status) {
        const available = [];
        for (const [action, transition] of this.transitions) {
            if (transition.from.includes(status)) {
                available.push(action);
            }
        }
        return available;
    }
}
exports.ReservationStateMachine = ReservationStateMachine;
exports.reservationStateMachine = new ReservationStateMachine();
//# sourceMappingURL=reservationStateMachine.js.map