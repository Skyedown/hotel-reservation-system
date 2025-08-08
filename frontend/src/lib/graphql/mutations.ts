import { gql } from '@apollo/client';

// Reservation Mutations
export const CREATE_RESERVATION = gql`
  mutation CreateReservation($input: CreateReservationInput!) {
    createReservation(input: $input) {
      id
      accessToken
      guestEmail
      guestFirstName
      guestLastName
      checkIn
      checkOut
      guests
      totalPrice
      status
      roomType {
        id
        name
      }
      actualRoom {
        id
        roomNumber
      }
    }
  }
`;

export const CREATE_MULTI_ROOM_RESERVATION = gql`
  mutation CreateMultiRoomReservation($input: CreateMultiRoomReservationInput!) {
    createMultiRoomReservation(input: $input) {
      id
      accessToken
      guestEmail
      guestFirstName
      guestLastName
      checkIn
      checkOut
      guests
      totalPrice
      status
      paymentIntentId
      roomType {
        id
        name
      }
      actualRoom {
        id
        roomNumber
      }
    }
  }
`;

export const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntent($accessToken: String!) {
    createPaymentIntent(accessToken: $accessToken)
  }
`;


export const CANCEL_RESERVATION = gql`
  mutation CancelReservation($accessToken: String!) {
    cancelReservation(accessToken: $accessToken) {
      id
      status
    }
  }
`;

// Admin Mutations
export const ADMIN_LOGIN = gql`
  mutation AdminLogin($input: AdminLoginInput!) {
    adminLogin(input: $input) {
      token
      admin {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

export const UPDATE_RESERVATION_STATUS = gql`
  mutation UpdateReservationStatus($id: ID!, $status: ReservationStatus!) {
    updateReservationStatus(id: $id, status: $status) {
      id
      status
      lastStatusChange
    }
  }
`;

// Room Type Management
export const CREATE_ROOM_TYPE = gql`
  mutation CreateRoomType($input: CreateRoomTypeInput!) {
    createRoomType(input: $input) {
      id
      name
      description
      price
      capacity
      amenities
      images
      isActive
    }
  }
`;

export const UPDATE_ROOM_TYPE = gql`
  mutation UpdateRoomType($id: ID!, $input: CreateRoomTypeInput!) {
    updateRoomType(id: $id, input: $input) {
      id
      name
      description
      price
      capacity
      amenities
      images
      isActive
    }
  }
`;

export const DELETE_ROOM_TYPE = gql`
  mutation DeleteRoomType($id: ID!) {
    deleteRoomType(id: $id)
  }
`;

// Actual Room Management
export const CREATE_ACTUAL_ROOM = gql`
  mutation CreateActualRoom($input: CreateActualRoomInput!) {
    createActualRoom(input: $input) {
      id
      roomNumber
      isAvailable
      isUnderMaintenance
      maintenanceNotes
      roomType {
        id
        name
      }
    }
  }
`;

export const UPDATE_ACTUAL_ROOM = gql`
  mutation UpdateActualRoom($id: ID!, $input: UpdateActualRoomInput!) {
    updateActualRoom(id: $id, input: $input) {
      id
      roomNumber
      isAvailable
      isUnderMaintenance
      maintenanceNotes
    }
  }
`;

export const DELETE_ACTUAL_ROOM = gql`
  mutation DeleteActualRoom($id: ID!) {
    deleteActualRoom(id: $id)
  }
`;

// Reservation Assignment
export const ASSIGN_ROOM_TO_RESERVATION = gql`
  mutation AssignRoomToReservation($reservationId: ID!, $actualRoomId: ID!) {
    assignRoomToReservation(reservationId: $reservationId, actualRoomId: $actualRoomId) {
      id
      roomType {
        id
        name
      }
      actualRoom {
        id
        roomNumber
      }
    }
  }
`;