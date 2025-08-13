/** @type {import('next').NextConfig} */

// Content Security Policy configuration with Trusted Types for DOM XSS mitigation
const isDevelopment = process.env.NODE_ENV === 'development';

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com https://m.stripe.network;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https: https://images.unsplash.com https://*.stripe.com;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://checkout.stripe.com;
    frame-ancestors 'none';
    frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com;
    connect-src 'self' https://peterlehocky.site https://api.peterlehocky.site https://api.stripe.com https://checkout.stripe.com https://m.stripe.network${isDevelopment ? ' http://localhost:4000 ws://localhost:4000' : ''};
    media-src 'self';
    worker-src 'self';
    child-src 'self';
    manifest-src 'self';
    navigate-to 'self' https://checkout.stripe.com https://js.stripe.com;
    trusted-types hotel-system-policy default ${isDevelopment ? '\'nextjs#bundler\' \'unsafe-inline\'' : '\'nextjs#bundler\' \'unsafe-inline\''};
    ${isDevelopment ? '/* require-trusted-types-for \'script\'; */' : '/* require-trusted-types-for \'script\'; */'}
    upgrade-insecure-requests;
`

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.stripe.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Security headers including CSP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\s{2,}/g, ' ').trim()
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), autoplay=()'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          },
          {
            key: 'Origin-Agent-Cluster',
            value: '?1'
          }
        ],
      },
    ]
  },
};

module.exports = nextConfig;