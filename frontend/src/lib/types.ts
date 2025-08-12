// Enums
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type AdminRole = 'STAFF' | 'ADMIN';

// Core Types
export interface RoomType {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  rooms?: ActualRoom[];
}

export interface ActualRoom {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  isAvailable: boolean;
  isUnderMaintenance: boolean;
  maintenanceNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  roomType?: RoomType;
}

export interface Reservation {
  id: string;
  roomTypeId: string;
  actualRoomId?: string;
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
  roomType?: RoomType;
  actualRoom?: ActualRoom;
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
  phoneNumber?: string;
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

export interface RoomTypeFormData {
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
  isActive: boolean;
}

export interface ActualRoomFormData {
  roomNumber: string;
  roomTypeId: string;
  isAvailable: boolean;
  isUnderMaintenance: boolean;
  maintenanceNotes?: string;
}

// Input Types for GraphQL
export interface CreateReservationInput {
  roomTypeId: string;
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
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface CreateRoomTypeInput {
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
  isActive?: boolean;
}

export interface CreateActualRoomInput {
  roomNumber: string;
  roomTypeId: string;
  isAvailable?: boolean;
  isUnderMaintenance?: boolean;
  maintenanceNotes?: string;
}

export interface UpdateActualRoomInput {
  roomNumber?: string;
  isAvailable?: boolean;
  isUnderMaintenance?: boolean;
  maintenanceNotes?: string;
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
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomCount: number;
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
  roomTypes: RoomType[];
  error?: string;
}

export interface ReservationState {
  isLoading: boolean;
  reservation?: Reservation;
  error?: string;
}