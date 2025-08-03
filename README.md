# Hotel Reservation System

A modern hotel reservation system built with Next.js, Node.js, GraphQL, PostgreSQL, and Stripe integration.

## Features

- **Email-based Reservations**: No user registration required - guests receive email links to manage reservations
- **Admin Dashboard**: Staff and admin users can manage rooms and reservations
- **Stripe Integration**: Secure payment processing
- **Real-time Availability**: Check room availability for specific dates
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Frontend
- Next.js 15 with TypeScript
- Tailwind CSS for styling
- Apollo Client for GraphQL

### Backend
- Node.js with Express
- Apollo Server (GraphQL)
- Prisma ORM
- PostgreSQL database
- JWT authentication (admin only)
- Stripe for payments

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hotel-system
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

3. **Configure environment variables**
   Edit `backend/.env` with your database and API credentials:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/hotel_system?schema=public"
   JWT_SECRET=your-super-secret-jwt-key
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

4. **Set up the database**
   ```bash
   # Run migrations
   npm run db:migrate
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

6. **Start development servers**
   ```bash
   # Backend (from backend directory)
   npm run dev
   
   # Frontend (from frontend directory, in another terminal)
   npm run dev
   ```

### Using Docker

Alternatively, you can use Docker to run the entire stack:

```bash
# From the root directory
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Backend API on port 4000
- Frontend on port 3000

## Default Admin Account

After seeding, you can log in to the admin dashboard with:
- **Email**: admin@hotel.com
- **Password**: admin123

## API Endpoints

- **GraphQL Playground**: http://localhost:4000/graphql
- **Health Check**: http://localhost:4000/health
- **Reservation Management**: http://localhost:4000/reservation/:token

## Database Schema

The system uses the following main entities:

- **Admin**: Staff and admin users with authentication
- **Room**: Hotel rooms with different types and pricing
- **Reservation**: Guest reservations with email-based access
- **Payment**: Stripe payment records

## Reservation Flow

1. Guest selects dates and room on the website
2. Guest fills in contact information
3. System creates reservation with unique access token
4. Guest receives email with reservation management link
5. Guest can pay, modify, or cancel reservation via the link
6. Admin can view and manage all reservations

## Development Commands

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Apollo        │    │   PostgreSQL    │
│   Frontend      │◄──►│   GraphQL API   │◄──►│   Database      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Stripe API    │
                       │   Payments      │
                       └─────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.