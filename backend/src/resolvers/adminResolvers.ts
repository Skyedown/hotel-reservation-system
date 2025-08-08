import { Context } from '../context';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

export const adminResolvers = {
  Query: {
    me: async (_: any, __: any, { admin }: Context) => {
      if (!admin) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      return admin;
    },
    
    allReservations: async (_: any, __: any, { admin, prisma }: Context) => {
      if (!admin) {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      return prisma.reservation.findMany({
        include: {
          roomType: true,
          actualRoom: true,
          payments: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    },
    
    reservationById: async (_: any, { id }: any, { admin, prisma }: Context) => {
      if (!admin) {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      return prisma.reservation.findUnique({
        where: { id },
        include: {
          roomType: true,
          actualRoom: true,
          payments: true
        }
      });
    },
  },

  Mutation: {
    adminLogin: async (_: any, { input }: any, { prisma }: Context) => {
      const admin = await prisma.admin.findUnique({
        where: { email: input.email }
      });

      if (!admin) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const isPasswordValid = await bcrypt.compare(input.password, admin.password);

      if (!isPasswordValid) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const token = jwt.sign(
        { adminId: admin.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return { token, admin };
    },
    
    updateReservationStatus: async (_: any, { id, status }: any, { admin, prisma }: Context) => {
      if (!admin) {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      return prisma.reservation.update({
        where: { id },
        data: { status },
        include: {
          roomType: true,
          actualRoom: true,
          payments: true
        }
      });
    },
  },
};