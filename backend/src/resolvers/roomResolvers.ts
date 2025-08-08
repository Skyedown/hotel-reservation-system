import { Context } from '../context';
import { GraphQLError } from 'graphql';

export const roomResolvers = {
  Query: {
    // Public queries for room types
    roomTypes: async (_: any, __: any, { prisma }: Context) => {
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
    
    roomType: async (_: any, { id }: any, { prisma }: Context) => {
      return prisma.roomType.findUnique({
        where: { id }
      });
    },
    
    availableRoomTypes: async (_: any, { checkIn, checkOut, guests }: any, { prisma }: Context) => {
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
        throw new GraphQLError('Invalid date format provided', {
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
    actualRooms: async (_: any, __: any, { admin, prisma }: Context) => {
      if (!admin) {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      return prisma.actualRoom.findMany({
        orderBy: {
          roomNumber: 'asc'
        }
      });
    },
    
    actualRoom: async (_: any, { id }: any, { admin, prisma }: Context) => {
      if (!admin) {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      return prisma.actualRoom.findUnique({
        where: { id }
      });
    },
    
    actualRoomsByType: async (_: any, { roomTypeId }: any, { admin, prisma }: Context) => {
      if (!admin) {
        throw new GraphQLError('Admin access required', {
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

    availableActualRooms: async (_: any, { roomTypeId, checkIn, checkOut, excludeReservationIds = [] }: any, { admin, prisma }: Context) => {
      
      if (!admin) {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      // Validate dates
      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        throw new GraphQLError('Invalid date format provided', {
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
    createRoomType: async (_: any, { input }: any, { admin, prisma }: Context) => {
      if (!admin || admin.role !== 'ADMIN') {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      return prisma.roomType.create({
        data: input
      });
    },
    
    updateRoomType: async (_: any, { id, input }: any, { admin, prisma }: Context) => {
      if (!admin || admin.role !== 'ADMIN') {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      return prisma.roomType.update({
        where: { id },
        data: input
      });
    },
    
    deleteRoomType: async (_: any, { id }: any, { admin, prisma }: Context) => {
      if (!admin || admin.role !== 'ADMIN') {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      await prisma.roomType.delete({
        where: { id }
      });
      
      return true;
    },

    // Actual Room Management
    createActualRoom: async (_: any, { input }: any, { admin, prisma }: Context) => {
      if (!admin || admin.role !== 'ADMIN') {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      return prisma.actualRoom.create({
        data: input
      });
    },
    
    updateActualRoom: async (_: any, { id, input }: any, { admin, prisma }: Context) => {
      if (!admin || admin.role !== 'ADMIN') {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      return prisma.actualRoom.update({
        where: { id },
        data: input
      });
    },
    
    deleteActualRoom: async (_: any, { id }: any, { admin, prisma }: Context) => {
      if (!admin || admin.role !== 'ADMIN') {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      await prisma.actualRoom.delete({
        where: { id }
      });
      
      return true;
    },

    // Reservation Room Assignment
    assignRoomToReservation: async (_: any, { reservationId, actualRoomId }: any, { admin, prisma }: Context) => {
      if (!admin) {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      // Basic validation - room and reservation exist
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId }
      });
      
      if (!reservation) {
        throw new GraphQLError('Reservation not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      const actualRoom = await prisma.actualRoom.findUnique({
        where: { id: actualRoomId }
      });
      
      if (!actualRoom) {
        throw new GraphQLError('Room not found', {
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
    rooms: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.actualRoom.findMany({
        where: { roomTypeId: parent.id },
        orderBy: {
          roomNumber: 'asc'
        }
      });
    },
    reservations: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.reservation.findMany({
        where: { roomTypeId: parent.id },
        orderBy: {
          checkIn: 'asc'
        }
      });
    },
  },

  ActualRoom: {
    roomType: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.roomType.findUnique({
        where: { id: parent.roomTypeId }
      });
    },
    reservations: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.reservation.findMany({
        where: { actualRoomId: parent.id },
        orderBy: {
          checkIn: 'asc'
        }
      });
    },
  },
};