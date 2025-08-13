import validator from 'validator';

/**
 * Sanitize HTML content and prevent XSS attacks
 * Strips all HTML tags and keeps only text content
 * Server-side implementation without DOM dependencies
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags using comprehensive regex patterns
  let sanitized = input
    // Remove script tags and their content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove style tags and their content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove all other HTML tags but keep content
    .replace(/<[^>]*>/g, '')
    // Remove HTML entities and decode common ones
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#x60;/g, '`');
  
  // Escape potentially dangerous characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;');
  
  // Remove any remaining dangerous patterns
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  return sanitized.trim();
}

/**
 * Sanitize and validate email address
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  
  const normalizedEmail = validator.normalizeEmail(email, {
    gmail_lowercase: true,
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_lowercase: true,
    outlookdotcom_remove_subaddress: false,
    yahoo_lowercase: true,
    yahoo_remove_subaddress: false,
    icloud_lowercase: true,
    icloud_remove_subaddress: false,
  });
  
  return normalizedEmail || '';
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  
  // Remove all non-digit, non-plus, non-space, non-dash, non-parentheses characters
  return phone
    .replace(/[^0-9+\-\s()]/g, '')
    .trim()
    .slice(0, 20);
}

/**
 * Sanitize text input with length limits
 */
export function sanitizeText(input: string, maxLength = 1000): string {
  if (!input || typeof input !== 'string') return '';
  
  return sanitizeHtml(input).slice(0, maxLength);
}

/**
 * Sanitize long text (for descriptions, notes, etc.)
 */
export function sanitizeLongText(input: string, maxLength = 5000): string {
  if (!input || typeof input !== 'string') return '';
  
  return sanitizeHtml(input).slice(0, maxLength);
}

/**
 * Sanitize and validate URL
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  // Basic URL validation and sanitization
  const trimmed = url.trim();
  
  // Check if it's a valid URL format
  if (!validator.isURL(trimmed, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
    allow_underscores: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false,
  })) {
    return '';
  }
  
  return trimmed.slice(0, 2083); // Maximum URL length
}

/**
 * Sanitize room number
 */
export function sanitizeRoomNumber(roomNumber: string): string {
  if (!roomNumber || typeof roomNumber !== 'string') return '';
  
  return roomNumber
    .replace(/[^0-9A-Za-z\-]/g, '')
    .trim()
    .slice(0, 10);
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: number | string, min?: number, max?: number): number {
  let num: number;
  
  if (typeof input === 'string') {
    // Remove non-numeric characters except decimal point and minus
    const cleaned = input.replace(/[^0-9.-]/g, '');
    num = parseFloat(cleaned);
  } else {
    num = input;
  }
  
  if (isNaN(num) || !isFinite(num)) return 0;
  
  if (min !== undefined && num < min) return min;
  if (max !== undefined && num > max) return max;
  
  return num;
}

/**
 * Sanitize array of strings
 */
export function sanitizeStringArray(arr: string[], maxItems = 20, maxLength = 100): string[] {
  if (!Array.isArray(arr)) return [];
  
  return arr
    .slice(0, maxItems)
    .map(item => sanitizeText(item, maxLength))
    .filter(item => item.length > 0);
}

/**
 * Comprehensive input sanitization for reservation data
 */
export function sanitizeReservationInput(input: any) {
  return {
    guestFirstName: sanitizeText(input.guestFirstName, 50),
    guestLastName: sanitizeText(input.guestLastName, 50),
    guestEmail: sanitizeEmail(input.guestEmail),
    guestPhone: sanitizePhone(input.guestPhone || ''),
    specialRequests: sanitizeLongText(input.specialRequests || '', 5000),
    roomTypeId: input.roomTypeId, // UUID validated by Zod
    checkIn: input.checkIn, // DateTime validated by Zod
    checkOut: input.checkOut, // DateTime validated by Zod
    guests: sanitizeNumber(input.guests, 1, 10),
  };
}

/**
 * Comprehensive input sanitization for room type data
 */
export function sanitizeRoomTypeInput(input: any) {
  return {
    name: sanitizeText(input.name, 100),
    description: sanitizeLongText(input.description, 1000),
    price: sanitizeNumber(input.price, 0, 10000),
    capacity: Math.floor(sanitizeNumber(input.capacity, 1, 10)),
    amenities: sanitizeStringArray(input.amenities || [], 20, 100),
    images: (input.images || [])
      .slice(0, 10)
      .map((url: string) => sanitizeUrl(url))
      .filter((url: string) => url.length > 0),
    isActive: Boolean(input.isActive),
  };
}

/**
 * Comprehensive input sanitization for actual room data
 */
export function sanitizeActualRoomInput(input: any) {
  return {
    roomNumber: sanitizeRoomNumber(input.roomNumber),
    roomTypeId: input.roomTypeId, // UUID validated by Zod
    isAvailable: Boolean(input.isAvailable),
    isUnderMaintenance: Boolean(input.isUnderMaintenance),
    maintenanceNotes: sanitizeLongText(input.maintenanceNotes || '', 5000),
  };
}