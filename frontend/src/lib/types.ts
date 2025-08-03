// Enums
export type RoomType = 'STANDARD' | 'DELUXE' | 'SUITE' | 'PRESIDENTIAL';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type AdminRole = 'STAFF' | 'ADMIN';

// Core Types
export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reservation {
  id: string;
  roomId: string;
  guestEmail: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  specialRequests?: string;
  accessToken: string;
  notes?: string;
  lastStatusChange?: string;
  createdAt?: string;
  updatedAt?: string;
  room?: Room;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  currency: string;
  stripePaymentIntentId: string;
  status: PaymentStatus;
  webhookEventId?: string;
  failureReason?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  createdAt?: string;
  updatedAt?: string;
}

// Form Types
export interface SearchFormData {
  checkIn: Date;
  checkOut: Date;
  guests: number;
}

export interface ReservationFormData {
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone?: string;
  specialRequests?: string;
}

export interface AdminLoginFormData {
  email: string;
  password: string;
}

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface RoomFormData {
  roomNumber: string;
  type: RoomType;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
}

// Input Types for GraphQL
export interface CreateReservationInput {
  roomId: string;
  guestEmail: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
}

export interface CreateMultiRoomReservationInput {
  guestEmail: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone?: string;
  specialRequests?: string;
  rooms: RoomReservationInput[];
}

export interface RoomReservationInput {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}


export interface UpdateRoomInput {
  roomNumber?: string;
  type?: RoomType;
  description?: string;
  price?: number;
  capacity?: number;
  amenities?: string[];
  images?: string[];
  isAvailable?: boolean;
}

export interface CreateRoomInput {
  roomNumber: string;
  type: RoomType;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
}

// Response Types
export interface AdminLoginResponse {
  token: string;
  admin: Admin;
}

export interface DashboardStats {
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  totalRevenue: number;
  occupancyRate: number;
}

// Cart Types for Multiple Room Selection
export interface CartItem {
  room: Room;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
  totalGuests: number;
}

// UI State Types
export interface SearchState {
  isLoading: boolean;
  rooms: Room[];
  error?: string;
}

export interface ReservationState {
  isLoading: boolean;
  reservation?: Reservation;
  error?: string;
}