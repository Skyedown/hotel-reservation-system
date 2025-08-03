import { Context } from '../context';
export declare const reservationResolvers: {
    Query: {
        reservation: (_: any, { accessToken }: any, { prisma }: Context) => Promise<{
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
            payments: {
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
            }[];
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
            expiresAt: Date | null;
            lastStatusChange: Date;
            notes: string | null;
        }>;
    };
    Mutation: {
        createReservation: (_: any, { input }: any, { prisma }: Context) => Promise<{
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
            payments: {
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
            }[];
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
            expiresAt: Date | null;
            lastStatusChange: Date;
            notes: string | null;
        }>;
        updateReservation: (_: any, { accessToken, input }: any, { prisma }: Context) => Promise<{
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
            payments: {
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
            }[];
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
            expiresAt: Date | null;
            lastStatusChange: Date;
            notes: string | null;
        }>;
        cancelReservation: (_: any, { accessToken }: any, { prisma }: Context) => Promise<{
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
            payments: {
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
            }[];
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
            expiresAt: Date | null;
            lastStatusChange: Date;
            notes: string | null;
        }>;
    };
    Reservation: {
        room: (parent: any, _: any, { prisma }: Context) => Promise<{
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
        } | null>;
        payments: (parent: any, _: any, { prisma }: Context) => Promise<{
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
        }[]>;
    };
};
//# sourceMappingURL=reservationResolvers.d.ts.map