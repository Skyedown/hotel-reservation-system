import { GraphQLError } from 'graphql';
import { ZodSchema, ZodError } from 'zod';
import { SecurityLoggerService } from '../services/securityLogger';
import {
  sanitizeReservationInput,
  sanitizeRoomTypeInput,
  sanitizeActualRoomInput,
  sanitizeHtml,
  sanitizeEmail,
} from './sanitizer';

/**
 * Validation and sanitization middleware for GraphQL resolvers
 */
export class ValidationMiddleware {
  /**
   * Validate and sanitize input using Zod schema
   */
  static validateInput<T>(schema: ZodSchema<T>, input: any, context?: any): T {
    try {
      // Pre-sanitization for common fields
      const sanitizedInput = this.preSanitizeInput(input);
      
      // Validate with Zod
      const validatedInput = schema.parse(sanitizedInput);
      
      // Log successful validation for audit
      if (context?.req?.ip) {
        SecurityLoggerService.logSuccess({
          event: 'INPUT_VALIDATION_SUCCESS',
          severity: 'LOW',
          ip: context.req.ip,
          userAgent: context.req.headers['user-agent'],
          details: {
            schema: 'validated',
            inputKeys: Object.keys(input || {}),
          },
        });
      }
      
      return validatedInput;
    } catch (error) {
      // Log validation failure
      if (context?.req?.ip) {
        SecurityLoggerService.logValidationFailure({
          event: 'INPUT_VALIDATION_FAILED',
          severity: 'MEDIUM',
          ip: context.req.ip,
          userAgent: context.req.headers['user-agent'],
          details: {
            schema: 'failed',
            inputKeys: Object.keys(input || {}),
            validationErrors: error instanceof ZodError ? error.issues : [error],
          },
        });
      }
      
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
        throw new GraphQLError(`Validation failed: ${errorMessages.join(', ')}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            validationErrors: error.issues,
          },
        });
      }
      
      throw new GraphQLError('Input validation failed', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
  }

  /**
   * Pre-sanitize common input fields before validation
   */
  private static preSanitizeInput(input: any): any {
    if (!input || typeof input !== 'object') {
      return input;
    }

    const sanitized = { ...input };

    // Sanitize common string fields
    if (sanitized.guestFirstName) {
      sanitized.guestFirstName = sanitizeHtml(sanitized.guestFirstName);
    }
    if (sanitized.guestLastName) {
      sanitized.guestLastName = sanitizeHtml(sanitized.guestLastName);
    }
    if (sanitized.guestEmail) {
      sanitized.guestEmail = sanitizeEmail(sanitized.guestEmail);
    }
    if (sanitized.name) {
      sanitized.name = sanitizeHtml(sanitized.name);
    }
    if (sanitized.description) {
      sanitized.description = sanitizeHtml(sanitized.description);
    }
    if (sanitized.specialRequests) {
      sanitized.specialRequests = sanitizeHtml(sanitized.specialRequests);
    }
    if (sanitized.maintenanceNotes) {
      sanitized.maintenanceNotes = sanitizeHtml(sanitized.maintenanceNotes);
    }
    if (sanitized.notes) {
      sanitized.notes = sanitizeHtml(sanitized.notes);
    }

    // Sanitize arrays
    if (Array.isArray(sanitized.amenities)) {
      sanitized.amenities = sanitized.amenities.map((item: any) => 
        typeof item === 'string' ? sanitizeHtml(item) : item
      );
    }

    return sanitized;
  }

  /**
   * Authorization middleware
   */
  static requireAuth(context: any): void {
    if (!context.admin) {
      SecurityLoggerService.logAuthorizationFailure({
        event: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        severity: 'MEDIUM',
        ip: context.req?.ip,
        userAgent: context.req?.headers['user-agent'],
        details: {
          endpoint: 'graphql',
          requiresAuth: true,
        },
      });
      
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
  }

  /**
   * Admin authorization middleware
   */
  static requireAdmin(context: any): void {
    this.requireAuth(context);
    
    if (context.admin.role !== 'ADMIN') {
      SecurityLoggerService.logAuthorizationFailure({
        event: 'INSUFFICIENT_PRIVILEGES',
        severity: 'HIGH',
        ip: context.req?.ip,
        userAgent: context.req?.headers['user-agent'],
        adminId: context.admin.id,
        details: {
          requiredRole: 'ADMIN',
          actualRole: context.admin.role,
          endpoint: 'graphql',
        },
      });
      
      throw new GraphQLError('Admin privileges required', {
        extensions: { code: 'FORBIDDEN' },
      });
    }
  }

  /**
   * Log data access for audit trail
   */
  static logDataAccess(
    context: any,
    operation: string,
    resourceType: string,
    resourceId?: string
  ): void {
    SecurityLoggerService.logDataAccess({
      event: 'DATA_ACCESS',
      severity: 'LOW',
      ip: context.req?.ip,
      userAgent: context.req?.headers['user-agent'],
      adminId: context.admin?.id,
      details: {
        operation,
        resourceType,
        resourceId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log administrative actions
   */
  static logAdminAction(
    context: any,
    action: string,
    resourceType: string,
    resourceId?: string,
    changes?: Record<string, any>
  ): void {
    SecurityLoggerService.logAdminAction({
      event: 'ADMIN_ACTION',
      severity: 'MEDIUM',
      ip: context.req?.ip,
      userAgent: context.req?.headers['user-agent'],
      adminId: context.admin?.id,
      details: {
        action,
        resourceType,
        resourceId,
        changes,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Comprehensive input sanitization based on data type
   */
  static sanitizeInputByType(input: any, type: string): any {
    switch (type) {
      case 'reservation':
        return sanitizeReservationInput(input);
      case 'roomType':
        return sanitizeRoomTypeInput(input);
      case 'actualRoom':
        return sanitizeActualRoomInput(input);
      default:
        return this.preSanitizeInput(input);
    }
  }

  /**
   * Rate limiting check
   */
  static async checkRateLimit(
    rateLimitFn: () => Promise<{ allowed: boolean; retryAfter?: number }>,
    context: any,
    operation: string
  ): Promise<void> {
    const result = await rateLimitFn();
    
    if (!result.allowed) {
      throw new GraphQLError('Rate limit exceeded. Please try again later.', {
        extensions: {
          code: 'RATE_LIMITED',
          retryAfter: result.retryAfter,
        },
      });
    }
  }
}

/**
 * Decorator for resolver validation and sanitization
 */
export function ValidatedResolver<T>(
  schema: ZodSchema<T>,
  options: {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    sanitizationType?: string;
    logAccess?: { operation: string; resourceType: string };
    logAction?: { action: string; resourceType: string };
  } = {}
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (parent: any, args: any, context: any, info: any) {
      try {
        // Authorization checks
        if (options.requireAdmin) {
          ValidationMiddleware.requireAdmin(context);
        } else if (options.requireAuth) {
          ValidationMiddleware.requireAuth(context);
        }

        // Input validation and sanitization
        if (args.input) {
          args.input = ValidationMiddleware.validateInput(schema, args.input, context);
        }

        // Additional sanitization by type
        if (options.sanitizationType && args.input) {
          args.input = ValidationMiddleware.sanitizeInputByType(args.input, options.sanitizationType);
        }

        // Log data access
        if (options.logAccess) {
          ValidationMiddleware.logDataAccess(
            context,
            options.logAccess.operation,
            options.logAccess.resourceType,
            args.id
          );
        }

        // Execute the resolver
        const result = await method.call(this, parent, args, context, info);

        // Log admin actions
        if (options.logAction) {
          ValidationMiddleware.logAdminAction(
            context,
            options.logAction.action,
            options.logAction.resourceType,
            args.id || result?.id,
            args.input
          );
        }

        return result;
      } catch (error) {
        // Log security errors
        SecurityLoggerService.logSecurityError({
          event: 'RESOLVER_ERROR',
          severity: 'MEDIUM',
          ip: context.req?.ip,
          userAgent: context.req?.headers['user-agent'],
          adminId: context.admin?.id,
          details: {
            resolver: propertyName,
            args: JSON.stringify(args, null, 2),
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          error: error instanceof Error ? error : undefined,
        });

        throw error;
      }
    };

    return descriptor;
  };
}