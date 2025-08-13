import { Context } from '../context';
export declare const reservationResolvers: {
    Query: {
        reservation: (_: any, { accessToken }: any, { prisma }: Context) => Promise<{
            roomType: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                price: number;
                capacity: number;
                amenities: string[];
                images: string[];
                isActive: boolean;
            };
            actualRoom: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                roomTypeId: string;
                roomNumber: string;
                isAvailable: boolean;
                isUnderMaintenance: boolean;
                maintenanceNotes: string | null;
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
            roomTypeId: string;
            guestEmail: string;
            guestFirstName: string;
            guestLastName: string;
            guestPhone: string | null;
            checkIn: Date;
            checkOut: Date;
            guests: number;
            specialRequests: string | null;
            status: import(".prisma/client").$Enums.ReservationStatus;
            notes: string | null;
            actualRoomId: string | null;
            totalPrice: number;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentIntentId: string | null;
            accessToken: string;
            lastStatusChange: Date;
        }>;
    };
    Mutation: {
        createMultiRoomReservation: (_: any, { input }: any, { prisma }: Context) => Promise<any[]>;
        createReservation: (_: any, { input }: any, { prisma }: Context) => Promise<{
            roomType: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                price: number;
                capacity: number;
                amenities: string[];
                images: string[];
                isActive: boolean;
            };
            actualRoom: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                roomTypeId: string;
                roomNumber: string;
                isAvailable: boolean;
                isUnderMaintenance: boolean;
                maintenanceNotes: string | null;
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
            roomTypeId: string;
            guestEmail: string;
            guestFirstName: string;
            guestLastName: string;
            guestPhone: string | null;
            checkIn: Date;
            checkOut: Date;
            guests: number;
            specialRequests: string | null;
            status: import(".prisma/client").$Enums.ReservationStatus;
            notes: string | null;
            actualRoomId: string | null;
            totalPrice: number;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentIntentId: string | null;
            accessToken: string;
            lastStatusChange: Date;
        }>;
        cancelReservation: (_: any, { accessToken }: any, { prisma }: Context) => Promise<{
            roomType: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                price: number;
                capacity: number;
                amenities: string[];
                images: string[];
                isActive: boolean;
            };
            actualRoom: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                roomTypeId: string;
                roomNumber: string;
                isAvailable: boolean;
                isUnderMaintenance: boolean;
                maintenanceNotes: string | null;
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
            roomTypeId: string;
            guestEmail: string;
            guestFirstName: string;
            guestLastName: string;
            guestPhone: string | null;
            checkIn: Date;
            checkOut: Date;
            guests: number;
            specialRequests: string | null;
            status: import(".prisma/client").$Enums.ReservationStatus;
            notes: string | null;
            actualRoomId: string | null;
            totalPrice: number;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentIntentId: string | null;
            accessToken: string;
            lastStatusChange: Date;
        }>;
    };
    Reservation: {
        roomType: (parent: any, _: any, { prisma }: Context) => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            price: number;
            capacity: number;
            amenities: string[];
            images: string[];
            isActive: boolean;
        }>;
        actualRoom: (parent: any, _: any, { prisma }: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            roomNumber: string;
            isAvailable: boolean;
            isUnderMaintenance: boolean;
            maintenanceNotes: string | null;
        }>;
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