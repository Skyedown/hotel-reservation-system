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
        createMultiRoomReservation: async (_, { input }, { prisma }) => {
            // Generate a shared payment intent ID that will link all reservations
            const sharedPaymentId = (0, crypto_1.randomBytes)(16).toString('hex');
            // Create each reservation in a transaction
            const result = await prisma.$transaction(async (tx) => {
                const createdReservations = [];
                for (const roomReservation of input.rooms) {
                    // Generate unique access token for each reservation
                    const accessToken = (0, crypto_1.randomBytes)(32).toString('hex');
                    // Check room availability
                    const conflictingReservations = await tx.reservation.findMany({
                        where: {
                            roomId: roomReservation.roomId,
                            status: {
                                in: ['CONFIRMED', 'CHECKED_IN']
                            },
                            OR: [
                                {
                                    AND: [
                                        { checkIn: { lte: roomReservation.checkIn } },
                                        { checkOut: { gt: roomReservation.checkIn } }
                                    ]
                                },
                                {
                                    AND: [
                                        { checkIn: { lt: roomReservation.checkOut } },
                                        { checkOut: { gte: roomReservation.checkOut } }
                                    ]
                                },
                                {
                                    AND: [
                                        { checkIn: { gte: roomReservation.checkIn } },
                                        { checkOut: { lte: roomReservation.checkOut } }
                                    ]
                                }
                            ]
                        }
                    });
                    if (conflictingReservations.length > 0) {
                        const room = await tx.room.findUnique({ where: { id: roomReservation.roomId } });
                        throw new Error(`Room ${room?.roomNumber} is not available for the selected dates`);
                    }
                    // Get room details to calculate total price
                    const room = await tx.room.findUnique({
                        where: { id: roomReservation.roomId }
                    });
                    if (!room) {
                        throw new Error(`Room not found: ${roomReservation.roomId}`);
                    }
                    // Calculate number of nights
                    const checkInDate = new Date(roomReservation.checkIn);
                    const checkOutDate = new Date(roomReservation.checkOut);
                    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
                    const totalPrice = room.price * nights;
                    const reservation = await tx.reservation.create({
                        data: {
                            roomId: roomReservation.roomId,
                            guestEmail: input.guestEmail,
                            guestFirstName: input.guestFirstName,
                            guestLastName: input.guestLastName,
                            guestPhone: input.guestPhone,
                            checkIn: roomReservation.checkIn,
                            checkOut: roomReservation.checkOut,
                            guests: roomReservation.guests,
                            specialRequests: input.specialRequests,
                            totalPrice,
                            accessToken,
                            // Set a temporary paymentIntentId for grouping - will be replaced by actual Stripe ID
                            paymentIntentId: `temp_${sharedPaymentId}`
                        },
                        include: {
                            room: true,
                            payments: true
                        }
                    });
                    createdReservations.push(reservation);
                }
                return createdReservations;
            });
            return result;
        },
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
        cancelReservation: async (_, { accessToken }, { prisma }) => {
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
            if (reservation.status === 'CANCELLED') {
                throw new Error('Reservation is already cancelled');
            }
            if (reservation.status === 'CHECKED_IN' || reservation.status === 'CHECKED_OUT') {
                throw new Error('Cannot cancel a reservation that has already started or completed');
            }
            // Find all related reservations in the same booking group
            let allReservations = [reservation];
            if (reservation.paymentIntentId) {
                allReservations = await prisma.reservation.findMany({
                    where: {
                        paymentIntentId: reservation.paymentIntentId
                    },
                    include: {
                        room: true,
                        payments: true
                    }
                });
            }
            // Cancel all reservations in the group
            await prisma.reservation.updateMany({
                where: {
                    id: {
                        in: allReservations.map(res => res.id)
                    }
                },
                data: { status: 'CANCELLED' }
            });
            // Return the primary reservation with updated status
            return prisma.reservation.findUnique({
                where: { accessToken },
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