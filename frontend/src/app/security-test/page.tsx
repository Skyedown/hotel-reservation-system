'use client';

import { useState, useEffect } from 'react';

// Local implementation of advanced isolation features for client-side
function getAdvancedIsolationFeatures() {
  return {
    sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    crossOriginIsolated: (globalThis as unknown as { crossOriginIsolated?: boolean }).crossOriginIsolated || false,
    originAgentCluster: 'originAgentCluster' in (globalThis as unknown as Record<string, unknown>),
  };
}

interface SecurityStatus {
  features: {
    sharedArrayBuffer: boolean;
    crossOriginIsolated: boolean;
    originAgentCluster: boolean;
  };
  headers: {
    coop: string | null;
    corp: string | null;
    coep: string | null;
    oac: string | null;
  };
  crossOriginIsolated: boolean;
  isSecureContext: boolean;
  origin: string;
}

export default function SecurityTestPage() {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [coopTest, setCoopTest] = useState<string>('Testing...');

  useEffect(() => {
    // Test Cross-Origin Opener Policy
    const testCOOP = () => {
      try {
        // Try to access window.opener
        if (window.opener && window.opener !== window) {
          setCoopTest('❌ COOP not working - window.opener accessible');
        } else if (window.opener === null) {
          setCoopTest('✅ COOP working - no cross-origin opener');
        } else {
          setCoopTest('✅ COOP working - opener is same-origin');
        }
      } catch {
        setCoopTest('✅ COOP working - cross-origin access blocked');
      }
    };

    // Test advanced isolation features
    const testAdvancedFeatures = async () => {
      const features = getAdvancedIsolationFeatures();
      
      // Test headers
      try {
        const response = await fetch(window.location.href, { method: 'HEAD' });
        const headers = {
          coop: response.headers.get('Cross-Origin-Opener-Policy'),
          corp: response.headers.get('Cross-Origin-Resource-Policy'),
          coep: response.headers.get('Cross-Origin-Embedder-Policy'),
          oac: response.headers.get('Origin-Agent-Cluster'),
        };

        setSecurityStatus({
          features,
          headers,
          crossOriginIsolated: (window as unknown as { crossOriginIsolated?: boolean }).crossOriginIsolated || false,
          isSecureContext: window.isSecureContext,
          origin: window.location.origin,
        });
      } catch (error) {
        console.error('Failed to test security features:', error);
      }
    };

    testCOOP();
    testAdvancedFeatures();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🔒 Origin Isolation Security Test</h1>
      
      <div className="grid gap-6">
        {/* COOP Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Cross-Origin Opener Policy (COOP)</h2>
          <p className="text-lg">{coopTest}</p>
          <div className="mt-4 text-sm text-gray-600">
            <p>COOP prevents malicious sites from accessing your window through window.opener.</p>
          </div>
        </div>

        {/* Security Status */}
        {securityStatus && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Security Headers Status</h2>
            <div className="grid gap-4">
              <div>
                <strong>Cross-Origin-Opener-Policy:</strong>{' '}
                <span className={securityStatus.headers.coop ? 'text-green-600' : 'text-red-600'}>
                  {securityStatus.headers.coop || 'Not set'}
                </span>
              </div>
              <div>
                <strong>Cross-Origin-Resource-Policy:</strong>{' '}
                <span className={securityStatus.headers.corp ? 'text-green-600' : 'text-red-600'}>
                  {securityStatus.headers.corp || 'Not set'}
                </span>
              </div>
              <div>
                <strong>Cross-Origin-Embedder-Policy:</strong>{' '}
                <span className={securityStatus.headers.coep ? 'text-blue-600' : 'text-gray-600'}>
                  {securityStatus.headers.coep || 'Not set (optional)'}
                </span>
              </div>
              <div>
                <strong>Origin-Agent-Cluster:</strong>{' '}
                <span className={securityStatus.headers.oac ? 'text-green-600' : 'text-red-600'}>
                  {securityStatus.headers.oac || 'Not set'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Features */}
        {securityStatus && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Advanced Isolation Features</h2>
            <div className="grid gap-4">
              <div>
                <strong>Cross-Origin Isolated:</strong>{' '}
                <span className={securityStatus.crossOriginIsolated ? 'text-green-600' : 'text-orange-600'}>
                  {securityStatus.crossOriginIsolated ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <strong>Secure Context:</strong>{' '}
                <span className={securityStatus.isSecureContext ? 'text-green-600' : 'text-red-600'}>
                  {securityStatus.isSecureContext ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <strong>SharedArrayBuffer:</strong>{' '}
                <span className={securityStatus.features.sharedArrayBuffer ? 'text-green-600' : 'text-orange-600'}>
                  {securityStatus.features.sharedArrayBuffer ? 'Available' : 'Not available'}
                </span>
              </div>
              <div>
                <strong>Origin:</strong> <span className="font-mono">{securityStatus.origin}</span>
              </div>
            </div>
          </div>
        )}

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="space-x-4">
            <button
              onClick={() => {
                try {
                  const newWindow = window.open('/security-test', '_blank');
                  if (newWindow) {
                    console.log('Window opened successfully');
                    setTimeout(() => {
                      try {
                        // This should fail with proper COOP
                        console.log('New window location:', newWindow.location);
                      } catch {
                        console.log('✅ COOP working: Cannot access cross-origin window');
                      }
                    }, 1000);
                  }
                } catch (error) {
                  console.error('Window open failed:', error);
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Same-Origin Window.open
            </button>
            
            <button
              onClick={() => {
                try {
                  // This should be blocked or sanitized by our secure wrapper
                  window.open('https://example.com', '_blank');
                } catch (error) {
                  console.log('Cross-origin window.open blocked:', error);
                }
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Test Cross-Origin Window.open
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Check the browser console for test results.</p>
          </div>
        </div>
      </div>
    </div>
  );
}