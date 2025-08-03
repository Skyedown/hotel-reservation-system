"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
exports.typeDefs = `#graphql
  scalar DateTime

  type Admin {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: AdminRole!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum AdminRole {
    STAFF
    ADMIN
  }

  type Room {
    id: ID!
    roomNumber: String!
    type: RoomType!
    description: String!
    price: Float!
    capacity: Int!
    amenities: [String!]!
    images: [String!]!
    isAvailable: Boolean!
    reservations: [Reservation!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum RoomType {
    STANDARD
    DELUXE
    SUITE
    PRESIDENTIAL
  }

  type Reservation {
    id: ID!
    roomId: ID!
    room: Room!
    guestEmail: String!
    guestFirstName: String!
    guestLastName: String!
    guestPhone: String
    checkIn: DateTime!
    checkOut: DateTime!
    guests: Int!
    totalPrice: Float!
    status: ReservationStatus!
    paymentStatus: PaymentStatus!
    paymentIntentId: String
    specialRequests: String
    accessToken: String!
    payments: [Payment!]!
    expiresAt: DateTime
    lastStatusChange: DateTime!
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ReservationStatus {
    PENDING
    CONFIRMED
    CHECKED_IN
    CHECKED_OUT
    CANCELLED
  }

  enum PaymentStatus {
    PENDING
    PROCESSING
    COMPLETED
    FAILED
    REFUNDED
  }

  type Payment {
    id: ID!
    reservationId: ID!
    reservation: Reservation!
    amount: Float!
    currency: String!
    stripePaymentIntentId: String!
    status: PaymentStatus!
    webhookEventId: String
    failureReason: String
    refundAmount: Float
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type PaymentStatusResult {
    reservationId: ID!
    paymentStatus: PaymentStatus!
    reservationStatus: ReservationStatus!
    paymentIntent: String
    amount: Float!
    payment: Payment
  }

  type RefundResult {
    id: String!
    amount: Float!
    status: String!
    reason: String
  }

  type AdminAuthPayload {
    token: String!
    admin: Admin!
  }

  input AdminLoginInput {
    email: String!
    password: String!
  }

  input CreateReservationInput {
    roomId: ID!
    guestEmail: String!
    guestFirstName: String!
    guestLastName: String!
    guestPhone: String
    checkIn: DateTime!
    checkOut: DateTime!
    guests: Int!
    specialRequests: String
  }

  input UpdateReservationInput {
    checkIn: DateTime
    checkOut: DateTime
    guests: Int
    specialRequests: String
  }

  input CreateRoomInput {
    roomNumber: String!
    type: RoomType!
    description: String!
    price: Float!
    capacity: Int!
    amenities: [String!]!
    images: [String!]!
    isAvailable: Boolean
  }

  type Query {
    # Public queries
    rooms: [Room!]!
    room(id: ID!): Room
    availableRooms(checkIn: String!, checkOut: String!, guests: Int!): [Room!]!
    
    # Guest reservation access via token
    reservation(accessToken: String!): Reservation
    getPaymentStatus(accessToken: String!): PaymentStatusResult!
    
    # Admin queries
    me: Admin
    allReservations: [Reservation!]!
    reservationById(id: ID!): Reservation
  }

  type Mutation {
    # Admin authentication
    adminLogin(input: AdminLoginInput!): AdminAuthPayload!
    
    # Public reservation creation
    createReservation(input: CreateReservationInput!): Reservation!
    
    # Guest reservation management via token
    updateReservation(accessToken: String!, input: UpdateReservationInput!): Reservation!
    cancelReservation(accessToken: String!): Reservation!
    
    # Payment processing
    createPaymentIntent(accessToken: String!): String!
    
    # Admin only mutations
    createRoom(input: CreateRoomInput!): Room!
    updateRoom(id: ID!, input: CreateRoomInput!): Room!
    deleteRoom(id: ID!): Boolean!
    
    updateReservationStatus(id: ID!, status: ReservationStatus!): Reservation!
    processRefund(reservationId: ID!, amount: Float, reason: String): RefundResult!
  }
`;
//# sourceMappingURL=typeDefs.js.map