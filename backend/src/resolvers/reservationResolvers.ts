import { Context } from '../context';
import { randomBytes } from 'crypto';

export const reservationResolvers = {
  Query: {
    reservation: async (_: any, { accessToken }: any, { prisma }: Context) => {
      const reservation = await prisma.reservation.findUnique({
        where: { accessToken },
        include: {
          roomType: true,
          actualRoom: true,
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
    createMultiRoomReservation: async (_: any, { input }: any, { prisma }: Context) => {
      // Generate a shared payment intent ID that will link all reservations
      const sharedPaymentId = randomBytes(16).toString('hex');

      // Create each reservation in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const createdReservations = [];

        for (const roomReservation of input.rooms) {
          // Generate unique access token for each reservation
          const accessToken = randomBytes(32).toString('hex');
          
          // Get room type details
          const roomType = await tx.roomType.findUnique({
            where: { id: roomReservation.roomTypeId }
          });
          
          if (!roomType) {
            throw new Error(`Room type not found: ${roomReservation.roomTypeId}`);
          }

          // Check if room type has capacity for guests
          if (roomType.capacity < roomReservation.guests) {
            throw new Error(`Room type ${roomType.name} can only accommodate ${roomType.capacity} guests`);
          }
          
          // Calculate number of nights
          const checkInDate = new Date(roomReservation.checkIn);
          const checkOutDate = new Date(roomReservation.checkOut);
          const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
          const totalPrice = roomType.price * nights;
          
          const reservation = await tx.reservation.create({
            data: {
              roomTypeId: roomReservation.roomTypeId,
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
              roomType: true,
              actualRoom: true,
              payments: true
            }
          });

          createdReservations.push(reservation);
        }

        return createdReservations;
      });

      return result;
    },

    createReservation: async (_: any, { input }: any, { prisma }: Context) => {
      // Generate unique access token
      const accessToken = randomBytes(32).toString('hex');
      
      // Get room type details
      const roomType = await prisma.roomType.findUnique({
        where: { id: input.roomTypeId }
      });
      
      if (!roomType) {
        throw new Error('Room type not found');
      }

      // Check if room type has capacity for guests
      if (roomType.capacity < input.guests) {
        throw new Error(`Room type ${roomType.name} can only accommodate ${roomType.capacity} guests`);
      }
      
      // Calculate number of nights
      const checkInDate = new Date(input.checkIn);
      const checkOutDate = new Date(input.checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = roomType.price * nights;
      
      return prisma.reservation.create({
        data: {
          ...input,
          totalPrice,
          accessToken
        },
        include: {
          roomType: true,
          actualRoom: true,
          payments: true
        }
      });
    },
    
    
    cancelReservation: async (_: any, { accessToken }: any, { prisma }: Context) => {
      const reservation = await prisma.reservation.findUnique({
        where: { accessToken },
        include: {
          roomType: true,
          actualRoom: true,
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
            roomType: true,
            actualRoom: true,
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
          roomType: true,
          actualRoom: true,
          payments: true
        }
      });
    },
  },

  Reservation: {
    roomType: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.roomType.findUnique({
        where: { id: parent.roomTypeId }
      });
    },
    
    actualRoom: async (parent: any, _: any, { prisma }: Context) => {
      if (!parent.actualRoomId) return null;
      return prisma.actualRoom.findUnique({
        where: { id: parent.actualRoomId }
      });
    },
    
    payments: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.payment.findMany({
        where: { reservationId: parent.id }
      });
    },
  },
};