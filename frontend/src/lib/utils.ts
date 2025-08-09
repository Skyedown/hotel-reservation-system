import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays, addDays, isBefore, isAfter } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export function formatDate(date: Date | string): string {
  if (!date) return 'Invalid date';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  return format(dateObj, 'MMM dd, yyyy');
}

export function formatDateTime(date: Date | string): string {
  if (!date) return 'Invalid date';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  return format(dateObj, 'MMM dd, yyyy HH:mm');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function calculateNights(checkIn: Date | string, checkOut: Date | string): number {
  const checkInDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const checkOutDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
  return differenceInDays(checkOutDate, checkInDate);
}

export function calculateTotal(pricePerNight: number, nights: number): number {
  return pricePerNight * nights;
}

// Date validation
export function isValidDateRange(checkIn: Date, checkOut: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return (
    !isBefore(checkIn, today) && // Check-in not in the past
    isAfter(checkOut, checkIn) && // Check-out after check-in
    differenceInDays(checkOut, checkIn) >= 1 // At least 1 night
  );
}

export function getMinCheckInDate(): Date {
  const today = new Date();
  return today;
}

export function getMinCheckOutDate(checkIn: Date): Date {
  return addDays(checkIn, 1);
}

// Convert Date to local date string without timezone issues
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get today's date as local date string
export function getTodayLocalDateString(): string {
  return toLocalDateString(new Date());
}

// Get tomorrow's date as local date string
export function getTomorrowLocalDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toLocalDateString(tomorrow);
}

// Room utilities
export function getRoomTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    STANDARD: 'Štandardná izba',
    DELUXE: 'Deluxe izba',
    SUITE: 'Apartmán',
    PRESIDENTIAL: 'Prezidentský apartmán',
  };
  return labels[type] || type;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'text-warning-600 bg-warning-50 border-warning-200',
    CONFIRMED: 'text-success-600 bg-success-50 border-success-200',
    CHECKED_IN: 'text-info-600 bg-info-50 border-info-200',
    CHECKED_OUT: 'text-secondary-600 bg-secondary-50 border-secondary-200',
    CANCELLED: 'text-error-600 bg-error-50 border-error-200',
  };
  return colors[status] || 'text-secondary-600 bg-secondary-50 border-secondary-200';
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'text-warning-600 bg-warning-50',
    PROCESSING: 'text-info-600 bg-info-50',
    COMPLETED: 'text-success-600 bg-success-50',
    FAILED: 'text-error-600 bg-error-50',
    REFUNDED: 'text-primary-600 bg-primary-50',
  };
  return colors[status] || 'text-secondary-600 bg-secondary-50';
}

// Form validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Error handling
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    if ('graphQLErrors' in error && Array.isArray(error.graphQLErrors) && error.graphQLErrors.length > 0) {
      return error.graphQLErrors[0].message;
    }
    if ('networkError' in error) {
      return 'Chyba siete. Prosím skontrolujte vaše pripojenie.';
    }
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }
  return 'Nastala neočakávaná chyba.';
}

// Storage utilities
export function setAdminToken(token: string): void {
  if (typeof window !== 'undefined') {
    // Store token with timestamp for expiration check
    const tokenData = {
      token,
      timestamp: Date.now(),
      expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    };
    localStorage.setItem('admin-token', JSON.stringify(tokenData));
  }
}

export function getAdminToken(): string | null {
  if (typeof window !== 'undefined') {
    const tokenDataStr = localStorage.getItem('admin-token');
    if (!tokenDataStr) return null;

    try {
      const tokenData = JSON.parse(tokenDataStr);
      
      // Check if token is expired
      if (Date.now() > tokenData.timestamp + tokenData.expiresIn) {
        removeAdminToken();
        return null;
      }
      
      return tokenData.token;
    } catch {
      // Invalid token data, remove it
      removeAdminToken();
      return null;
    }
  }
  return null;
}

export function removeAdminToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-info');
  }
}

export function isAdminTokenValid(): boolean {
  return getAdminToken() !== null;
}

// Input sanitization utilities
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>\"'&]/g, (char) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[char] || char;
    })
    .slice(0, 1000); // Limit length
}

export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '')
    .slice(0, 254); // RFC standard email length
}

export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  
  return phone
    .replace(/[^0-9+\-\s()]/g, '')
    .trim()
    .slice(0, 20);
}

export function sanitizeNumber(input: string | number, min?: number, max?: number): number {
  let num: number;
  
  if (typeof input === 'string') {
    // Remove non-numeric characters except decimal point and minus
    const cleaned = input.replace(/[^0-9.-]/g, '');
    num = parseFloat(cleaned);
  } else {
    num = input;
  }
  
  if (isNaN(num)) return 0;
  
  if (min !== undefined && num < min) return min;
  if (max !== undefined && num > max) return max;
  
  return num;
}

export function sanitizeTextarea(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, (char) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;'
      };
      return escapeMap[char] || char;
    })
    .slice(0, 5000); // Limit length for textarea
}

// URL utilities
export function generateReservationUrl(accessToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/reservation/${accessToken}`;
}