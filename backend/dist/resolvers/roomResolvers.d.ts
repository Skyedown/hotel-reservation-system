import { Context } from '../context';
export declare const roomResolvers: {
    Query: {
        roomTypes: (_: any, __: any, { prisma }: Context) => Promise<{
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
        }[]>;
        roomType: (_: any, { id }: any, { prisma }: Context) => Promise<{
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
        availableRoomTypes: (_: any, { checkIn, checkOut, guests }: any, { prisma }: Context) => Promise<{
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
        }[]>;
        actualRooms: (_: any, __: any, { admin, prisma }: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            roomNumber: string;
            isAvailable: boolean;
            isUnderMaintenance: boolean;
            maintenanceNotes: string | null;
        }[]>;
        actualRoom: (_: any, { id }: any, { admin, prisma }: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            roomNumber: string;
            isAvailable: boolean;
            isUnderMaintenance: boolean;
            maintenanceNotes: string | null;
        }>;
        actualRoomsByType: (_: any, { roomTypeId }: any, { admin, prisma }: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            roomNumber: string;
            isAvailable: boolean;
            isUnderMaintenance: boolean;
            maintenanceNotes: string | null;
        }[]>;
        availableActualRooms: (_: any, { roomTypeId, checkIn, checkOut, excludeReservationIds }: any, { admin, prisma }: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            roomNumber: string;
            isAvailable: boolean;
            isUnderMaintenance: boolean;
            maintenanceNotes: string | null;
        }[]>;
    };
    Mutation: {
        createRoomType: (_: any, { input }: any, context: Context) => Promise<{
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
        updateRoomType: (_: any, { id, input }: any, { admin, prisma }: Context) => Promise<{
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
        deleteRoomType: (_: any, { id }: any, { admin, prisma }: Context) => Promise<boolean>;
        createActualRoom: (_: any, { input }: any, { admin, prisma }: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            roomNumber: string;
            isAvailable: boolean;
            isUnderMaintenance: boolean;
            maintenanceNotes: string | null;
        }>;
        updateActualRoom: (_: any, { id, input }: any, { admin, prisma }: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            roomNumber: string;
            isAvailable: boolean;
            isUnderMaintenance: boolean;
            maintenanceNotes: string | null;
        }>;
        deleteActualRoom: (_: any, { id }: any, { admin, prisma }: Context) => Promise<boolean>;
        assignRoomToReservation: (_: any, { reservationId, actualRoomId }: any, { admin, prisma }: Context) => Promise<{
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
    RoomType: {
        rooms: (parent: any, _: any, { prisma }: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            roomNumber: string;
            isAvailable: boolean;
            isUnderMaintenance: boolean;
            maintenanceNotes: string | null;
        }[]>;
        reservations: (parent: any, _: any, { prisma }: Context) => Promise<{
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
        }[]>;
    };
    ActualRoom: {
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
        reservations: (parent: any, _: any, { prisma }: Context) => Promise<{
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
        }[]>;
    };
};
//# sourceMappingURL=roomResolvers.d.ts.map