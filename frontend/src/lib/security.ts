/**
 * Security configuration and utilities for origin isolation
 */

/**
 * Check if the current origin is trusted
 */
export function isTrustedOrigin(origin?: string): boolean {
  if (!origin) return false;
  
  const trustedOrigins = [
    'https://peterlehocky.site',
    'https://www.peterlehocky.site',
    'http://localhost:3000', // Development only
    'http://localhost:4000', // Development backend
  ];
  
  return trustedOrigins.includes(origin);
}

/**
 * Secure window.open with proper origin isolation
 */
export function secureWindowOpen(
  url: string, 
  target?: string, 
  features?: string
): Window | null {
  // Ensure we're opening within our origin or to trusted external sites
  const allowedExternalDomains = [
    'stripe.com',
    'checkout.stripe.com',
    'js.stripe.com',
  ];
  
  try {
    const urlObj = new URL(url, window.location.href);
    
    // Check if it's our origin
    if (urlObj.origin === window.location.origin) {
      return window.open(url, target, features);
    }
    
    // Check if it's an allowed external domain
    const isAllowedExternal = allowedExternalDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
    
    if (isAllowedExternal) {
      // Open external links with noopener and noreferrer for security
      const secureFeatures = features 
        ? `${features},noopener,noreferrer`
        : 'noopener,noreferrer';
      
      return window.open(url, target, secureFeatures);
    }
    
    console.warn('Blocked attempt to open untrusted URL:', url);
    return null;
  } catch (error) {
    console.error('Error in secureWindowOpen:', error);
    return null;
  }
}

/**
 * Secure postMessage wrapper with origin validation
 */
export function securePostMessage(
  targetWindow: Window,
  message: unknown,
  targetOrigin: string
): void {
  if (!isTrustedOrigin(targetOrigin)) {
    console.warn('Blocked postMessage to untrusted origin:', targetOrigin);
    return;
  }
  
  targetWindow.postMessage(message, targetOrigin);
}

/**
 * Setup secure message listener with origin validation
 */
export function setupSecureMessageListener(
  callback: (event: MessageEvent) => void,
  allowedOrigins?: string[]
): () => void {
  const trustedOrigins = allowedOrigins || [
    window.location.origin,
    'https://js.stripe.com',
    'https://checkout.stripe.com',
  ];
  
  const secureListener = (event: MessageEvent) => {
    // Validate origin
    if (!trustedOrigins.includes(event.origin)) {
      console.warn('Blocked message from untrusted origin:', event.origin);
      return;
    }
    
    // Additional validation for message structure
    if (typeof event.data !== 'object' || event.data === null) {
      console.warn('Blocked invalid message data:', event.data);
      return;
    }
    
    callback(event);
  };
  
  window.addEventListener('message', secureListener);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('message', secureListener);
  };
}

/**
 * Origin isolation checks for development
 */
export function validateOriginIsolation(): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  // Check if COOP is working
  try {
    // This should be blocked with proper COOP
    if (window.opener && window.opener !== window) {
      console.warn('⚠️ COOP Warning: window.opener is accessible from cross-origin');
    }
    
    // Check for proper CSP
    const metaCsp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!metaCsp) {
      console.warn('⚠️ CSP Warning: No CSP meta tag found');
    }
    
    // Check for proper origin headers
    fetch(window.location.href, { method: 'HEAD' })
      .then(response => {
        const coop = response.headers.get('Cross-Origin-Opener-Policy');
        const corp = response.headers.get('Cross-Origin-Resource-Policy');
        
        if (coop !== 'same-origin') {
          console.warn('⚠️ COOP Warning: Cross-Origin-Opener-Policy not set to same-origin');
        }
        
        if (corp !== 'same-origin') {
          console.warn('⚠️ CORP Warning: Cross-Origin-Resource-Policy not set to same-origin');
        }
        
        console.log('✅ Origin isolation headers:', { coop, corp });
      })
      .catch(error => {
        console.error('Failed to check origin isolation headers:', error);
      });
      
  } catch (error) {
    console.error('Error during origin isolation validation:', error);
  }
}

/**
 * Initialize origin isolation security measures
 */
export function initializeOriginSecurity(): void {
  // Block access to window.name from potential attackers
  if (window.name && window.name.length > 0) {
    // Clear window.name to prevent information leakage
    window.name = '';
  }
  
  // Override window.open to use secure version
  const originalOpen = window.open.bind(window);
  window.open = (url?: string | URL, target?: string, features?: string) => {
    if (!url) return originalOpen();
    const urlString = url instanceof URL ? url.toString() : url;
    return secureWindowOpen(urlString, target, features);
  };
  
  // Add security event listeners
  window.addEventListener('beforeunload', () => {
    // Clear any sensitive data before navigation
    sessionStorage.removeItem('temp-data');
  });
  
  // Validate origin isolation in development
  validateOriginIsolation();
  
  console.log('✅ Origin security initialized');
}

/**
 * Check if running in a secure context
 */
export function isSecureContext(): boolean {
  return window.isSecureContext;
}

/**
 * Validate that we're running with proper isolation
 */
export function validateSecureContext(): boolean {
  const checks = {
    isSecureContext: isSecureContext(),
    hasOriginAgentCluster: 'originAgentCluster' in window,
    properCOOP: !window.opener || window.opener === window,
    trustedOrigin: isTrustedOrigin(window.location.origin),
  };
  
  const allChecksPass = Object.values(checks).every(Boolean);
  
  if (!allChecksPass) {
    console.warn('❌ Security validation failed:', checks);
  } else {
    console.log('✅ Security validation passed:', checks);
  }
  
  return allChecksPass;
}