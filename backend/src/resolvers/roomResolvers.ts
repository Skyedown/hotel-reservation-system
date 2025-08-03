import { Context } from '../context';
import { GraphQLError } from 'graphql';

export const roomResolvers = {
  Query: {
    rooms: async (_: any, __: any, { prisma }: Context) => {
      return prisma.room.findMany({
        orderBy: {
          roomNumber: 'asc'
        }
      });
    },
    
    room: async (_: any, { id }: any, { prisma }: Context) => {
      return prisma.room.findUnique({
        where: { id }
      });
    },
    
    availableRooms: async (_: any, { checkIn, checkOut, guests }: any, { prisma }: Context) => {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
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
    createRoom: async (_: any, { input }: any, { admin, prisma }: Context) => {
      if (!admin || admin.role !== 'ADMIN') {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      return prisma.room.create({
        data: input
      });
    },
    
    updateRoom: async (_: any, { id, input }: any, { admin, prisma }: Context) => {
      if (!admin || admin.role !== 'ADMIN') {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      return prisma.room.update({
        where: { id },
        data: input
      });
    },
    
    deleteRoom: async (_: any, { id }: any, { admin, prisma }: Context) => {
      if (!admin || admin.role !== 'ADMIN') {
        throw new GraphQLError('Admin access required', {
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
    reservations: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.reservation.findMany({
        where: { roomId: parent.id },
        orderBy: {
          checkIn: 'asc'
        }
      });
    },
  },
};