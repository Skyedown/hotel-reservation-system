import express, { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import dotenv from 'dotenv';
import { typeDefs } from './types/typeDefs';
import { resolvers } from './resolvers';
import { createContext } from './context';
import { connectDatabase } from './config/prisma';
import { stripeWebhookHandler } from './services/stripeWebhook';
import { cronService } from './services/cronService';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 4000;

  // Connect to database
  await connectDatabase();

  // Start cron services
  cronService.start();

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
    cors(),
    express.json(),
    expressMiddleware(apolloServer, {
      context: createContext as any,
    }) as any
  );

  app.get('/health', (_: Request, res: Response) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

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
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    
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