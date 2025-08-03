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
      room {
        id
        roomNumber
        type
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
      room {
        id
        roomNumber
        type
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

export const CREATE_ADMIN_RESERVATION = gql`
  mutation CreateAdminReservation($input: CreateReservationInput!) {
    createAdminReservation(input: $input) {
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
      room {
        id
        roomNumber
        type
      }
    }
  }
`;

// Room Management
export const UPDATE_ROOM = gql`
  mutation UpdateRoom($id: ID!, $input: CreateRoomInput!) {
    updateRoom(id: $id, input: $input) {
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

export const CREATE_ROOM = gql`
  mutation CreateRoom($input: CreateRoomInput!) {
    createRoom(input: $input) {
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

export const DELETE_ROOM = gql`
  mutation DeleteRoom($id: ID!) {
    deleteRoom(id: $id)
  }
`;