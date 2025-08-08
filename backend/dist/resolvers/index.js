"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const adminResolvers_1 = require("./adminResolvers");
const roomResolvers_1 = require("./roomResolvers");
const reservationResolvers_1 = require("./reservationResolvers");
const paymentResolvers_1 = require("./paymentResolvers");
const graphql_scalars_1 = require("graphql-scalars");
exports.resolvers = {
    DateTime: graphql_scalars_1.DateTimeResolver,
    Query: {
        ...adminResolvers_1.adminResolvers.Query,
        ...roomResolvers_1.roomResolvers.Query,
        ...reservationResolvers_1.reservationResolvers.Query,
        ...paymentResolvers_1.paymentResolvers.Query,
    },
    Mutation: {
        ...adminResolvers_1.adminResolvers.Mutation,
        ...roomResolvers_1.roomResolvers.Mutation,
        ...reservationResolvers_1.reservationResolvers.Mutation,
        ...paymentResolvers_1.paymentResolvers.Mutation,
    },
    Admin: {
    // No additional fields needed for now
    },
    RoomType: roomResolvers_1.roomResolvers.RoomType,
    ActualRoom: roomResolvers_1.roomResolvers.ActualRoom,
    Reservation: reservationResolvers_1.reservationResolvers.Reservation,
    Payment: paymentResolvers_1.paymentResolvers.Payment,
};
//# sourceMappingURL=index.js.map