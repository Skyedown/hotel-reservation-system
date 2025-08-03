"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservationResolvers = void 0;
const crypto_1 = require("crypto");
exports.reservationResolvers = {
    Query: {
        reservation: async (_, { accessToken }, { prisma }) => {
            const reservation = await prisma.reservation.findUnique({
                where: { accessToken },
                include: {
                    room: true,
                    payments: true
                }
            });
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            return reservation;
        },
    },
    Mutation: {
        createReservation: async (_, { input }, { prisma }) => {
            // Generate unique access token
            const accessToken = (0, crypto_1.randomBytes)(32).toString('hex');
            // Check room availability
            const conflictingReservations = await prisma.reservation.findMany({
                where: {
                    roomId: input.roomId,
                    status: {
                        in: ['CONFIRMED', 'CHECKED_IN']
                    },
                    OR: [
                        {
                            AND: [
                                { checkIn: { lte: input.checkIn } },
                                { checkOut: { gt: input.checkIn } }
                            ]
                        },
                        {
                            AND: [
                                { checkIn: { lt: input.checkOut } },
                                { checkOut: { gte: input.checkOut } }
                            ]
                        },
                        {
                            AND: [
                                { checkIn: { gte: input.checkIn } },
                                { checkOut: { lte: input.checkOut } }
                            ]
                        }
                    ]
                }
            });
            if (conflictingReservations.length > 0) {
                throw new Error('Room is not available for the selected dates');
            }
            // Get room details to calculate total price
            const room = await prisma.room.findUnique({
                where: { id: input.roomId }
            });
            if (!room) {
                throw new Error('Room not found');
            }
            // Calculate number of nights
            const checkInDate = new Date(input.checkIn);
            const checkOutDate = new Date(input.checkOut);
            const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
            const totalPrice = room.price * nights;
            return prisma.reservation.create({
                data: {
                    ...input,
                    totalPrice,
                    accessToken
                },
                include: {
                    room: true,
                    payments: true
                }
            });
        },
        updateReservation: async (_, { accessToken, input }, { prisma }) => {
            const reservation = await prisma.reservation.findUnique({
                where: { accessToken }
            });
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            if (reservation.status !== 'PENDING') {
                throw new Error('Only pending reservations can be updated');
            }
            // If dates are being changed, recalculate price
            let updateData = { ...input };
            if (input.checkIn || input.checkOut) {
                const room = await prisma.room.findUnique({
                    where: { id: reservation.roomId }
                });
                const checkInDate = new Date(input.checkIn || reservation.checkIn);
                const checkOutDate = new Date(input.checkOut || reservation.checkOut);
                const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
                updateData.totalPrice = room.price * nights;
            }
            return prisma.reservation.update({
                where: { accessToken },
                data: updateData,
                include: {
                    room: true,
                    payments: true
                }
            });
        },
        cancelReservation: async (_, { accessToken }, { prisma }) => {
            const reservation = await prisma.reservation.findUnique({
                where: { accessToken }
            });
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            if (reservation.status === 'CANCELLED') {
                throw new Error('Reservation is already cancelled');
            }
            if (reservation.status === 'CHECKED_IN' || reservation.status === 'CHECKED_OUT') {
                throw new Error('Cannot cancel a reservation that has already started or completed');
            }
            return prisma.reservation.update({
                where: { accessToken },
                data: { status: 'CANCELLED' },
                include: {
                    room: true,
                    payments: true
                }
            });
        },
    },
    Reservation: {
        room: async (parent, _, { prisma }) => {
            return prisma.room.findUnique({
                where: { id: parent.roomId }
            });
        },
        payments: async (parent, _, { prisma }) => {
            return prisma.payment.findMany({
                where: { reservationId: parent.id }
            });
        },
    },
};
//# sourceMappingURL=reservationResolvers.js.map