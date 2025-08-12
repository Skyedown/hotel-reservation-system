import { gql } from '@apollo/client';

// Room Type Queries
export const GET_AVAILABLE_ROOM_TYPES = gql`
  query GetAvailableRoomTypes($checkIn: String!, $checkOut: String!, $guests: Int!) {
    availableRoomTypes(checkIn: $checkIn, checkOut: $checkOut, guests: $guests) {
      id
      name
      description
      price
      capacity
      amenities
      images
      isActive
      rooms {
        id
        roomNumber
        isAvailable
        isUnderMaintenance
      }
    }
  }
`;

export const GET_ROOM_TYPE_DETAILS = gql`
  query GetRoomTypeDetails($id: ID!) {
    roomType(id: $id) {
      id
      name
      description
      price
      capacity
      amenities
      images
      isActive
      rooms {
        id
        roomNumber
        isAvailable
        isUnderMaintenance
      }
    }
  }
`;

export const GET_ALL_ROOM_TYPES = gql`
  query GetAllRoomTypes {
    roomTypes {
      id
      name
      description
      price
      capacity
      amenities
      images
      isActive
      createdAt
      updatedAt
      rooms {
        id
        roomNumber
        isAvailable
        isUnderMaintenance
      }
    }
  }
`;

export const GET_ALL_ACTUAL_ROOMS = gql`
  query GetAllActualRooms {
    actualRooms {
      id
      roomNumber
      roomTypeId
      isAvailable
      isUnderMaintenance
      maintenanceNotes
      createdAt
      updatedAt
      roomType {
        id
        name
        description
        price
        capacity
      }
    }
  }
`;

export const GET_ACTUAL_ROOMS_BY_TYPE = gql`
  query GetActualRoomsByType($roomTypeId: ID!) {
    actualRoomsByType(roomTypeId: $roomTypeId) {
      id
      roomNumber
      isAvailable
      isUnderMaintenance
      maintenanceNotes
      createdAt
      updatedAt
    }
  }
`;

export const GET_AVAILABLE_ACTUAL_ROOMS = gql`
  query GetAvailableActualRooms($roomTypeId: ID!, $checkIn: String!, $checkOut: String!, $excludeReservationIds: [ID!]) {
    availableActualRooms(roomTypeId: $roomTypeId, checkIn: $checkIn, checkOut: $checkOut, excludeReservationIds: $excludeReservationIds) {
      id
      roomNumber
      isAvailable
      isUnderMaintenance
      maintenanceNotes
    }
  }
`;

// Reservation Queries
export const GET_RESERVATION_BY_TOKEN = gql`
  query GetReservationByToken($accessToken: String!) {
    reservation(accessToken: $accessToken) {
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
      roomType {
        id
        name
        description
        price
        amenities
        images
      }
      actualRoom {
        id
        roomNumber
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
      roomType {
        id
        name
        price
        capacity
        rooms {
          id
          roomNumber
          isAvailable
          isUnderMaintenance
          maintenanceNotes
        }
      }
      actualRoom {
        id
        roomNumber
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
      roomType {
        id
        name
        price
        capacity
        description
        rooms {
          id
          roomNumber
          isAvailable
          isUnderMaintenance
          maintenanceNotes
        }
      }
      actualRoom {
        id
        roomNumber
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