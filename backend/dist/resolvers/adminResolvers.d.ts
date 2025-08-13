import { Context } from '../context';
export declare const adminResolvers: {
    Query: {
        me: (_: any, __: any, { admin }: Context) => Promise<{
            id: string;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            phoneNumber: string | null;
            role: import(".prisma/client").$Enums.AdminRole;
            createdAt: Date;
            updatedAt: Date;
        }>;
        allReservations: (_: any, __: any, { admin, prisma }: Context) => Promise<({
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
        })[]>;
        reservationById: (_: any, { id }: any, { admin, prisma }: Context) => Promise<{
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
        adminLogin: (_: any, { input }: any, context: Context) => Promise<{
            token: string;
            admin: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.AdminRole;
            };
        }>;
        updateReservationStatus: (_: any, { id, status }: any, { admin, prisma }: Context) => Promise<{
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
};
//# sourceMappingURL=adminResolvers.d.ts.map