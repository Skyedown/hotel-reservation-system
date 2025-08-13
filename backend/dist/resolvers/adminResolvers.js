"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminResolvers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const graphql_1 = require("graphql");
const middleware_1 = require("../validation/middleware");
const securityLogger_1 = require("../services/securityLogger");
const schemas_1 = require("../validation/schemas");
const rateLimitService_1 = require("../services/rateLimitService");
const environment_1 = require("../config/environment");
exports.adminResolvers = {
    Query: {
        me: async (_, __, { admin }) => {
            if (!admin) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            return admin;
        },
        allReservations: async (_, __, { admin, prisma }) => {
            if (!admin) {
                throw new graphql_1.GraphQLError('Admin access required', {
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
        reservationById: async (_, { id }, { admin, prisma }) => {
            if (!admin) {
                throw new graphql_1.GraphQLError('Admin access required', {
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
        adminLogin: async (_, { input }, context) => {
            const { prisma } = context;
            // Validate and sanitize input
            const validatedInput = middleware_1.ValidationMiddleware.validateInput(schemas_1.adminLoginSchema, input, context);
            // Check rate limiting per email
            const rateLimitResult = await rateLimitService_1.FunctionRateLimit.checkAdminLogin(validatedInput.email);
            if (!rateLimitResult.allowed) {
                securityLogger_1.SecurityLoggerService.logSuspiciousActivity({
                    event: 'ADMIN_LOGIN_RATE_LIMITED',
                    severity: 'HIGH',
                    ip: context.req?.ip,
                    userAgent: context.req?.headers['user-agent'],
                    details: {
                        email: validatedInput.email,
                        retryAfter: rateLimitResult.retryAfter,
                    },
                });
                throw new graphql_1.GraphQLError(`Too many login attempts. Try again in ${rateLimitResult.retryAfter} seconds.`, {
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
                securityLogger_1.SecurityLoggerService.logAuthEvent({
                    event: 'ADMIN_LOGIN_FAILED_USER_NOT_FOUND',
                    severity: 'MEDIUM',
                    ip: context.req?.ip,
                    userAgent: context.req?.headers['user-agent'],
                    details: {
                        email: validatedInput.email,
                        reason: 'user_not_found',
                    },
                });
                throw new graphql_1.GraphQLError('Invalid credentials', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            const isPasswordValid = await bcryptjs_1.default.compare(validatedInput.password, admin.password);
            if (!isPasswordValid) {
                securityLogger_1.SecurityLoggerService.logAuthEvent({
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
                throw new graphql_1.GraphQLError('Invalid credentials', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            // Generate secure JWT token
            const token = jsonwebtoken_1.default.sign({
                adminId: admin.id,
                role: admin.role,
                iat: Math.floor(Date.now() / 1000),
            }, environment_1.env.JWT_SECRET, {
                expiresIn: '7d',
                algorithm: 'HS256',
            });
            // Log successful login
            securityLogger_1.SecurityLoggerService.logAuthEvent({
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
        updateReservationStatus: async (_, { id, status }, { admin, prisma }) => {
            if (!admin) {
                throw new graphql_1.GraphQLError('Admin access required', {
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
//# sourceMappingURL=adminResolvers.js.map