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
const dotenv_1 = __importDefault(require("dotenv"));
const typeDefs_1 = require("./types/typeDefs");
const resolvers_1 = require("./resolvers");
const context_1 = require("./context");
const prisma_1 = require("./config/prisma");
const stripeWebhook_1 = require("./services/stripeWebhook");
const cronService_1 = require("./services/cronService");
dotenv_1.default.config();
async function startServer() {
    const app = (0, express_1.default)();
    const PORT = process.env.PORT || 4000;
    // Connect to database
    await (0, prisma_1.connectDatabase)();
    // Start cron services
    cronService_1.cronService.start();
    const schema = (0, schema_1.makeExecutableSchema)({
        typeDefs: typeDefs_1.typeDefs,
        resolvers: resolvers_1.resolvers,
    });
    const apolloServer = new server_1.ApolloServer({
        schema,
    });
    await apolloServer.start();
    app.use('/graphql', (0, cors_1.default)(), express_1.default.json(), (0, express4_1.expressMiddleware)(apolloServer, {
        context: context_1.createContext,
    }));
    app.get('/health', (_, res) => {
        res.json({ status: 'OK', message: 'Server is running' });
    });
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
    });
    // Graceful shutdown
    const shutdown = (signal) => {
        console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
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