"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@as-integrations/express4");
const schema_1 = require("@graphql-tools/schema");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const typeDefs_1 = require("./types/typeDefs");
const resolvers_1 = require("./resolvers");
const context_1 = require("./context");
const prisma_1 = require("./config/prisma");
const stripeWebhook_1 = require("./services/stripeWebhook");
const cronService_1 = require("./services/cronService");
const environment_1 = require("./config/environment");
const securityLogger_1 = require("./services/securityLogger");
const rateLimitService_1 = require("./services/rateLimitService");
const coopConfig_1 = require("./config/coopConfig");
const security_1 = __importDefault(require("./routes/security"));
// Load and validate environment variables
dotenv_1.default.config();
(0, environment_1.performSecurityChecks)();
(0, environment_1.validateRuntimeConfig)();
// Validate origin isolation compatibility
const isolationCompatibility = (0, coopConfig_1.validateOriginIsolationCompatibility)();
if (!isolationCompatibility.compatible) {
    console.warn('⚠️ Origin isolation compatibility warnings:');
    isolationCompatibility.warnings.forEach(warning => console.warn(`  • ${warning}`));
}
if (isolationCompatibility.recommendations.length > 0) {
    console.log('💡 Origin isolation recommendations:');
    isolationCompatibility.recommendations.forEach(rec => console.log(`  • ${rec}`));
}
async function startServer() {
    const app = (0, express_1.default)();
    const PORT = environment_1.env.PORT;
    // Log server startup
    securityLogger_1.SecurityLoggerService.logSuccess({
        event: 'SERVER_STARTUP_INITIATED',
        severity: 'LOW',
        details: {
            port: PORT,
            nodeEnv: environment_1.env.NODE_ENV,
            timestamp: new Date().toISOString(),
        },
    });
    // Connect to database
    await (0, prisma_1.connectDatabase)();
    // Start cron services
    cronService_1.cronService.start();
    // Trust proxy for accurate IP addresses (important for rate limiting)
    app.set('trust proxy', true);
    // Apply security middleware early
    app.use(rateLimitService_1.slowDownMiddleware);
    app.use(rateLimitService_1.generalRateLimit);
    // Security headers with Helmet
    app.use((0, helmet_1.default)({
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
    app.use((req, res, next) => {
        const isolationConfig = (0, coopConfig_1.getOriginIsolationConfig)();
        // Cross-Origin Opener Policy for process isolation
        const coopHeader = (0, coopConfig_1.getCOOPHeader)(isolationConfig.coop);
        if (coopHeader) {
            const headerName = isolationConfig.coop.reportOnly ? 'Cross-Origin-Opener-Policy-Report-Only' : 'Cross-Origin-Opener-Policy';
            res.setHeader(headerName, coopHeader);
        }
        // Cross-Origin Embedder Policy for advanced isolation (optional)
        const coepHeader = (0, coopConfig_1.getCOEPHeader)(isolationConfig.coep);
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
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), autoplay=(), document-domain=()');
        next();
    });
    // Global CORS configuration
    const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'https://peterlehocky.site',
        'https://www.peterlehocky.site'
    ].filter(Boolean); // Remove any undefined values
    app.use((0, cors_1.default)({
        origin: allowedOrigins,
        credentials: true
    }));
    const schema = (0, schema_1.makeExecutableSchema)({
        typeDefs: typeDefs_1.typeDefs,
        resolvers: resolvers_1.resolvers,
    });
    const apolloServer = new server_1.ApolloServer({
        schema,
    });
    await apolloServer.start();
    app.use('/graphql', rateLimitService_1.graphqlRateLimit, // Apply GraphQL-specific rate limiting
    express_1.default.json({ limit: '10mb' }), // Limit request body size
    (0, express4_1.expressMiddleware)(apolloServer, {
        context: context_1.createContext,
    }));
    app.get('/health', (_, res) => {
        res.json({ status: 'OK', message: 'Server is running' });
    });
    // Security violation reporting routes
    app.use('/api/security', security_1.default);
    // Debug endpoint to check webhook configuration
    app.get('/debug/webhook', (_, res) => {
        res.json({
            webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
            stripe_key_configured: !!process.env.STRIPE_SECRET_KEY,
            webhook_endpoint: '/webhook/stripe',
            status: 'Webhook endpoint ready'
        });
    });
    // Stripe webhook endpoint (must be before express.json() middleware)
    app.post('/webhook/stripe', express_1.default.raw({ type: 'application/json' }), async (req, res) => {
        const signature = req.headers['stripe-signature'];
        console.log(`Received Stripe webhook - Content-Length: ${req.get('Content-Length')}, Signature present: ${!!signature}`);
        if (!signature) {
            console.error('Missing Stripe signature header');
            return res.status(400).send('Missing signature');
        }
        try {
            // Verify webhook signature and get event
            const event = stripeWebhook_1.stripeWebhookHandler.verifyWebhookSignature(req.body.toString(), signature);
            console.log(`Webhook signature verified - Event: ${event.type} (${event.id})`);
            // Check if event was already processed (idempotency)
            const alreadyProcessed = await stripeWebhook_1.stripeWebhookHandler.isEventProcessed(event.id);
            if (alreadyProcessed) {
                console.log(`Event ${event.id} already processed, skipping`);
                return res.status(200).send('Event already processed');
            }
            console.log(`Processing new event: ${event.type} - ${event.id}`);
            // Handle the webhook event
            await stripeWebhook_1.stripeWebhookHandler.handleWebhookEvent(event);
            console.log(`Successfully processed webhook: ${event.type} - ${event.id}`);
            res.status(200).send('Webhook processed successfully');
        }
        catch (error) {
            console.error('Webhook processing failed:', error);
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
            res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });
    // Serve reservation access pages
    app.get('/reservation/:token', (req, res) => {
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
        securityLogger_1.SecurityLoggerService.logSuccess({
            event: 'SERVER_STARTED_SUCCESSFULLY',
            severity: 'LOW',
            details: {
                port: PORT,
                nodeEnv: environment_1.env.NODE_ENV,
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
    const shutdown = (signal) => {
        console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
        // Log shutdown event
        securityLogger_1.SecurityLoggerService.logSuccess({
            event: 'SERVER_SHUTDOWN_INITIATED',
            severity: 'LOW',
            details: {
                signal,
                timestamp: new Date().toISOString(),
            },
        });
        cronService_1.cronService.stop();
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
    cronService_1.cronService.stop();
    process.exit(1);
});
//# sourceMappingURL=index.js.map