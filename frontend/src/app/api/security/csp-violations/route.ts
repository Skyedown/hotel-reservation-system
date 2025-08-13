/**
 * CSP Violation Reporting API Route
 * Forwards violation reports to the backend
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward to backend API
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.peterlehocky.site'
      : 'http://localhost:4000';
      
    const response = await fetch(`${backendUrl}/api/security/csp-violations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'csp-violation',
        ...body,
        timestamp: new Date().toISOString(),
        forwarded: true
      })
    });

    if (response.ok) {
      return new NextResponse(null, { status: 204 });
    } else {
      console.error('Failed to forward CSP violation to backend:', response.status);
      return new NextResponse(null, { status: 204 }); // Still return 204 to prevent retries
    }
  } catch (error) {
    console.error('Error processing CSP violation report:', error);
    return new NextResponse(null, { status: 204 }); // Return 204 to prevent browser retries
  }
}