import { Context } from '../context';
export declare const reservationResolvers: {
    Query: {
        reservation: (_: any, { accessToken }: any, { prisma }: Context) => Promise<{
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
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ReservationStatus;
            roomTypeId: string;
            actualRoomId: string | null;
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
    Mutation: {
        createMultiRoomReservation: (_: any, { input }: any, { prisma }: Context) => Promise<any[]>;
        createReservation: (_: any, { input }: any, { prisma }: Context) => Promise<{
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
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ReservationStatus;
            roomTypeId: string;
            actualRoomId: string | null;
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
        cancelReservation: (_: any, { accessToken }: any, { prisma }: Context) => Promise<{
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
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ReservationStatus;
            roomTypeId: string;
            actualRoomId: string | null;
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