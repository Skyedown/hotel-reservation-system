import winston from 'winston';
import path from 'path';

// Create security-specific logger
const securityLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        ...meta,
      });
    })
  ),
  defaultMeta: { service: 'hotel-system-security' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'security-error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined security events log
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'security.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  securityLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export interface SecurityEvent {
  event: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ip?: string;
  userAgent?: string;
  userId?: string;
  adminId?: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

export class SecurityLoggerService {
  /**
   * Log authentication events
   */
  static logAuthEvent(event: SecurityEvent) {
    securityLogger.info('AUTH_EVENT', {
      category: 'authentication',
      ...event,
    });
  }

  /**
   * Log input validation failures
   */
  static logValidationFailure(event: SecurityEvent) {
    securityLogger.warn('VALIDATION_FAILURE', {
      category: 'input_validation',
      ...event,
    });
  }

  /**
   * Log rate limiting events
   */
  static logRateLimit(event: SecurityEvent) {
    securityLogger.warn('RATE_LIMIT_EXCEEDED', {
      category: 'rate_limiting',
      ...event,
    });
  }

  /**
   * Log suspicious activity
   */
  static logSuspiciousActivity(event: SecurityEvent) {
    securityLogger.error('SUSPICIOUS_ACTIVITY', {
      category: 'security_threat',
      ...event,
    });
  }

  /**
   * Log authorization failures
   */
  static logAuthorizationFailure(event: SecurityEvent) {
    securityLogger.warn('AUTHORIZATION_FAILURE', {
      category: 'authorization',
      ...event,
    });
  }

  /**
   * Log data access events
   */
  static logDataAccess(event: SecurityEvent) {
    securityLogger.info('DATA_ACCESS', {
      category: 'data_access',
      ...event,
    });
  }

  /**
   * Log administrative actions
   */
  static logAdminAction(event: SecurityEvent) {
    securityLogger.info('ADMIN_ACTION', {
      category: 'administration',
      ...event,
    });
  }

  /**
   * Log security errors
   */
  static logSecurityError(event: SecurityEvent & { error?: Error }) {
    securityLogger.error('SECURITY_ERROR', {
      category: 'security_error',
      stack: event.error?.stack,
      ...event,
    });
  }

  /**
   * Log successful operations for audit trail
   */
  static logSuccess(event: SecurityEvent) {
    securityLogger.info('OPERATION_SUCCESS', {
      category: 'audit',
      ...event,
    });
  }

  /**
   * Log Content Security Policy violations
   */
  static logCSPViolation(event: SecurityEvent) {
    securityLogger.warn('CSP_VIOLATION', {
      category: 'content_security',
      ...event,
    });
  }

  /**
   * Log Trusted Types violations
   */
  static logTrustedTypesViolation(event: SecurityEvent) {
    securityLogger.error('TRUSTED_TYPES_VIOLATION', {
      category: 'trusted_types',
      ...event,
    });
  }

  /**
   * Log XSS prevention events
   */
  static logXSSPrevention(event: SecurityEvent) {
    securityLogger.warn('XSS_PREVENTION', {
      category: 'xss_prevention',
      ...event,
    });
  }

  /**
   * Log DOM manipulation security events
   */
  static logDOMSecurity(event: SecurityEvent) {
    securityLogger.info('DOM_SECURITY', {
      category: 'dom_security',
      ...event,
    });
  }

  /**
   * Create structured security event
   */
  static createEvent(
    event: string,
    severity: SecurityEvent['severity'],
    details: Record<string, any> = {},
    request?: { ip: string; headers: Record<string, string> }
  ): SecurityEvent {
    return {
      event,
      severity,
      ip: request?.ip,
      userAgent: request?.headers['user-agent'],
      details,
      metadata: {
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
      },
    };
  }
}

// Ensure logs directory exists
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}