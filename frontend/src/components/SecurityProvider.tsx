'use client';

import { useEffect } from 'react';
import { initializeOriginSecurity, validateSecureContext } from '@/lib/security';
import { initializeTrustedTypes, getTrustedTypesStatus } from '@/lib/trustedTypes';
import { initializeXSSPrevention } from '@/lib/xssPrevention';
import { debugTrustedTypesSupport, testTrustedTypesFunctionality, monitorTrustedTypesViolations } from '@/lib/trustedTypesDebug';

interface SecurityProviderProps {
  children: React.ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  useEffect(() => {
    // Initialize origin security measures
    initializeOriginSecurity();
    
    // Initialize Trusted Types for DOM XSS mitigation
    initializeTrustedTypes();
    
    // Initialize comprehensive XSS prevention measures
    initializeXSSPrevention();
    
    // Validate secure context
    validateSecureContext();
    
    // Additional security checks in development
    if (process.env.NODE_ENV === 'development') {
      // Check if we have proper COOP isolation
      const checkIsolation = () => {
        try {
          // Test if we can access properties that should be blocked
          if (window.opener && window.opener !== window) {
            console.warn('🔒 COOP: Cross-origin window.opener detected');
          } else {
            console.log('✅ COOP: Proper origin isolation confirmed');
          }
        } catch {
          console.log('✅ COOP: Cross-origin access properly blocked');
        }
      };
      
      // Check Trusted Types status
      const checkTrustedTypes = () => {
        try {
          const status = getTrustedTypesStatus();
          if (status.supported) {
            console.log('✅ Trusted Types: API supported');
            if (status.policyInitialized) {
              console.log('✅ Trusted Types: Policy initialized');
              console.log('🛡️ Active policies:', status.activePolicies);
            } else {
              console.warn('⚠️ Trusted Types: Policy not initialized');
            }
          } else {
            console.warn('⚠️ Trusted Types: API not supported in this browser');
          }
        } catch (error) {
          console.error('❌ Error checking Trusted Types status:', error);
        }
      };
      
      // Run comprehensive debugging
      const runDevelopmentDebugging = () => {
        // Enable violation monitoring
        monitorTrustedTypesViolations();
        
        // Run detailed debugging
        debugTrustedTypesSupport();
        
        // Test functionality if supported
        if (window.trustedTypes) {
          testTrustedTypesFunctionality();
        }
        
        // Standard checks
        checkIsolation();
        checkTrustedTypes();
      };
      
      // Run checks after a brief delay to ensure all security headers are processed
      setTimeout(runDevelopmentDebugging, 100);
    }
  }, []);

  return <>{children}</>;
}