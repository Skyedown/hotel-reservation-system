"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomResolvers = void 0;
const graphql_1 = require("graphql");
exports.roomResolvers = {
    Query: {
        rooms: async (_, __, { prisma }) => {
            return prisma.room.findMany({
                orderBy: {
                    roomNumber: 'asc'
                }
            });
        },
        room: async (_, { id }, { prisma }) => {
            return prisma.room.findUnique({
                where: { id }
            });
        },
        availableRooms: async (_, { checkIn, checkOut, guests }, { prisma }) => {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            // Validate dates
            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                throw new graphql_1.GraphQLError('Invalid date format provided', {
                    extensions: { code: 'BAD_USER_INPUT' }
                });
            }
            return prisma.room.findMany({
                where: {
                    isAvailable: true,
                    capacity: {
                        gte: guests
                    },
                    reservations: {
                        none: {
                            AND: [
                                {
                                    status: {
                                        in: ['CONFIRMED', 'CHECKED_IN']
                                    }
                                },
                                {
                                    OR: [
                                        {
                                            AND: [
                                                { checkIn: { lte: checkInDate } },
                                                { checkOut: { gt: checkInDate } }
                                            ]
                                        },
                                        {
                                            AND: [
                                                { checkIn: { lt: checkOutDate } },
                                                { checkOut: { gte: checkOutDate } }
                                            ]
                                        },
                                        {
                                            AND: [
                                                { checkIn: { gte: checkInDate } },
                                                { checkOut: { lte: checkOutDate } }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                },
                orderBy: {
                    price: 'asc'
                }
            });
        },
    },
    Mutation: {
        createRoom: async (_, { input }, { admin, prisma }) => {
            if (!admin || admin.role !== 'ADMIN') {
                throw new graphql_1.GraphQLError('Admin access required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            return prisma.room.create({
                data: input
            });
        },
        updateRoom: async (_, { id, input }, { admin, prisma }) => {
            if (!admin || admin.role !== 'ADMIN') {
                throw new graphql_1.GraphQLError('Admin access required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            return prisma.room.update({
                where: { id },
                data: input
            });
        },
        deleteRoom: async (_, { id }, { admin, prisma }) => {
            if (!admin || admin.role !== 'ADMIN') {
                throw new graphql_1.GraphQLError('Admin access required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            await prisma.room.delete({
                where: { id }
            });
            return true;
        },
    },
    Room: {
        reservations: async (parent, _, { prisma }) => {
            return prisma.reservation.findMany({
                where: { roomId: parent.id },
                orderBy: {
                    checkIn: 'asc'
                }
            });
        },
    },
};
//# sourceMappingURL=roomResolvers.js.map