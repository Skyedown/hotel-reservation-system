import { Context } from '../context';
export declare const adminResolvers: {
    Query: {
        me: (_: any, __: any, { admin }: Context) => Promise<{
            id: string;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.AdminRole;
            createdAt: Date;
            updatedAt: Date;
        }>;
        allReservations: (_: any, __: any, { admin, prisma }: Context) => Promise<({
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
        })[]>;
        reservationById: (_: any, { id }: any, { admin, prisma }: Context) => Promise<({
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
        }) | null>;
    };
    Mutation: {
        adminLogin: (_: any, { input }: any, { prisma }: Context) => Promise<{
            token: string;
            admin: {
                id: string;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.AdminRole;
                createdAt: Date;
                updatedAt: Date;
            };
        }>;
        updateReservationStatus: (_: any, { id, status }: any, { admin, prisma }: Context) => Promise<{
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
};
//# sourceMappingURL=adminResolvers.d.ts.map