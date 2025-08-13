import { z } from 'zod';

// Base validation schemas
export const emailSchema = z.string().email('Invalid email format').max(254, 'Email too long');

export const phoneSchema = z
  .string()
  .regex(/^[\+]?[1-9][\d\s\-\(\)]{0,19}$/, 'Invalid phone number format')
  .max(20, 'Phone number too long')
  .optional();

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name too long')
  .regex(/^[a-zA-ZàáâäčďéěíňóôöšťúůüýžÀÁÂÄČĎÉĚÍŇÓÔÖŠŤÚŮÜÝŽ\s'-]+$/, 'Name contains invalid characters');

export const textSchema = z
  .string()
  .max(1000, 'Text too long')
  .refine((val) => val.trim().length > 0, 'Text cannot be empty');

export const longTextSchema = z
  .string()
  .max(5000, 'Text too long')
  .optional();

export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .max(2083, 'URL too long');

export const priceSchema = z
  .number()
  .min(0, 'Price must be positive')
  .max(10000, 'Price too high')
  .refine((val) => Number.isFinite(val), 'Price must be a valid number');

export const capacitySchema = z
  .number()
  .int('Capacity must be an integer')
  .min(1, 'Capacity must be at least 1')
  .max(10, 'Capacity cannot exceed 10');

export const guestCountSchema = z
  .number()
  .int('Guest count must be an integer')
  .min(1, 'At least 1 guest required')
  .max(10, 'Cannot exceed 10 guests');

// Admin Authentication Schema
export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters').max(255, 'Password too long'),
});

// Reservation Schemas
export const createReservationSchema = z.object({
  roomTypeId: z.string().uuid('Invalid room type ID'),
  guestEmail: emailSchema,
  guestFirstName: nameSchema,
  guestLastName: nameSchema,
  guestPhone: phoneSchema,
  checkIn: z.string().datetime('Invalid check-in date'),
  checkOut: z.string().datetime('Invalid check-out date'),
  guests: guestCountSchema,
  specialRequests: longTextSchema,
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkOut > checkIn;
}, {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
});

export const updateReservationStatusSchema = z.object({
  id: z.string().uuid('Invalid reservation ID'),
  status: z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED']),
  notes: longTextSchema,
});

// Room Type Schemas
export const createRoomTypeSchema = z.object({
  name: textSchema,
  description: textSchema,
  price: priceSchema,
  capacity: capacitySchema,
  amenities: z.array(z.string().max(100, 'Amenity name too long')).max(20, 'Too many amenities'),
  images: z.array(urlSchema).max(10, 'Too many images'),
  isActive: z.boolean().default(true),
});

export const updateRoomTypeSchema = createRoomTypeSchema.partial().extend({
  id: z.string().uuid('Invalid room type ID'),
});

// Actual Room Schemas
export const createActualRoomSchema = z.object({
  roomNumber: z
    .string()
    .min(1, 'Room number is required')
    .max(10, 'Room number too long')
    .regex(/^[0-9A-Za-z\-]+$/, 'Room number contains invalid characters'),
  roomTypeId: z.string().uuid('Invalid room type ID'),
  isAvailable: z.boolean().default(true),
  isUnderMaintenance: z.boolean().default(false),
  maintenanceNotes: longTextSchema,
});

export const updateActualRoomSchema = createActualRoomSchema.partial().extend({
  id: z.string().uuid('Invalid room ID'),
});

// Room Assignment Schema
export const assignRoomSchema = z.object({
  reservationId: z.string().uuid('Invalid reservation ID'),
  actualRoomId: z.string().uuid('Invalid room ID'),
});

// Multi-room Reservation Schema
export const createMultiRoomReservationSchema = z.object({
  guestEmail: emailSchema,
  guestFirstName: nameSchema,
  guestLastName: nameSchema,
  guestPhone: phoneSchema,
  specialRequests: longTextSchema,
  rooms: z.array(z.object({
    roomTypeId: z.string().uuid('Invalid room type ID'),
    checkIn: z.string().datetime('Invalid check-in date'),
    checkOut: z.string().datetime('Invalid check-out date'),
    guests: guestCountSchema,
  })).min(1, 'At least one room is required').max(10, 'Cannot book more than 10 rooms'),
}).refine((data) => {
  // Validate all rooms have valid date ranges
  return data.rooms.every(room => {
    const checkIn = new Date(room.checkIn);
    const checkOut = new Date(room.checkOut);
    return checkOut > checkIn && checkIn >= new Date();
  });
}, {
  message: 'All rooms must have valid date ranges',
  path: ['rooms'],
});

// Search Schema
export const searchRoomsSchema = z.object({
  checkIn: z.string().datetime('Invalid check-in date'),
  checkOut: z.string().datetime('Invalid check-out date'),
  guests: guestCountSchema.optional().default(2),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return checkIn >= today && checkOut > checkIn;
}, {
  message: 'Check-in must be today or later, and check-out must be after check-in',
  path: ['checkIn'],
});

// Environment validation schema
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().min(1).max(65535)).default(4000),
  DATABASE_URL: z.string().url('Invalid database URL'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Invalid Stripe secret key format'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Invalid Stripe webhook secret format'),
  SENDGRID_API_KEY: z.string().startsWith('SG.', 'Invalid SendGrid API key format'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).pipe(z.number().int().min(1).max(65535)).default(6379),
  REDIS_PASSWORD: z.string().optional(),
});

// Type exports for use in resolvers
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationStatusInput = z.infer<typeof updateReservationStatusSchema>;
export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;
export type CreateActualRoomInput = z.infer<typeof createActualRoomSchema>;
export type UpdateActualRoomInput = z.infer<typeof updateActualRoomSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type SearchRoomsInput = z.infer<typeof searchRoomsSchema>;
export type CreateMultiRoomReservationInput = z.infer<typeof createMultiRoomReservationSchema>;