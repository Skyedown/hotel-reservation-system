// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import helmet from 'helmet';
import { typeDefs } from './types/typeDefs';
import { resolvers } from './resolvers';
import { createContext } from './context';
import { connectDatabase } from './config/prisma';
import { stripeWebhookHandler } from './services/stripeWebhook';
import { cronService } from './services/cronService';
import { env, performSecurityChecks, validateRuntimeConfig } from './config/environment';
import { SecurityLoggerService } from './services/securityLogger';
import { 
  generalRateLimit, 
  graphqlRateLimit, 
  slowDownMiddleware 
} from './services/rateLimitService';
import { 
  getOriginIsolationConfig, 
  getCOOPHeader, 
  getCOEPHeader,
  validateOriginIsolationCompatibility 
} from './config/coopConfig';
import securityRoutes from './routes/security';

// Perform security validation
performSecurityChecks();
validateRuntimeConfig();

// Validate origin isolation compatibility
const isolationCompatibility = validateOriginIsolationCompatibility();
if (!isolationCompatibility.compatible) {
  console.warn('⚠️ Origin isolation compatibility warnings:');
  isolationCompatibility.warnings.forEach(warning => console.warn(`  • ${warning}`));
}
if (isolationCompatibility.recommendations.length > 0) {
  console.log('💡 Origin isolation recommendations:');
  isolationCompatibility.recommendations.forEach(rec => console.log(`  • ${rec}`));
}

async function startServer() {
  const app = express();
  const PORT = env.PORT;

  // Log server startup
  SecurityLoggerService.logSuccess({
    event: 'SERVER_STARTUP_INITIATED',
    severity: 'LOW',
    details: {
      port: PORT,
      nodeEnv: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });

  // Connect to database
  await connectDatabase();

  // Start cron services
  cronService.start();

  // Trust proxy for accurate IP addresses (important for rate limiting)
  app.set('trust proxy', true);

  // Apply security middleware early
  app.use(slowDownMiddleware);
  app.use(generalRateLimit);

  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'", "https://js.stripe.com", "https://checkout.stripe.com", "https://m.stripe.network"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "blob:", "data:", "https:", "https://images.unsplash.com", "https://*.stripe.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'", "https://checkout.stripe.com"],
        frameAncestors: ["'none'"],
        frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com", "https://checkout.stripe.com"],
        connectSrc: ["'self'", "https://peterlehocky.site", "https://api.stripe.com", "https://checkout.stripe.com", "https://m.stripe.network"],
        mediaSrc: ["'self'"],
        workerSrc: ["'self'"],
        childSrc: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: {
      policy: "same-origin"
    },
    crossOriginResourcePolicy: {
      policy: "same-origin"
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Advanced security headers for origin isolation
  app.use((_req, res, next) => {
    const isolationConfig = getOriginIsolationConfig();
    
    // Cross-Origin Opener Policy for process isolation
    const coopHeader = getCOOPHeader(isolationConfig.coop);
    if (coopHeader) {
      const headerName = isolationConfig.coop.reportOnly ? 'Cross-Origin-Opener-Policy-Report-Only' : 'Cross-Origin-Opener-Policy';
      res.setHeader(headerName, coopHeader);
    }
    
    // Cross-Origin Embedder Policy for advanced isolation (optional)
    const coepHeader = getCOEPHeader(isolationConfig.coep);
    if (coepHeader) {
      const headerName = isolationConfig.coep.reportOnly ? 'Cross-Origin-Embedder-Policy-Report-Only' : 'Cross-Origin-Embedder-Policy';
      res.setHeader(headerName, coepHeader);
    }
    
    // Cross-Origin Resource Policy for resource isolation
    res.setHeader('Cross-Origin-Resource-Policy', isolationConfig.corpPolicy);
    
    // Origin-Agent-Cluster header for additional process isolation
    if (isolationConfig.originAgentCluster) {
      res.setHeader('Origin-Agent-Cluster', '?1');
    }
    
    // Prevent embedding in frames from other origins
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer Policy for privacy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy to disable potentially dangerous features
    res.setHeader('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), autoplay=(), document-domain=()'
    );
    
    next();
  });

  // Global CORS configuration
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://peterlehocky.site',
    'https://www.peterlehocky.site'
  ].filter(Boolean); // Remove any undefined values

  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const apolloServer = new ApolloServer({
    schema,
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    graphqlRateLimit, // Apply GraphQL-specific rate limiting
    express.json({ limit: '10mb' }), // Limit request body size
    expressMiddleware(apolloServer, {
      context: createContext as any,
    }) as any
  );

  app.get('/health', (_: Request, res: Response) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  // Security violation reporting routes
  app.use('/api/security', securityRoutes);

  // Debug endpoint to check webhook configuration
  app.get('/debug/webhook', (_: Request, res: Response) => {
    res.json({
      webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
      stripe_key_configured: !!process.env.STRIPE_SECRET_KEY,
      webhook_endpoint: '/webhook/stripe',
      status: 'Webhook endpoint ready'
    });
  });

  // Stripe webhook endpoint (must be before express.json() middleware)
  app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    
    console.log(`Received Stripe webhook - Content-Length: ${req.get('Content-Length')}, Signature present: ${!!signature}`);
    
    if (!signature) {
      console.error('Missing Stripe signature header');
      return res.status(400).send('Missing signature');
    }

    try {
      // Verify webhook signature and get event
      const event = stripeWebhookHandler.verifyWebhookSignature(
        req.body.toString(),
        signature
      );

      console.log(`Webhook signature verified - Event: ${event.type} (${event.id})`);

      // Check if event was already processed (idempotency)
      const alreadyProcessed = await stripeWebhookHandler.isEventProcessed(event.id);
      if (alreadyProcessed) {
        console.log(`Event ${event.id} already processed, skipping`);
        return res.status(200).send('Event already processed');
      }

      console.log(`Processing new event: ${event.type} - ${event.id}`);

      // Handle the webhook event
      await stripeWebhookHandler.handleWebhookEvent(event);
      
      console.log(`Successfully processed webhook: ${event.type} - ${event.id}`);
      res.status(200).send('Webhook processed successfully');
    } catch (error) {
      console.error('Webhook processing failed:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
      res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Serve reservation access pages
  app.get('/reservation/:token', (req: Request, res: Response) => {
    // This would serve a simple HTML page for reservation management
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Manage Your Reservation</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <h1>Manage Your Reservation</h1>
          <p>Access token: ${req.params.token}</p>
          <p>This page would contain the reservation management interface.</p>
        </body>
      </html>
    `);
  });

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`📧 Reservation management at http://localhost:${PORT}/reservation/:token`);
    console.log(`🪝 Stripe webhooks at http://localhost:${PORT}/webhook/stripe`);
    console.log(`🔒 Security features active: Rate limiting, Input validation, CSP headers`);
    console.log(`📊 Logging: Security events logged to ./logs/security.log`);
    
    // Log successful server startup
    SecurityLoggerService.logSuccess({
      event: 'SERVER_STARTED_SUCCESSFULLY',
      severity: 'LOW',
      details: {
        port: PORT,
        nodeEnv: env.NODE_ENV,
        graphqlEndpoint: `/graphql`,
        securityFeatures: [
          'rate_limiting',
          'input_validation',
          'csp_headers',
          'security_logging',
          'environment_validation'
        ],
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    
    // Log shutdown event
    SecurityLoggerService.logSuccess({
      event: 'SERVER_SHUTDOWN_INITIATED',
      severity: 'LOW',
      details: {
        signal,
        timestamp: new Date().toISOString(),
      },
    });
    
    cronService.stop();
    
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
  cronService.stop();
  process.exit(1);
});