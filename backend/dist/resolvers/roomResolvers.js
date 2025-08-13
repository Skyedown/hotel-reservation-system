"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomResolvers = void 0;
const graphql_1 = require("graphql");
const middleware_1 = require("../validation/middleware");
const securityLogger_1 = require("../services/securityLogger");
const schemas_1 = require("../validation/schemas");
const rateLimitService_1 = require("../services/rateLimitService");
exports.roomResolvers = {
    Query: {
        // Public queries for room types
        roomTypes: async (_, __, { prisma }) => {
            console.log('🔍 roomTypes query called');
            return prisma.roomType.findMany({
                where: {
                    isActive: true
                },
                orderBy: {
                    name: 'asc'
                }
            });
        },
        roomType: async (_, { id }, { prisma }) => {
            return prisma.roomType.findUnique({
                where: { id }
            });
        },
        availableRoomTypes: async (_, { checkIn, checkOut, guests }, { prisma }) => {
            console.log('🔍 availableRoomTypes query called for room type availability filtering');
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            console.log('📅 Search criteria:', {
                checkIn: checkInDate.toISOString().split('T')[0],
                checkOut: checkOutDate.toISOString().split('T')[0],
                guests
            });
            // Validate dates
            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                throw new graphql_1.GraphQLError('Invalid date format provided', {
                    extensions: { code: 'BAD_USER_INPUT' }
                });
            }
            // Find room types that have available rooms for the given period
            const roomTypes = await prisma.roomType.findMany({
                where: {
                    isActive: true,
                    capacity: {
                        gte: guests
                    },
                    rooms: {
                        some: {
                            isAvailable: true,
                            isUnderMaintenance: false,
                            reservations: {
                                none: {
                                    AND: [
                                        {
                                            status: {
                                                not: 'CANCELLED'
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
                        }
                    }
                },
                orderBy: {
                    price: 'asc'
                }
            });
            console.log('🏨 Available room types found:', roomTypes.map(rt => `${rt.name} (${rt.id})`));
            return roomTypes;
        },
        // Admin queries for actual rooms
        actualRooms: async (_, __, { admin, prisma }) => {
            if (!admin) {
                throw new graphql_1.GraphQLError('Admin access required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            return prisma.actualRoom.findMany({
                orderBy: {
                    roomNumber: 'asc'
                }
            });
        },
        actualRoom: async (_, { id }, { admin, prisma }) => {
            if (!admin) {
                throw new graphql_1.GraphQLError('Admin access required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            return prisma.actualRoom.findUnique({
                where: { id }
            });
        },
        actualRoomsByType: async (_, { roomTypeId }, { admin, prisma }) => {
            if (!admin) {
                throw new graphql_1.GraphQLError('Admin access required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            return prisma.actualRoom.findMany({
                where: { roomTypeId },
                orderBy: {
                    roomNumber: 'asc'
                }
            });
        },
        availableActualRooms: async (_, { roomTypeId, checkIn, checkOut, excludeReservationIds = [] }, { admin, prisma }) => {
            if (!admin) {
                throw new graphql_1.GraphQLError('Admin access required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            // Validate dates
            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                throw new graphql_1.GraphQLError('Invalid date format provided', {
                    extensions: { code: 'BAD_USER_INPUT' }
                });
            }
            console.log('📅 Date range:', {
                checkIn: checkInDate.toISOString().split('T')[0],
                checkOut: checkOutDate.toISOString().split('T')[0],
                excludeReservations: excludeReservationIds
            });
            // Find available rooms of the specified type that don't have conflicting reservations
            const availableRooms = await prisma.actualRoom.findMany({
                where: {
                    roomTypeId: roomTypeId,
                    isAvailable: true,
                    isUnderMaintenance: false,
                    reservations: {
                        none: {
                            status: { not: 'CANCELLED' },
                            id: { notIn: excludeReservationIds },
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
                    }
                },
                orderBy: {
                    roomNumber: 'asc'
                }
            });
            console.log('🏨 Available rooms found:', availableRooms.map(r => r.roomNumber));
            return availableRooms;
        },
    },
    Mutation: {
        // Room Type Management
        createRoomType: async (_, { input }, context) => {
            const { admin, prisma } = context;
            // Authorization check
            middleware_1.ValidationMiddleware.requireAdmin(context);
            // Rate limiting for admin operations
            await middleware_1.ValidationMiddleware.checkRateLimit(() => rateLimitService_1.FunctionRateLimit.checkAdminOperation(admin.id, 'create_room_type'), context, 'create_room_type');
            // Validate and sanitize input
            const validatedInput = middleware_1.ValidationMiddleware.validateInput(schemas_1.createRoomTypeSchema, input, context);
            // Log admin action
            middleware_1.ValidationMiddleware.logAdminAction(context, 'CREATE_ROOM_TYPE', 'room_type', undefined, validatedInput);
            const roomType = await prisma.roomType.create({
                data: validatedInput
            });
            // Log success
            securityLogger_1.SecurityLoggerService.logSuccess({
                event: 'ROOM_TYPE_CREATED',
                severity: 'LOW',
                ip: context.req?.ip,
                userAgent: context.req?.headers['user-agent'],
                adminId: admin.id,
                details: {
                    roomTypeId: roomType.id,
                    name: roomType.name,
                    timestamp: new Date().toISOString(),
                },
            });
            return roomType;
        },
        updateRoomType: async (_, { id, input }, { admin, prisma }) => {
            if (!admin || admin.role !== 'ADMIN') {
                throw new graphql_1.GraphQLError('Admin access required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            return prisma.roomType.update({
                where: { id },
                data: input
            });
        },
        deleteRoomType: async (_, { id }, { admin, prisma }) => {
            if (!admin || admin.role !== 'ADMIN') {
                throw new graphql_1.GraphQLError('Admin access required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            await prisma.roomType.delete({
                where: { id }
            });
            return true;
        },
        // Actual Room Management
        createActualRoom: async (_, { input }, { admin, prisma }) => {
            if (!admin || admin.role !== 'ADMIN') {
                throw new graphql_1.GraphQLError('Admin access required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            return prisma.actualRoom.create({
                data: input
            });
        },
        updateActualRoom: async (_, { id, input }, { admin, prisma }) => {
            if (!admin || admin.role !== 'ADMIN') {
                throw new graphql_1.GraphQLError('Admin access required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            return prisma.actualRoom.update({
                where: { id },
                data: input
            });
        },
        deleteActualRoom: async (_, { id }, { admin, prisma }) => {
            if (!admin || admin.role !== 'ADMIN') {
                throw new graphql_1.GraphQLError('Admin access required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            await prisma.actualRoom.delete({
                where: { id }
            });
            return true;
        },
        // Reservation Room Assignment
        assignRoomToReservation: async (_, { reservationId, actualRoomId }, { admin, prisma }) => {
            if (!admin) {
                throw new graphql_1.GraphQLError('Admin access required', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            // Basic validation - room and reservation exist
            const reservation = await prisma.reservation.findUnique({
                where: { id: reservationId }
            });
            if (!reservation) {
                throw new graphql_1.GraphQLError('Reservation not found', {
                    extensions: { code: 'NOT_FOUND' }
                });
            }
            const actualRoom = await prisma.actualRoom.findUnique({
                where: { id: actualRoomId }
            });
            if (!actualRoom) {
                throw new graphql_1.GraphQLError('Room not found', {
                    extensions: { code: 'NOT_FOUND' }
                });
            }
            // UI should filter out conflicting rooms, so directly assign the room
            return prisma.reservation.update({
                where: { id: reservationId },
                data: { actualRoomId }
            });
        },
    },
    // Type resolvers
    RoomType: {
        rooms: async (parent, _, { prisma }) => {
            return prisma.actualRoom.findMany({
                where: { roomTypeId: parent.id },
                orderBy: {
                    roomNumber: 'asc'
                }
            });
        },
        reservations: async (parent, _, { prisma }) => {
            return prisma.reservation.findMany({
                where: { roomTypeId: parent.id },
                orderBy: {
                    checkIn: 'asc'
                }
            });
        },
    },
    ActualRoom: {
        roomType: async (parent, _, { prisma }) => {
            return prisma.roomType.findUnique({
                where: { id: parent.roomTypeId }
            });
        },
        reservations: async (parent, _, { prisma }) => {
            return prisma.reservation.findMany({
                where: { actualRoomId: parent.id },
                orderBy: {
                    checkIn: 'asc'
                }
            });
        },
    },
};
//# sourceMappingURL=roomResolvers.js.map