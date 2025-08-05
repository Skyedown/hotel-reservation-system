import { Context } from '../context';
import Stripe from 'stripe';
export declare const paymentResolvers: {
    Query: {
        getPaymentStatus: (_: any, { accessToken }: any, { prisma }: Context) => Promise<{
            reservationId: string;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            reservationStatus: import(".prisma/client").$Enums.ReservationStatus;
            paymentIntent: string;
            amount: number;
            payment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.PaymentStatus;
                reservationId: string;
                amount: number;
                currency: string;
                stripePaymentIntentId: string;
                failureReason: string | null;
                refundAmount: number | null;
                webhookEventId: string | null;
            };
        }>;
    };
    Mutation: {
        createPaymentIntent: (_: any, { accessToken }: any, { prisma }: Context) => Promise<string>;
        processRefund: (_: any, { reservationId, amount, reason }: any, { admin, prisma }: Context) => Promise<{
            id: string;
            amount: number;
            status: string;
            reason: Stripe.Refund.Reason;
        }>;
    };
    Payment: {
        reservation: (parent: any, _: any, { prisma }: Context) => Promise<{
            room: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                roomNumber: string;
                type: import(".prisma/client").$Enums.RoomType;
                description: string;
                price: number;
                capacity: number;
                amenities: string[];
                images: string[];
                isAvailable: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ReservationStatus;
            roomId: string;
            guestEmail: string;
            guestFirstName: string;
            guestLastName: string;
            guestPhone: string | null;
            checkIn: Date;
            checkOut: Date;
            guests: number;
            totalPrice: number;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentIntentId: string | null;
            specialRequests: string | null;
            accessToken: string;
            lastStatusChange: Date;
            notes: string | null;
        }>;
    };
};
//# sourceMappingURL=paymentResolvers.d.ts.map