import { adminResolvers } from './adminResolvers';
import { roomResolvers } from './roomResolvers';
import { reservationResolvers } from './reservationResolvers';
import { paymentResolvers } from './paymentResolvers';
import { DateTimeResolver } from 'graphql-scalars';

export const resolvers = {
  DateTime: DateTimeResolver,
  
  Query: {
    ...adminResolvers.Query,
    ...roomResolvers.Query,
    ...reservationResolvers.Query,
    ...paymentResolvers.Query,
  },
  
  Mutation: {
    ...adminResolvers.Mutation,
    ...roomResolvers.Mutation,
    ...reservationResolvers.Mutation,
    ...paymentResolvers.Mutation,
  },
  
  Admin: {
    // No additional fields needed for now
  },
  RoomType: roomResolvers.RoomType,
  ActualRoom: roomResolvers.ActualRoom,
  Reservation: reservationResolvers.Reservation,
  Payment: paymentResolvers.Payment,
};