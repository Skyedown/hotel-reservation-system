'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  secureDOMUtils, 
  getTrustedTypesStatus,
  isTrustedTypesSupported 
} from '@/lib/trustedTypes';
import { 
  validateAndSanitizeFormData,
  createSafeDisplayHTML,
  sanitizeURL 
} from '@/lib/xssPrevention';

interface TestResult {
  test: string;
  passed: boolean;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function XSSTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [trustedTypesStatus, setTrustedTypesStatus] = useState<{
    supported: boolean;
    policyInitialized: boolean;
    activePolicies: string[];
  } | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [sanitizedOutput, setSanitizedOutput] = useState('');
  const testContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTrustedTypesStatus(getTrustedTypesStatus());
  }, []);

  // Simulated XSS attack payloads for testing
  const xssPayloads = [
    {
      name: 'Script Tag Injection',
      payload: '<script>alert("XSS")</script>',
      severity: 'critical' as const
    },
    {
      name: 'Image Onerror Event',
      payload: '<img src="x" onerror="alert(\'XSS\')">',
      severity: 'high' as const
    },
    {
      name: 'JavaScript URL',
      payload: '<a href="javascript:alert(\'XSS\')">Click me</a>',
      severity: 'high' as const
    },
    {
      name: 'Iframe Injection',
      payload: '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      severity: 'critical' as const
    },
    {
      name: 'SVG Script Injection',
      payload: '<svg onload="alert(\'XSS\')">',
      severity: 'high' as const
    },
    {
      name: 'Data URL Script',
      payload: '<script src="data:text/javascript,alert(\'XSS\')"></script>',
      severity: 'critical' as const
    },
    {
      name: 'Style Expression',
      payload: '<div style="expression(alert(\'XSS\'))">test</div>',
      severity: 'medium' as const
    },
    {
      name: 'Form Action XSS',
      payload: '<form action="javascript:alert(\'XSS\')"><input type="submit"></form>',
      severity: 'medium' as const
    },
    {
      name: 'Object Tag',
      payload: '<object data="javascript:alert(\'XSS\')"></object>',
      severity: 'high' as const
    },
    {
      name: 'Meta Redirect',
      payload: '<meta http-equiv="refresh" content="0;url=javascript:alert(\'XSS\')">',
      severity: 'medium' as const
    }
  ];

  const runXSSTests = async () => {
    setIsRunningTests(true);
    const results: TestResult[] = [];

    // Test 1: Trusted Types Status
    const ttSupported = isTrustedTypesSupported();
    results.push({
      test: 'Trusted Types Support',
      passed: ttSupported,
      details: ttSupported ? 'Browser supports Trusted Types API' : 'Browser does not support Trusted Types API',
      severity: ttSupported ? 'low' : 'high'
    });

    // Test 2: Policy Initialization
    const ttStatus = getTrustedTypesStatus();
    results.push({
      test: 'Trusted Types Policy',
      passed: ttStatus.policyInitialized,
      details: ttStatus.policyInitialized ? 
        `Policy initialized: ${ttStatus.activePolicies.join(', ')}` : 
        'No Trusted Types policy initialized',
      severity: ttStatus.policyInitialized ? 'low' : 'critical'
    });

    // Test 3: XSS Payload Sanitization Tests
    for (const payload of xssPayloads) {
      try {
        // Test with our sanitization
        const sanitized = createSafeDisplayHTML(payload.payload, false);
        const containsScript = sanitized.toLowerCase().includes('<script') || 
                              sanitized.includes('javascript:') ||
                              sanitized.includes('onerror=') ||
                              sanitized.includes('onload=');
        
        results.push({
          test: `XSS Prevention: ${payload.name}`,
          passed: !containsScript,
          details: containsScript ? 
            `Dangerous content not properly sanitized: ${sanitized.substring(0, 100)}` : 
            'Payload successfully sanitized',
          severity: containsScript ? payload.severity : 'low'
        });
      } catch (error) {
        results.push({
          test: `XSS Prevention: ${payload.name}`,
          passed: false,
          details: `Error during sanitization: ${error}`,
          severity: 'high'
        });
      }
    }

    // Test 4: Input Sanitization for Hotel Forms
    const testFormData = {
      firstName: 'John<script>alert("xss")</script>',
      email: 'test@example.com<script>alert("xss")</script>',
      phone: '123-456-7890<script>alert("xss")</script>',
      notes: 'Special requests: <strong>bold text</strong><script>alert("xss")</script>'
    };

    const { sanitized, isValid, errors } = validateAndSanitizeFormData(testFormData);
    
    results.push({
      test: 'Form Data Sanitization',
      passed: isValid && !JSON.stringify(sanitized).toLowerCase().includes('<script'),
      details: isValid ? 
        'Form data successfully sanitized' : 
        `Sanitization errors: ${errors.join(', ')}`,
      severity: isValid ? 'low' : 'medium'
    });

    // Test 5: URL Sanitization
    const maliciousUrls = [
      'javascript:alert("xss")',
      'data:text/html,<script>alert("xss")</script>',
      'vbscript:alert("xss")'
    ];

    let urlTestsPassed = 0;
    for (const url of maliciousUrls) {
      const sanitized = sanitizeURL(url);
      if (sanitized === '') urlTestsPassed++;
    }

    results.push({
      test: 'URL Sanitization',
      passed: urlTestsPassed === maliciousUrls.length,
      details: `${urlTestsPassed}/${maliciousUrls.length} malicious URLs blocked`,
      severity: urlTestsPassed === maliciousUrls.length ? 'low' : 'high'
    });

    // Test 6: DOM Manipulation Safety
    try {
      if (testContainerRef.current) {
        // Test safe DOM manipulation
        secureDOMUtils.setHTMLContent(testContainerRef.current, '<p>Safe content</p><script>alert("xss")</script>');
        const content = testContainerRef.current.innerHTML;
        const isSafe = !content.toLowerCase().includes('<script');
        
        results.push({
          test: 'Safe DOM Manipulation',
          passed: isSafe,
          details: isSafe ? 'DOM manipulation properly sanitized' : 'Unsafe content in DOM',
          severity: isSafe ? 'low' : 'critical'
        });
      }
    } catch (error) {
      results.push({
        test: 'Safe DOM Manipulation',
        passed: false,
        details: `DOM manipulation error: ${error}`,
        severity: 'high'
      });
    }

    // Test 7: CSP Header Check
    try {
      const response = await fetch(window.location.href, { method: 'HEAD' });
      const cspHeader = response.headers.get('Content-Security-Policy');
      const hasTrustedTypes = cspHeader?.includes('trusted-types') || false;
      const requiresTrustedTypes = cspHeader?.includes('require-trusted-types-for') || false;
      
      results.push({
        test: 'CSP Trusted Types Configuration',
        passed: hasTrustedTypes && requiresTrustedTypes,
        details: hasTrustedTypes && requiresTrustedTypes ? 
          'CSP properly configured for Trusted Types' : 
          'CSP missing Trusted Types directives',
        severity: hasTrustedTypes && requiresTrustedTypes ? 'low' : 'high'
      });
    } catch (error) {
      results.push({
        test: 'CSP Trusted Types Configuration',
        passed: false,
        details: `Failed to check CSP headers: ${error}`,
        severity: 'medium'
      });
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  const handleUserInputTest = () => {
    const sanitized = createSafeDisplayHTML(userInput, true);
    setSanitizedOutput(sanitized);
  };

  const getResultColor = (result: TestResult) => {
    if (result.passed) return 'text-green-600 bg-green-50';
    switch (result.severity) {
      case 'critical': return 'text-red-800 bg-red-100';
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🛡️ XSS Prevention & Trusted Types Test Suite</h1>
      
      {/* Trusted Types Status */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Trusted Types Status</h2>
        {trustedTypesStatus && (
          <div className="grid gap-4">
            <div>
              <strong>Browser Support:</strong>{' '}
              <span className={trustedTypesStatus.supported ? 'text-green-600' : 'text-red-600'}>
                {trustedTypesStatus.supported ? 'Supported' : 'Not Supported'}
              </span>
            </div>
            <div>
              <strong>Policy Initialized:</strong>{' '}
              <span className={trustedTypesStatus.policyInitialized ? 'text-green-600' : 'text-red-600'}>
                {trustedTypesStatus.policyInitialized ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <strong>Active Policies:</strong>{' '}
              <span className="font-mono">{trustedTypesStatus.activePolicies.join(', ') || 'None'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Test Runner */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">XSS Prevention Tests</h2>
        <button
          onClick={runXSSTests}
          disabled={isRunningTests}
          className={`px-6 py-3 rounded font-semibold ${
            isRunningTests 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRunningTests ? 'Running Tests...' : 'Run XSS Prevention Tests'}
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded border-l-4 ${
                  result.passed ? 'border-green-500' : 'border-red-500'
                } ${getResultColor(result)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {result.passed ? '✅' : '❌'} {result.test}
                    </h3>
                    <p className="text-sm mt-1">{result.details}</p>
                  </div>
                  {!result.passed && (
                    <span className={`px-2 py-1 text-xs rounded font-semibold ${
                      result.severity === 'critical' ? 'bg-red-200 text-red-800' :
                      result.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                      result.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {result.severity.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Input Testing */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Interactive Input Testing</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Input (try XSS payloads):</label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
              rows={4}
              placeholder="Enter potentially malicious content here..."
            />
          </div>
          <button
            onClick={handleUserInputTest}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Sanitization
          </button>
          {sanitizedOutput && (
            <div>
              <label className="block text-sm font-medium mb-2">Sanitized Output:</label>
              <div className="p-3 bg-gray-100 rounded border">
                <pre className="whitespace-pre-wrap text-sm">{sanitizedOutput}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DOM Test Container */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">DOM Manipulation Test Area</h2>
        <div 
          ref={testContainerRef}
          className="p-4 border border-gray-300 rounded bg-gray-50 min-h-[100px]"
        >
          <p className="text-gray-600">DOM test content will appear here during tests...</p>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="bg-blue-50 rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Security Recommendations</h2>
        <ul className="space-y-2 text-blue-700">
          <li>• Ensure Trusted Types are enabled and properly configured</li>
          <li>• Use sanitization utilities for all user input</li>
          <li>• Regularly test XSS prevention measures</li>
          <li>• Monitor CSP violation reports</li>
          <li>• Keep security headers up to date</li>
          <li>• Educate developers on secure coding practices</li>
        </ul>
      </div>
    </div>
  );
}