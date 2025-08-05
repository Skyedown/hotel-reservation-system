import { Context } from '../context';
export declare const roomResolvers: {
    Query: {
        rooms: (_: any, __: any, { prisma }: Context) => Promise<{
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
        }[]>;
        room: (_: any, { id }: any, { prisma }: Context) => Promise<{
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
        }>;
        availableRooms: (_: any, { checkIn, checkOut, guests }: any, { prisma }: Context) => Promise<{
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
        }[]>;
    };
    Mutation: {
        createRoom: (_: any, { input }: any, { admin, prisma }: Context) => Promise<{
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
        }>;
        updateRoom: (_: any, { id, input }: any, { admin, prisma }: Context) => Promise<{
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
        }>;
        deleteRoom: (_: any, { id }: any, { admin, prisma }: Context) => Promise<boolean>;
    };
    Room: {
        reservations: (parent: any, _: any, { prisma }: Context) => Promise<{
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
        }[]>;
    };
};
//# sourceMappingURL=roomResolvers.d.ts.map