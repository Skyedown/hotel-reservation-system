"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminResolvers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const graphql_1 = require("graphql");
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
                    room: true,
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
                    room: true,
                    payments: true
                }
            });
        },
    },
    Mutation: {
        adminLogin: async (_, { input }, { prisma }) => {
            const admin = await prisma.admin.findUnique({
                where: { email: input.email }
            });
            if (!admin) {
                throw new graphql_1.GraphQLError('Invalid credentials', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            const isPasswordValid = await bcryptjs_1.default.compare(input.password, admin.password);
            if (!isPasswordValid) {
                throw new graphql_1.GraphQLError('Invalid credentials', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            const token = jsonwebtoken_1.default.sign({ adminId: admin.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
            return { token, admin };
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
                    room: true,
                    payments: true
                }
            });
        },
    },
};
//# sourceMappingURL=adminResolvers.js.map