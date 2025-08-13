/**
 * Cross-Origin Opener Policy (COOP) and Cross-Origin Embedder Policy (COEP) Configuration
 * 
 * This file contains configuration for advanced origin isolation features.
 * COOP provides process isolation, while COEP enables SharedArrayBuffer and other advanced features.
 */

import { env } from './environment';

export interface COOPConfig {
  enabled: boolean;
  policy: 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none';
  reportOnly?: boolean;
  reportEndpoint?: string;
}

export interface COEPConfig {
  enabled: boolean;
  policy: 'require-corp' | 'credentialless' | 'unsafe-none';
  reportOnly?: boolean;
  reportEndpoint?: string;
}

export interface OriginIsolationConfig {
  coop: COOPConfig;
  coep: COEPConfig;
  corpPolicy: 'same-origin' | 'same-site' | 'cross-origin';
  originAgentCluster: boolean;
}

/**
 * Get origin isolation configuration based on environment
 */
export function getOriginIsolationConfig(): OriginIsolationConfig {
  const isProduction = env.NODE_ENV === 'production';
  
  return {
    coop: {
      enabled: true,
      policy: 'same-origin', // Strictest policy for maximum isolation
      reportOnly: false,
      // Enable reporting in production for monitoring
      reportEndpoint: isProduction ? '/api/security/coop-violations' : undefined,
    },
    coep: {
      enabled: false, // Disabled by default due to Stripe compatibility
      policy: 'credentialless', // Less strict than require-corp
      reportOnly: true, // Report-only mode to avoid breaking functionality
      reportEndpoint: isProduction ? '/api/security/coep-violations' : undefined,
    },
    corpPolicy: 'same-origin', // Resource isolation
    originAgentCluster: true, // Additional process isolation
  };
}

/**
 * Get COOP header value
 */
export function getCOOPHeader(config: COOPConfig): string {
  if (!config.enabled) return '';
  
  let header = config.policy;
  
  if (config.reportEndpoint) {
    header += `; report-to="${config.reportEndpoint}"`;
  }
  
  return header;
}

/**
 * Get COEP header value
 */
export function getCOEPHeader(config: COEPConfig): string {
  if (!config.enabled) return '';
  
  let header = config.policy;
  
  if (config.reportEndpoint) {
    header += `; report-to="${config.reportEndpoint}"`;
  }
  
  return header;
}

/**
 * Validate origin isolation compatibility
 */
export function validateOriginIsolationCompatibility(): {
  compatible: boolean;
  warnings: string[];
  recommendations: string[];
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Check for potential compatibility issues
  if (process.env.STRIPE_SECRET_KEY) {
    warnings.push('Stripe integration detected - COEP may need to be disabled or set to credentialless');
    recommendations.push('Consider using COEP report-only mode with Stripe integration');
  }
  
  // Check if running in development
  if (env.NODE_ENV === 'development') {
    recommendations.push('Test origin isolation in production-like environment');
    recommendations.push('Verify third-party integrations work with COOP/COEP enabled');
  }
  
  // Check for secure context requirements
  if (env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('ssl')) {
    warnings.push('HTTPS is required for full origin isolation features in production');
  }
  
  return {
    compatible: warnings.length === 0,
    warnings,
    recommendations,
  };
}

/**
 * Security reporting endpoint configuration
 */
export function getSecurityReportingConfig() {
  return {
    endpoints: [
      {
        group: 'coop-violations',
        maxAge: 86400, // 24 hours
        endpoints: [
          {
            url: '/api/security/coop-violations',
            priority: 1,
            weight: 1,
          },
        ],
      },
      {
        group: 'coep-violations', 
        maxAge: 86400,
        endpoints: [
          {
            url: '/api/security/coep-violations',
            priority: 1,
            weight: 1,
          },
        ],
      },
    ],
  };
}

/**
 * Advanced isolation features detection (for client-side use)
 */
export function getAdvancedIsolationFeatures(): {
  sharedArrayBuffer: boolean;
  crossOriginIsolated: boolean;
  originAgentCluster: boolean;
} {
  // These features are only available in browser context
  if (typeof globalThis === 'undefined' || typeof globalThis.window === 'undefined') {
    return {
      sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
      crossOriginIsolated: false,
      originAgentCluster: false,
    };
  }
  
  const win = globalThis.window as any;
  return {
    sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    crossOriginIsolated: win.crossOriginIsolated || false,
    originAgentCluster: 'originAgentCluster' in win,
  };
}