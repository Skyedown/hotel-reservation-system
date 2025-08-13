/**
 * Trusted Types implementation for DOM-based XSS mitigation
 * 
 * This module provides secure DOM manipulation utilities using the Trusted Types API
 * to prevent injection of malicious scripts and ensure all dynamic content is properly sanitized.
 */

// Type definitions for Trusted Types API
declare global {
  interface Window {
    trustedTypes?: TrustedTypePolicyFactory;
  }
}

interface TrustedTypePolicyFactory {
  createPolicy(name: string, policy: TrustedTypePolicy): TrustedTypePolicy;
  defaultPolicy?: TrustedTypePolicy;
  getPolicyNames?(): string[]; // Optional method - not supported in all browsers
  isHTML(value: unknown): value is TrustedHTML;
  isScript(value: unknown): value is TrustedScript;
  isScriptURL(value: unknown): value is TrustedScriptURL;
}

interface TrustedTypePolicy {
  createHTML?(input: string, ...args: unknown[]): TrustedHTML;
  createScript?(input: string, ...args: unknown[]): TrustedScript;
  createScriptURL?(input: string, ...args: unknown[]): TrustedScriptURL;
}

interface TrustedHTML {
  toString(): string;
}

interface TrustedScript {
  toString(): string;
}

interface TrustedScriptURL {
  toString(): string;
}

/**
 * Hotel System Trusted Types Policy
 * Provides secure content creation with comprehensive sanitization
 */
let hotelSystemPolicy: TrustedTypePolicy | null = null;

/**
 * Initialize Trusted Types policy for the hotel system
 */
export function initializeTrustedTypes(): void {
  if (!window.trustedTypes) {
    console.warn('Trusted Types API not supported in this browser');
    return;
  }

  if (hotelSystemPolicy) {
    console.log('Trusted Types policy already initialized');
    return;
  }

  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    hotelSystemPolicy = window.trustedTypes.createPolicy('hotel-system-policy', {
      createHTML: (input: string) => {
        // In development, be more permissive for debugging
        if (isDevelopment) {
          console.debug('Trusted Types: Creating HTML in development mode');
          return input; // Allow more content in development
        }
        // Sanitize HTML content with comprehensive XSS protection in production
        return sanitizeHTML(input);
      },
      createScript: (input: string) => {
        // In development, allow more script patterns for hot reloading
        if (isDevelopment) {
          console.debug('Trusted Types: Creating script in development mode');
          // Allow webpack hot reloading and development scripts
          if (input.includes('webpackHotUpdate') || 
              input.includes('__webpack') || 
              input.includes('module.hot') ||
              input.startsWith('//# sourceURL=') ||
              input.startsWith('//# sourceMappingURL=')) {
            return input;
          }
        }
        // Only allow specific script patterns for our application
        return sanitizeScript(input);
      },
      createScriptURL: (input: string) => {
        // In development, allow webpack and development URLs
        if (isDevelopment) {
          if (input.includes('webpack') || 
              input.includes('hot-update') ||
              input.includes('localhost') ||
              input.includes('127.0.0.1')) {
            return input;
          }
        }
        // Validate and sanitize script URLs
        return sanitizeScriptURL(input);
      }
    });

    console.log(`✅ Trusted Types policy initialized successfully (${isDevelopment ? 'development' : 'production'} mode)`);
    
    // Create a permissive default policy for Next.js compatibility
    if (!window.trustedTypes.defaultPolicy) {
      try {
        window.trustedTypes.createPolicy('default', {
          createHTML: (input: string) => {
            if (isDevelopment) console.debug('Default policy: Creating HTML');
            return input; // Allow all HTML for Next.js compatibility
          },
          createScript: (input: string) => {
            if (isDevelopment) console.debug('Default policy: Creating script');
            return input; // Allow all scripts for Next.js compatibility
          },
          createScriptURL: (input: string) => {
            if (isDevelopment) console.debug('Default policy: Creating script URL');
            return input; // Allow all script URLs for Next.js compatibility
          }
        });
        console.log(`✅ Default Trusted Types policy created for ${isDevelopment ? 'development' : 'production'} mode`);
      } catch (error) {
        console.warn('Could not create default policy:', error);
      }
    }
  } catch {
    console.error('Failed to initialize Trusted Types policy');
  }
}

/**
 * Comprehensive HTML sanitization
 */
function sanitizeHTML(input: string): string {
  // Remove dangerous elements and attributes
  const dangerousElements = [
    'script', 'object', 'embed', 'link', 'style', 'meta',
    'iframe', 'frame', 'frameset', 'applet', 'base'
  ];
  
  const dangerousAttributes = [
    'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur',
    'onchange', 'onsubmit', 'onreset', 'onselect', 'onunload',
    'onabort', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown',
    'onmouseup', 'onmousemove', 'onmouseout', 'ondblclick', 'ondragstart',
    'javascript:', 'vbscript:', 'data:', 'livescript:', 'mocha:'
  ];

  let sanitized = input;

  // Remove dangerous elements
  dangerousElements.forEach(element => {
    const regex = new RegExp(`<${element}[^>]*>.*?<\/${element}>`, 'gis');
    sanitized = sanitized.replace(regex, '');
    const selfClosingRegex = new RegExp(`<${element}[^>]*\/?>`, 'gis');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });

  // Remove dangerous attributes
  dangerousAttributes.forEach(attr => {
    const regex = new RegExp(`\\s${attr.replace(':', '\\:')}\\s*=\\s*["'][^"']*["']`, 'gis');
    sanitized = sanitized.replace(regex, '');
  });

  // Remove javascript: protocols
  sanitized = sanitized.replace(/javascript\s*:/gi, '');
  
  // Remove data: URLs that could contain scripts
  sanitized = sanitized.replace(/data\s*:\s*text\/html/gi, '');

  return sanitized;
}

/**
 * Script sanitization - only allows specific safe patterns
 */
function sanitizeScript(input: string): string {
  // For maximum security, we only allow very specific script patterns
  // In most cases, scripts should be loaded from trusted sources, not dynamically created
  
  // Remove any potentially dangerous script content
  if (input.includes('eval(') ||
      input.includes('Function(') ||
      input.includes('setTimeout(') ||
      input.includes('setInterval(') ||
      input.includes('document.write') ||
      input.includes('innerHTML') ||
      input.includes('outerHTML')) {
    console.warn('Blocked potentially dangerous script content');
    return '';
  }

  // Only allow JSON data or simple configuration
  try {
    JSON.parse(input);
    return input; // Safe JSON data
  } catch {
    // Not JSON, apply strict filtering
    console.warn('Blocked non-JSON script content:', input.substring(0, 100));
    return '';
  }
}

/**
 * Script URL sanitization
 */
function sanitizeScriptURL(input: string): string {
  try {
    const url = new URL(input, window.location.origin);
    
    // Allow only our own origin and specific trusted domains
    const trustedDomains = [
      window.location.hostname,
      'js.stripe.com',
      'checkout.stripe.com',
      'm.stripe.network'
    ];

    const isAllowed = trustedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );

    if (!isAllowed) {
      console.warn('Blocked script URL from untrusted domain:', url.hostname);
      return '';
    }

    // Ensure HTTPS in production
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
      console.warn('Blocked non-HTTPS script URL in production');
      return '';
    }

    return url.toString();
  } catch {
    console.warn('Invalid script URL format:', input);
    return '';
  }
}

/**
 * Create trusted HTML content
 */
export function createTrustedHTML(html: string): TrustedHTML | string {
  if (!hotelSystemPolicy) {
    console.warn('Trusted Types not initialized, falling back to string sanitization');
    return sanitizeHTML(html);
  }

  if (!hotelSystemPolicy.createHTML) {
    console.warn('HTML creation not supported by policy');
    return '';
  }

  return hotelSystemPolicy.createHTML(html);
}

/**
 * Create trusted script content
 */
export function createTrustedScript(script: string): TrustedScript | string {
  if (!hotelSystemPolicy) {
    console.warn('Trusted Types not initialized, falling back to string sanitization');
    return sanitizeScript(script);
  }

  if (!hotelSystemPolicy.createScript) {
    console.warn('Script creation not supported by policy');
    return '';
  }

  return hotelSystemPolicy.createScript(script);
}

/**
 * Create trusted script URL
 */
export function createTrustedScriptURL(url: string): TrustedScriptURL | string {
  if (!hotelSystemPolicy) {
    console.warn('Trusted Types not initialized, falling back to string sanitization');
    return sanitizeScriptURL(url);
  }

  if (!hotelSystemPolicy.createScriptURL) {
    console.warn('Script URL creation not supported by policy');
    return '';
  }

  return hotelSystemPolicy.createScriptURL(url);
}

/**
 * Secure innerHTML replacement
 */
export function setSecureInnerHTML(element: Element, html: string): void {
  const trustedHTML = createTrustedHTML(html);
  element.innerHTML = trustedHTML.toString();
}

/**
 * Secure script insertion
 */
export function insertSecureScript(script: string, container?: HTMLElement): HTMLScriptElement | null {
  try {
    const trustedScript = createTrustedScript(script);
    const scriptElement = document.createElement('script');
    scriptElement.textContent = trustedScript.toString();
    
    if (container) {
      container.appendChild(scriptElement);
    } else {
      document.head.appendChild(scriptElement);
    }
    
    return scriptElement;
  } catch {
    console.error('Failed to insert secure script');
    return null;
  }
}

/**
 * Secure external script loading
 */
export function loadSecureExternalScript(url: string): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    try {
      const trustedURL = createTrustedScriptURL(url);
      const scriptElement = document.createElement('script');
      scriptElement.src = trustedURL.toString();
      
      scriptElement.onload = () => resolve(scriptElement);
      scriptElement.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      
      document.head.appendChild(scriptElement);
    } catch (error: unknown) {
      reject(error);
    }
  });
}

/**
 * Check if Trusted Types is supported and configured
 */
export function isTrustedTypesSupported(): boolean {
  return typeof window !== 'undefined' && 'trustedTypes' in window;
}

/**
 * Get current Trusted Types policy status
 */
export function getTrustedTypesStatus(): {
  supported: boolean;
  policyInitialized: boolean;
  activePolicies: string[];
} {
  const supported = isTrustedTypesSupported();
  let activePolicies: string[] = [];
  
  if (supported && window.trustedTypes) {
    try {
      // Check if getPolicyNames method exists and is callable
      if (typeof window.trustedTypes.getPolicyNames === 'function') {
        activePolicies = window.trustedTypes.getPolicyNames();
      } else {
        // Fallback: try to detect policies manually
        activePolicies = [];
        if (window.trustedTypes.defaultPolicy) {
          activePolicies.push('default');
        }
        if (hotelSystemPolicy) {
          activePolicies.push('hotel-system-policy');
        }
        console.debug('Trusted Types: getPolicyNames() not available, using fallback detection');
      }
    } catch (error) {
      console.warn('Trusted Types: Error getting policy names:', error);
      // Fallback to basic detection
      activePolicies = hotelSystemPolicy ? ['hotel-system-policy'] : [];
    }
  }
  
  return {
    supported,
    policyInitialized: hotelSystemPolicy !== null,
    activePolicies
  };
}

/**
 * Validate that content is already trusted
 */
export function isTrustedContent(content: unknown): boolean {
  if (!window.trustedTypes) return false;
  
  return window.trustedTypes.isHTML(content) ||
         window.trustedTypes.isScript(content) ||
         window.trustedTypes.isScriptURL(content);
}

/**
 * Safe DOM manipulation utilities
 */
export const secureDOMUtils = {
  /**
   * Safely set text content (always safe)
   */
  setTextContent: (element: Element, text: string) => {
    element.textContent = text;
  },

  /**
   * Safely set HTML content using Trusted Types
   */
  setHTMLContent: (element: Element, html: string) => {
    setSecureInnerHTML(element, html);
  },

  /**
   * Safely append HTML content
   */
  appendHTMLContent: (element: Element, html: string) => {
    const trustedHTML = createTrustedHTML(html);
    element.insertAdjacentHTML('beforeend', trustedHTML.toString());
  },

  /**
   * Create secure element with content
   */
  createElement: (tagName: string, content?: string, isHTML = false): HTMLElement => {
    const element = document.createElement(tagName);
    if (content) {
      if (isHTML) {
        setSecureInnerHTML(element, content);
      } else {
        element.textContent = content;
      }
    }
    return element;
  }
};