import { gql } from '@apollo/client';

// Room Queries
export const GET_AVAILABLE_ROOMS = gql`
  query GetAvailableRooms($checkIn: String!, $checkOut: String!, $guests: Int!) {
    availableRooms(checkIn: $checkIn, checkOut: $checkOut, guests: $guests) {
      id
      roomNumber
      type
      description
      price
      capacity
      amenities
      images
      isAvailable
    }
  }
`;

export const GET_ROOM_DETAILS = gql`
  query GetRoomDetails($id: ID!) {
    room(id: $id) {
      id
      roomNumber
      type
      description
      price
      capacity
      amenities
      images
      isAvailable
    }
  }
`;

export const GET_ALL_ROOMS = gql`
  query GetAllRooms {
    rooms {
      id
      roomNumber
      type
      description
      price
      capacity
      amenities
      images
      isAvailable
      createdAt
      updatedAt
    }
  }
`;

// Reservation Queries
export const GET_RESERVATION_BY_TOKEN = gql`
  query GetReservationByToken($accessToken: String!) {
    reservationByToken(accessToken: $accessToken) {
      id
      guestEmail
      guestFirstName
      guestLastName
      guestPhone
      checkIn
      checkOut
      guests
      totalPrice
      status
      paymentStatus
      specialRequests
      accessToken
      room {
        id
        roomNumber
        type
        description
        price
        amenities
        images
      }
    }
  }
`;

// Admin Queries
export const GET_ALL_RESERVATIONS = gql`
  query GetAllReservations {
    allReservations {
      id
      guestEmail
      guestFirstName
      guestLastName
      guestPhone
      checkIn
      checkOut
      guests
      totalPrice
      status
      paymentStatus
      paymentIntentId
      specialRequests
      notes
      lastStatusChange
      createdAt
      updatedAt
      accessToken
      room {
        id
        roomNumber
        type
        price
        capacity
      }
      payments {
        id
        amount
        status
        createdAt
      }
    }
  }
`;

export const GET_RESERVATION_BY_ID = gql`
  query GetReservationById($id: ID!) {
    reservationById(id: $id) {
      id
      guestEmail
      guestFirstName
      guestLastName
      guestPhone
      checkIn
      checkOut
      guests
      totalPrice
      status
      paymentStatus
      paymentIntentId
      specialRequests
      notes
      lastStatusChange
      createdAt
      updatedAt
      accessToken
      room {
        id
        roomNumber
        type
        price
        capacity
        description
      }
      payments {
        id
        amount
        currency
        status
        createdAt
        failureReason
      }
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalReservations
      pendingReservations
      confirmedReservations
      totalRevenue
      occupancyRate
    }
  }
`;

// Authentication
export const VERIFY_ADMIN_TOKEN = gql`
  query VerifyAdminToken {
    me {
      id
      email
      firstName
      lastName
      role
    }
  }
`;