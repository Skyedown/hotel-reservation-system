import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { SecurityLoggerService } from './securityLogger';

// Log that we're using default memory store
console.log('🔄 Using default in-memory rate limiting store');

// General API rate limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(15 * 60 * 1000 / 1000), // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Using default memory store
});

// GraphQL-specific rate limiting (more restrictive)
export const graphqlRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 GraphQL requests per 5 minutes
  message: {
    error: 'Too many GraphQL requests, please slow down.',
    retryAfter: Math.ceil(5 * 60 * 1000 / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Using default memory store
});

// Authentication rate limiting (very restrictive)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: Math.ceil(15 * 60 * 1000 / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful auth attempts
  // Using default memory store
});

// Slow down middleware for additional protection
export const slowDownMiddleware = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 20, // Allow 20 requests per 15 minutes at full speed
  delayMs: () => 500, // Add 500ms delay per request after delayAfter (v2 syntax)
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  // Using default memory store
});

// Simple in-memory rate limiting for function-based operations
const functionRateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Function-based rate limiting for specific operations
export class FunctionRateLimit {
  private static async checkRateLimit(
    key: string,
    windowMs: number,
    maxAttempts: number
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    let entry = functionRateLimitStore.get(key);
    
    // Clean up expired entries
    if (entry && entry.resetTime <= now) {
      functionRateLimitStore.delete(key);
      entry = undefined;
    }
    
    if (!entry) {
      entry = { count: 1, resetTime };
      functionRateLimitStore.set(key, entry);
      return { allowed: true };
    }
    
    entry.count++;
    
    if (entry.count > maxAttempts) {
      return {
        allowed: false,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      };
    }
    
    return { allowed: true };
  }

  /**
   * Rate limit admin login attempts per email
   */
  static async checkAdminLogin(email: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const result = await this.checkRateLimit(`admin_login:${email}`, 15 * 60 * 1000, 3);
    
    if (!result.allowed) {
      SecurityLoggerService.logSuspiciousActivity({
        event: 'EXCESSIVE_ADMIN_LOGIN_ATTEMPTS',
        severity: 'CRITICAL',
        details: {
          email,
          attempts: 'exceeded',
          timeWindow: '15 minutes',
          limit: 3,
        },
      });
    }
    
    return result;
  }

  /**
   * Rate limit room search operations per IP
   */
  static async checkRoomSearch(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    return this.checkRateLimit(`room_search:${ip}`, 5 * 60 * 1000, 30);
  }

  /**
   * Rate limit reservation creation per IP
   */
  static async checkReservationCreation(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const result = await this.checkRateLimit(`reservation:${ip}`, 30 * 60 * 1000, 3);
    
    if (!result.allowed) {
      SecurityLoggerService.logSuspiciousActivity({
        event: 'EXCESSIVE_RESERVATION_ATTEMPTS',
        severity: 'HIGH',
        details: {
          ip,
          attempts: 'exceeded',
          timeWindow: '30 minutes',
          limit: 3,
        },
      });
    }
    
    return result;
  }

  /**
   * Rate limit sensitive admin operations
   */
  static async checkAdminOperation(adminId: string, operation: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const result = await this.checkRateLimit(`admin_op:${adminId}:${operation}`, 10 * 60 * 1000, 20);
    
    if (!result.allowed) {
      SecurityLoggerService.logSuspiciousActivity({
        event: 'EXCESSIVE_ADMIN_OPERATIONS',
        severity: 'HIGH',
        details: {
          adminId,
          operation,
          attempts: 'exceeded',
          timeWindow: '10 minutes',
          limit: 20,
        },
      });
    }
    
    return result;
  }
}