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
    phoneNumber: String
    role: AdminRole!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum AdminRole {
    STAFF
    ADMIN
  }

  type RoomType {
    id: ID!
    name: String!
    description: String!
    price: Float!
    capacity: Int!
    amenities: [String!]!
    images: [String!]!
    isActive: Boolean!
    rooms: [ActualRoom!]!
    reservations: [Reservation!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ActualRoom {
    id: ID!
    roomNumber: String!
    roomTypeId: ID!
    roomType: RoomType!
    isAvailable: Boolean!
    isUnderMaintenance: Boolean!
    maintenanceNotes: String
    reservations: [Reservation!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Reservation {
    id: ID!
    roomTypeId: ID!
    roomType: RoomType!
    actualRoomId: ID
    actualRoom: ActualRoom
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
    roomTypeId: ID!
    guestEmail: String!
    guestFirstName: String!
    guestLastName: String!
    guestPhone: String
    checkIn: DateTime!
    checkOut: DateTime!
    guests: Int!
    specialRequests: String
  }

  input CreateMultiRoomReservationInput {
    guestEmail: String!
    guestFirstName: String!
    guestLastName: String!
    guestPhone: String
    specialRequests: String
    rooms: [RoomReservationInput!]!
  }

  input RoomReservationInput {
    roomTypeId: ID!
    checkIn: DateTime!
    checkOut: DateTime!
    guests: Int!
  }

  input CreateRoomTypeInput {
    name: String!
    description: String!
    price: Float!
    capacity: Int!
    amenities: [String!]!
    images: [String!]!
    isActive: Boolean
  }

  input CreateActualRoomInput {
    roomNumber: String!
    roomTypeId: ID!
    isAvailable: Boolean
    isUnderMaintenance: Boolean
    maintenanceNotes: String
  }

  input UpdateActualRoomInput {
    roomNumber: String
    isAvailable: Boolean
    isUnderMaintenance: Boolean
    maintenanceNotes: String
  }

  type Query {
    # Public queries
    roomTypes: [RoomType!]!
    roomType(id: ID!): RoomType
    availableRoomTypes(checkIn: String!, checkOut: String!, guests: Int!): [RoomType!]!
    
    # Admin queries for rooms
    actualRooms: [ActualRoom!]!
    actualRoom(id: ID!): ActualRoom
    actualRoomsByType(roomTypeId: ID!): [ActualRoom!]!
    availableActualRooms(roomTypeId: ID!, checkIn: String!, checkOut: String!, excludeReservationIds: [ID!]): [ActualRoom!]!
    
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
    createMultiRoomReservation(input: CreateMultiRoomReservationInput!): [Reservation!]!
    
    # Guest reservation management via token
    cancelReservation(accessToken: String!): Reservation!
    
    # Payment processing
    createPaymentIntent(accessToken: String!): String!
    
    # Admin only mutations for room types
    createRoomType(input: CreateRoomTypeInput!): RoomType!
    updateRoomType(id: ID!, input: CreateRoomTypeInput!): RoomType!
    deleteRoomType(id: ID!): Boolean!
    
    # Admin only mutations for actual rooms
    createActualRoom(input: CreateActualRoomInput!): ActualRoom!
    updateActualRoom(id: ID!, input: UpdateActualRoomInput!): ActualRoom!
    deleteActualRoom(id: ID!): Boolean!
    
    # Admin reservation management
    assignRoomToReservation(reservationId: ID!, actualRoomId: ID!): Reservation!
    updateReservationStatus(id: ID!, status: ReservationStatus!): Reservation!
    processRefund(reservationId: ID!, amount: Float, reason: String): RefundResult!
  }
`;
//# sourceMappingURL=typeDefs.js.map