/**
 * XSS Prevention and Input Sanitization Utilities
 * 
 * Comprehensive input sanitization and validation utilities specifically designed
 * for the hotel reservation system to prevent XSS attacks while preserving 
 * legitimate user content.
 */

import { createTrustedHTML } from './trustedTypes';

/**
 * Input validation and sanitization configuration for different content types
 */
export interface SanitizationOptions {
  allowHtml?: boolean;
  allowLinks?: boolean;
  allowImages?: boolean;
  maxLength?: number;
  allowedTags?: string[];
  allowedAttributes?: string[];
  stripScripts?: boolean;
  encodeSpecialChars?: boolean;
}

/**
 * Default sanitization options for different contexts
 */
export const SANITIZATION_PRESETS = {
  // For user names, basic text fields
  STRICT_TEXT: {
    allowHtml: false,
    allowLinks: false,
    allowImages: false,
    maxLength: 100,
    stripScripts: true,
    encodeSpecialChars: true
  } as SanitizationOptions,

  // For descriptions, comments (limited HTML)
  RICH_TEXT: {
    allowHtml: true,
    allowLinks: true,
    allowImages: false,
    maxLength: 1000,
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'span'],
    allowedAttributes: [],
    stripScripts: true,
    encodeSpecialChars: false
  } as SanitizationOptions,

  // For user addresses, contact info
  CONTACT_INFO: {
    allowHtml: false,
    allowLinks: false,
    allowImages: false,
    maxLength: 200,
    stripScripts: true,
    encodeSpecialChars: true
  } as SanitizationOptions,

  // For search queries
  SEARCH_QUERY: {
    allowHtml: false,
    allowLinks: false,
    allowImages: false,
    maxLength: 100,
    stripScripts: true,
    encodeSpecialChars: true
  } as SanitizationOptions,

  // For admin content (more permissive but still safe)
  ADMIN_CONTENT: {
    allowHtml: true,
    allowLinks: true,
    allowImages: true,
    maxLength: 2000,
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img'],
    allowedAttributes: ['href', 'src', 'alt', 'title', 'class'],
    stripScripts: true,
    encodeSpecialChars: false
  } as SanitizationOptions
};

/**
 * Encode HTML special characters to prevent XSS
 */
export function encodeHTMLEntities(input: string): string {
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return String(input).replace(/[&<>"'`=/]/g, (char) => entityMap[char]);
}

/**
 * Decode HTML entities back to regular characters
 */
export function decodeHTMLEntities(input: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = input;
  return textarea.value;
}

/**
 * Remove or escape potentially dangerous characters and patterns
 */
export function sanitizeInput(input: string, options: SanitizationOptions = SANITIZATION_PRESETS.STRICT_TEXT): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Apply length limit
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  // Strip scripts and dangerous content
  if (options.stripScripts) {
    // Remove script tags and their content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove dangerous protocols
    sanitized = sanitized.replace(/javascript\s*:/gi, '');
    sanitized = sanitized.replace(/vbscript\s*:/gi, '');
    sanitized = sanitized.replace(/livescript\s*:/gi, '');
    sanitized = sanitized.replace(/mocha\s*:/gi, '');
    
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*[^>\s]+/gi, '');
    
    // Remove dangerous tags
    const dangerousTags = ['object', 'embed', 'link', 'style', 'meta', 'iframe', 'frame', 'frameset', 'applet', 'base'];
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, 'gis');
      sanitized = sanitized.replace(regex, '');
      const selfClosingRegex = new RegExp(`<${tag}[^>]*\/?>`, 'gis');
      sanitized = sanitized.replace(selfClosingRegex, '');
    });
  }

  // Handle HTML content
  if (!options.allowHtml) {
    // Strip all HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  } else if (options.allowedTags && options.allowedTags.length > 0) {
    // Only allow specific tags
    const allowedTagsRegex = options.allowedTags.join('|');
    const tagRegex = new RegExp(`<(?!\/?(?:${allowedTagsRegex})(?:\\s|>))[^>]+>`, 'gi');
    sanitized = sanitized.replace(tagRegex, '');
  }

  // Handle links
  if (!options.allowLinks) {
    sanitized = sanitized.replace(/<a\b[^>]*>.*?<\/a>/gi, (match) => {
      return match.replace(/<\/?a[^>]*>/gi, '');
    });
  }

  // Handle images
  if (!options.allowImages) {
    sanitized = sanitized.replace(/<img[^>]*>/gi, '');
  }

  // Encode special characters if required
  if (options.encodeSpecialChars) {
    sanitized = encodeHTMLEntities(sanitized);
  }

  return sanitized.trim();
}

/**
 * Validate and sanitize user input for specific hotel system contexts
 */
export const hotelInputSanitizers = {
  /**
   * Sanitize guest name input
   */
  guestName: (input: string): string => {
    let sanitized = sanitizeInput(input, SANITIZATION_PRESETS.STRICT_TEXT);
    
    // Remove numbers and special characters from names (except spaces, hyphens, apostrophes)
    sanitized = sanitized.replace(/[^a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\s'-]/g, '');
    
    // Limit to reasonable name length
    sanitized = sanitized.substring(0, 50);
    
    // Capitalize first letter of each word
    sanitized = sanitized.replace(/\b\w/g, char => char.toUpperCase());
    
    return sanitized.trim();
  },

  /**
   * Sanitize email input
   */
  email: (input: string): string => {
    let sanitized = sanitizeInput(input, SANITIZATION_PRESETS.STRICT_TEXT);
    
    // Basic email format validation and sanitization
    sanitized = sanitized.toLowerCase().trim();
    
    // Remove any characters that aren't valid in email addresses
    sanitized = sanitized.replace(/[^a-z0-9@._+-]/g, '');
    
    return sanitized;
  },

  /**
   * Sanitize phone number input
   */
  phone: (input: string): string => {
    let sanitized = sanitizeInput(input, SANITIZATION_PRESETS.STRICT_TEXT);
    
    // Keep only numbers, spaces, hyphens, parentheses, and plus signs
    sanitized = sanitized.replace(/[^0-9\s\-\(\)\+]/g, '');
    
    return sanitized.trim();
  },

  /**
   * Sanitize address input
   */
  address: (input: string): string => {
    return sanitizeInput(input, SANITIZATION_PRESETS.CONTACT_INFO);
  },

  /**
   * Sanitize reservation notes/comments
   */
  reservationNotes: (input: string): string => {
    return sanitizeInput(input, SANITIZATION_PRESETS.RICH_TEXT);
  },

  /**
   * Sanitize search queries
   */
  searchQuery: (input: string): string => {
    let sanitized = sanitizeInput(input, SANITIZATION_PRESETS.SEARCH_QUERY);
    
    // Remove potential SQL injection patterns (defense in depth)
    const sqlPatterns = [
      /('|\\')|(;|\\;)|(--|\/\*|\*\/)|(\|\|\|)/gi,
      /(union|select|insert|delete|update|drop|create|alter|exec|execute)/gi
    ];
    
    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    return sanitized.trim();
  },

  /**
   * Sanitize room description (admin input)
   */
  roomDescription: (input: string): string => {
    return sanitizeInput(input, SANITIZATION_PRESETS.ADMIN_CONTENT);
  },

  /**
   * Sanitize file names
   */
  fileName: (input: string): string => {
    let sanitized = sanitizeInput(input, SANITIZATION_PRESETS.STRICT_TEXT);
    
    // Remove path traversal attempts
    sanitized = sanitized.replace(/\.\./g, '');
    sanitized = sanitized.replace(/[\/\\]/g, '');
    
    // Keep only safe filename characters
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '');
    
    // Limit filename length
    sanitized = sanitized.substring(0, 100);
    
    return sanitized;
  }
};

/**
 * Comprehensive input validation for form data
 */
export function validateAndSanitizeFormData(formData: Record<string, unknown>): {
  sanitized: Record<string, unknown>;
  errors: string[];
  isValid: boolean;
} {
  const sanitized: Record<string, unknown> = {};
  const errors: string[] = [];

  Object.entries(formData).forEach(([key, value]) => {
    if (typeof value !== 'string') {
      sanitized[key] = value;
      return;
    }

    try {
      switch (key) {
        case 'firstName':
        case 'lastName':
        case 'name':
          sanitized[key] = hotelInputSanitizers.guestName(value);
          if (!sanitized[key]) {
            errors.push(`${key} contains invalid characters`);
          }
          break;
          
        case 'email':
          sanitized[key] = hotelInputSanitizers.email(value);
          // Basic email validation
          if (sanitized[key] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized[key] as string)) {
            errors.push(`${key} has invalid email format`);
          }
          break;
          
        case 'phone':
          sanitized[key] = hotelInputSanitizers.phone(value);
          break;
          
        case 'address':
        case 'street':
        case 'city':
        case 'state':
        case 'country':
          sanitized[key] = hotelInputSanitizers.address(value);
          break;
          
        case 'notes':
        case 'comments':
        case 'specialRequests':
          sanitized[key] = hotelInputSanitizers.reservationNotes(value);
          break;
          
        case 'search':
        case 'query':
          sanitized[key] = hotelInputSanitizers.searchQuery(value);
          break;
          
        case 'description':
          sanitized[key] = hotelInputSanitizers.roomDescription(value);
          break;
          
        default:
          // Default to strict text sanitization
          sanitized[key] = sanitizeInput(value, SANITIZATION_PRESETS.STRICT_TEXT);
      }
    } catch {
      console.error(`Error sanitizing ${key}`);
      errors.push(`Failed to process ${key}`);
      sanitized[key] = '';
    }
  });

  return {
    sanitized,
    errors,
    isValid: errors.length === 0
  };
}

/**
 * Create safe HTML content for display
 */
export function createSafeDisplayHTML(content: string, allowRichText = false): string {
  const options = allowRichText ? SANITIZATION_PRESETS.RICH_TEXT : SANITIZATION_PRESETS.STRICT_TEXT;
  const sanitized = sanitizeInput(content, options);
  
  // Use Trusted Types if available
  const trustedHTML = createTrustedHTML(sanitized);
  return trustedHTML.toString();
}

/**
 * URL sanitization for safe redirects and links
 */
export function sanitizeURL(url: string, allowedDomains?: string[]): string {
  try {
    const urlObj = new URL(url, window.location.origin);
    
    // Check protocol
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(urlObj.protocol)) {
      console.warn('Blocked URL with dangerous protocol:', urlObj.protocol);
      return '';
    }
    
    // Check domain if restrictions apply
    if (allowedDomains && allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );
      
      if (!isAllowed) {
        console.warn('Blocked URL from untrusted domain:', urlObj.hostname);
        return '';
      }
    }
    
    return urlObj.toString();
  } catch {
    console.warn('Invalid URL format:', url);
    return '';
  }
}

/**
 * Content Security Policy violation handler
 */
export function handleCSPViolation(event: SecurityPolicyViolationEvent): void {
  console.warn('CSP Violation detected:', {
    blockedURI: event.blockedURI,
    violatedDirective: event.violatedDirective,
    originalPolicy: event.originalPolicy,
    sourceFile: event.sourceFile,
    lineNumber: event.lineNumber,
    columnNumber: event.columnNumber
  });
  
  // In production, report to security monitoring
  if (process.env.NODE_ENV === 'production') {
    // Report to backend security endpoint
    fetch('/api/security/csp-violations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'csp-violation',
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        timestamp: new Date().toISOString()
      })
    }).catch(() => console.error('Failed to report CSP violation'));
  }
}

/**
 * Initialize XSS prevention measures
 */
export function initializeXSSPrevention(): void {
  // Set up CSP violation reporting
  document.addEventListener('securitypolicyviolation', handleCSPViolation);
  
  // Override dangerous DOM methods in development for debugging
  if (process.env.NODE_ENV === 'development') {
    // Store original innerHTML descriptor
    const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    
    if (originalDescriptor && originalDescriptor.set) {
      Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function(value: string) {
          console.warn('Direct innerHTML usage detected. Consider using secureDOMUtils.setHTMLContent()');
          originalDescriptor.set!.call(this, value);
        },
        get: originalDescriptor.get,
        configurable: true,
        enumerable: true
      });
    }
  }
  
  console.log('✅ XSS prevention measures initialized');
}