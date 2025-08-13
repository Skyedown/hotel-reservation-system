import { Context } from '../context';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { ValidationMiddleware } from '../validation/middleware';
import { SecurityLoggerService } from '../services/securityLogger';
import { adminLoginSchema } from '../validation/schemas';
import { FunctionRateLimit } from '../services/rateLimitService';
import { env } from '../config/environment';

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
    adminLogin: async (_: any, { input }: any, context: Context) => {
      const { prisma } = context;
      
      // Validate and sanitize input
      const validatedInput = ValidationMiddleware.validateInput(adminLoginSchema, input, context);
      
      // Check rate limiting per email
      const rateLimitResult = await FunctionRateLimit.checkAdminLogin(validatedInput.email);
      if (!rateLimitResult.allowed) {
        SecurityLoggerService.logSuspiciousActivity({
          event: 'ADMIN_LOGIN_RATE_LIMITED',
          severity: 'HIGH',
          ip: context.req?.ip,
          userAgent: context.req?.headers['user-agent'],
          details: {
            email: validatedInput.email,
            retryAfter: rateLimitResult.retryAfter,
          },
        });
        
        throw new GraphQLError(`Too many login attempts. Try again in ${rateLimitResult.retryAfter} seconds.`, {
          extensions: { 
            code: 'RATE_LIMITED',
            retryAfter: rateLimitResult.retryAfter,
          }
        });
      }

      const admin = await prisma.admin.findUnique({
        where: { email: validatedInput.email }
      });

      if (!admin) {
        SecurityLoggerService.logAuthEvent({
          event: 'ADMIN_LOGIN_FAILED_USER_NOT_FOUND',
          severity: 'MEDIUM',
          ip: context.req?.ip,
          userAgent: context.req?.headers['user-agent'],
          details: {
            email: validatedInput.email,
            reason: 'user_not_found',
          },
        });
        
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const isPasswordValid = await bcrypt.compare(validatedInput.password, admin.password);

      if (!isPasswordValid) {
        SecurityLoggerService.logAuthEvent({
          event: 'ADMIN_LOGIN_FAILED_INVALID_PASSWORD',
          severity: 'MEDIUM',
          ip: context.req?.ip,
          userAgent: context.req?.headers['user-agent'],
          adminId: admin.id,
          details: {
            email: validatedInput.email,
            reason: 'invalid_password',
          },
        });
        
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      // Generate secure JWT token
      const token = jwt.sign(
        { 
          adminId: admin.id,
          role: admin.role,
          iat: Math.floor(Date.now() / 1000),
        },
        env.JWT_SECRET,
        { 
          expiresIn: '7d',
          algorithm: 'HS256',
        }
      );

      // Log successful login
      SecurityLoggerService.logAuthEvent({
        event: 'ADMIN_LOGIN_SUCCESS',
        severity: 'LOW',
        ip: context.req?.ip,
        userAgent: context.req?.headers['user-agent'],
        adminId: admin.id,
        details: {
          email: admin.email,
          role: admin.role,
          loginTime: new Date().toISOString(),
        },
      });

      return { 
        token, 
        admin: {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
        }
      };
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