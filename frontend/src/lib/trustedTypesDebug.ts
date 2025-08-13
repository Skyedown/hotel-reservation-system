/**
 * Trusted Types debugging utilities
 * 
 * This module provides debugging information about Trusted Types support
 * and helps identify browser compatibility issues.
 */

/**
 * Get detailed browser Trusted Types support information
 */
export function debugTrustedTypesSupport(): void {
  if (typeof window === 'undefined') {
    console.log('🔍 Trusted Types Debug: Running in server environment');
    return;
  }

  console.group('🔍 Trusted Types Browser Support Debug');
  
  // Basic support check
  const hasWindow = typeof window !== 'undefined';
  const hasTrustedTypes = hasWindow && 'trustedTypes' in window;
  
  console.log('Window object available:', hasWindow);
  console.log('trustedTypes in window:', hasTrustedTypes);
  
  if (hasTrustedTypes && window.trustedTypes) {
    const tt = window.trustedTypes;
    
    console.log('Trusted Types object:', tt);
    console.log('Available methods:');
    console.log('  - createPolicy:', typeof tt.createPolicy);
    console.log('  - getPolicyNames:', typeof tt.getPolicyNames);
    console.log('  - isHTML:', typeof tt.isHTML);
    console.log('  - isScript:', typeof tt.isScript);
    console.log('  - isScriptURL:', typeof tt.isScriptURL);
    
    // Check for default policy
    console.log('Default policy available:', !!tt.defaultPolicy);
    
    // Try to get policy names safely
    try {
      if (typeof tt.getPolicyNames === 'function') {
        const policies = tt.getPolicyNames();
        console.log('Active policies:', policies);
      } else {
        console.log('getPolicyNames() method not available');
      }
    } catch (error) {
      console.log('Error calling getPolicyNames():', error);
    }
    
    // Browser information
    const userAgent = navigator.userAgent;
    console.log('User Agent:', userAgent);
    
    // Common browser detection
    if (userAgent.includes('Chrome')) {
      const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
      const chromeVersion = chromeMatch ? parseInt(chromeMatch[1]) : 0;
      console.log(`Chrome version: ${chromeVersion}`);
      if (chromeVersion < 83) {
        console.warn('⚠️ Chrome version may have limited Trusted Types support (requires 83+)');
      }
    }
    
    if (userAgent.includes('Firefox')) {
      console.log('🦊 Firefox detected - Trusted Types support may be experimental');
    }
    
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      console.log('🧭 Safari detected - Trusted Types support may be limited');
    }
    
    if (userAgent.includes('Edge')) {
      const edgeMatch = userAgent.match(/Edg\/(\d+)/);
      const edgeVersion = edgeMatch ? parseInt(edgeMatch[1]) : 0;
      console.log(`Edge version: ${edgeVersion}`);
      if (edgeVersion < 83) {
        console.warn('⚠️ Edge version may have limited Trusted Types support (requires 83+)');
      }
    }
    
  } else {
    console.warn('❌ Trusted Types not supported in this browser');
    console.log('Browser info:', {
      userAgent: navigator.userAgent,
      hasWindow,
      windowKeys: hasWindow ? Object.keys(window).filter(key => key.includes('trust')).slice(0, 10) : []
    });
  }
  
  console.groupEnd();
}

/**
 * Test Trusted Types functionality using existing policies
 */
export function testTrustedTypesFunctionality(): void {
  if (typeof window === 'undefined' || !window.trustedTypes) {
    console.log('🧪 Trusted Types Test: Not available');
    return;
  }

  console.group('🧪 Trusted Types Functionality Test');
  
  try {
    // Test with default policy if available
    const defaultPolicy = window.trustedTypes.defaultPolicy;
    if (defaultPolicy) {
      console.log('✅ Default policy available');
      
      // Test HTML creation and validation
      if (defaultPolicy.createHTML) {
        const testHTML = defaultPolicy.createHTML('<p>Test HTML from default policy</p>');
        console.log('✅ Default policy HTML creation:', testHTML);
        
        if (window.trustedTypes.isHTML) {
          console.log('✅ isHTML validation:', window.trustedTypes.isHTML(testHTML));
        }
      }
      
      // Test script creation and validation
      if (defaultPolicy.createScript) {
        const testScript = defaultPolicy.createScript('console.log("test from default policy");');
        console.log('✅ Default policy script creation:', testScript);
        
        if (window.trustedTypes.isScript) {
          console.log('✅ isScript validation:', window.trustedTypes.isScript(testScript));
        }
      }
      
      // Test script URL creation and validation
      if (defaultPolicy.createScriptURL) {
        const testScriptURL = defaultPolicy.createScriptURL('http://localhost:3001/test.js');
        console.log('✅ Default policy script URL creation:', testScriptURL);
        
        if (window.trustedTypes.isScriptURL) {
          console.log('✅ isScriptURL validation:', window.trustedTypes.isScriptURL(testScriptURL));
        }
      }
    } else {
      console.log('ℹ️ No default policy available for testing');
    }
    
    // Test validation methods with string inputs (should return false)
    if (window.trustedTypes.isHTML) {
      console.log('✅ isHTML with string (should be false):', window.trustedTypes.isHTML('<p>string</p>'));
    }
    
    if (window.trustedTypes.isScript) {
      console.log('✅ isScript with string (should be false):', window.trustedTypes.isScript('console.log("string")'));
    }
    
    if (window.trustedTypes.isScriptURL) {
      console.log('✅ isScriptURL with string (should be false):', window.trustedTypes.isScriptURL('http://example.com'));
    }
    
    console.log('✅ Trusted Types functionality test completed');
    
  } catch (error) {
    console.error('❌ Trusted Types test failed:', error);
    
    // Provide specific guidance for common errors
    if (error instanceof Error) {
      if (error.message.includes('disallowed')) {
        console.warn('💡 Tip: Policy creation blocked by CSP. This is expected in production.');
      } else if (error.message.includes('already exists')) {
        console.warn('💡 Tip: Policy already exists. This is normal.');
      }
    }
  }
  
  console.groupEnd();
}

/**
 * Monitor Trusted Types violations
 */
export function monitorTrustedTypesViolations(): void {
  if (typeof window === 'undefined') return;
  
  // Listen for security policy violations
  document.addEventListener('securitypolicyviolation', (event) => {
    if (event.violatedDirective?.includes('trusted-types')) {
      console.group('🚨 Trusted Types Violation Detected');
      console.error('Violation details:', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
        sample: event.sample
      });
      console.groupEnd();
    }
  });
  
  console.log('🔍 Trusted Types violation monitoring enabled');
}