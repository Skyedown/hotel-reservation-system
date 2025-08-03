# Hotel Reservation System - Frontend

A modern Next.js frontend for the hotel reservation system with TypeScript, Tailwind CSS, and Apollo GraphQL client.

## Features Implemented

### 🏨 **Guest Reservation System**
- **Advanced Search**: Date picker with validation and guest count selection
- **Room Display**: Grid layout with image galleries and detailed information
- **Multi-Room Booking**: Shopping cart system for group bookings
- **Room Details**: Modal with comprehensive room information and amenities
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### 👨‍💼 **Admin Dashboard**
- **Secure Login**: JWT-based authentication for staff members
- **Dashboard Overview**: Statistics and recent reservations
- **Reservation Management**: View and manage all bookings
- **Room Management**: Interface for updating room information

### 🛠 **Technical Features**
- **GraphQL Integration**: Apollo Client with optimistic updates
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Lucide React icons and custom components
- **Form Handling**: React Hook Form with validation
- **Date Management**: react-datepicker with date-fns utilities

## Project Structure

```
frontend/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── components/          # Apollo wrapper
│   │   ├── admin/              # Admin login and dashboard
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base UI components
│   │   ├── reservation/        # Search and booking components
│   │   ├── room/              # Room display components
│   │   └── cart/              # Shopping cart components
│   └── lib/                   # Utilities and configuration
│       ├── graphql/           # GraphQL queries and mutations
│       ├── apollo-client.ts   # Apollo Client setup
│       ├── types.ts           # TypeScript type definitions
│       └── utils.ts           # Helper functions
```

## Pages and Components

### **Homepage (`/`)**
- Hero section with search form
- Room search results with filters
- Multi-room selection cart
- Mobile-responsive design

### **Admin Login (`/admin`)**
- Secure staff authentication
- Form validation and error handling
- Demo credentials for testing

### **Admin Dashboard (`/admin/dashboard`)**
- Reservation statistics overview
- Recent bookings list
- Room management shortcuts
- Staff user profile

## Key Components

### **SearchForm**
```typescript
// Date picker with validation
<SearchForm 
  onSearch={handleSearch} 
  isLoading={loading} 
/>
```

### **RoomCard**
```typescript
// Room display with booking functionality
<RoomCard 
  room={room}
  checkIn={checkIn}
  checkOut={checkOut}
  guests={guests}
  onViewDetails={handleViewDetails}
  onAddToCart={handleAddToCart}
  isInCart={isInCart}
/>
```

### **CartSidebar**
```typescript
// Multi-room booking cart
<CartSidebar
  cartItems={cartItems}
  isOpen={isCartOpen}
  onClose={() => setIsCartOpen(false)}
  onRemoveItem={handleRemoveFromCart}
  onProceedToCheckout={handleProceedToCheckout}
/>
```

## GraphQL Integration

### **Queries**
- `GET_AVAILABLE_ROOMS` - Search available rooms
- `GET_ROOM_DETAILS` - Individual room information
- `GET_ALL_RESERVATIONS` - Admin reservation list
- `VERIFY_ADMIN_TOKEN` - Authentication validation

### **Mutations**
- `CREATE_RESERVATION` - New booking creation
- `ADMIN_LOGIN` - Staff authentication
- `UPDATE_RESERVATION_STATUS` - Booking management

## Environment Configuration

```env
# GraphQL API URL
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql

# Base URL for the frontend
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Stripe Public Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

## Running the Application

### Development Mode
```bash
cd frontend
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run lint
```

## Responsive Design

### **Mobile First Approach**
- Tailwind CSS breakpoints
- Touch-friendly interfaces
- Optimized image loading
- Accessible navigation

### **Screen Sizes**
- **Mobile**: Single column layout
- **Tablet**: Two-column room grid
- **Desktop**: Three-column room grid
- **Large**: Full dashboard layout

## Form Validation

### **Search Form**
- Date range validation
- Guest count limits (1-10)
- Future date requirements
- Check-out after check-in

### **Admin Login**
- Email format validation
- Password strength requirements
- Error message display
- Loading states

## State Management

### **Local State**
- Search parameters
- Cart items
- Modal visibility
- User authentication

### **Apollo Cache**
- Room availability data
- Reservation information
- Optimistic updates
- Error boundaries

## User Experience Features

### **Loading States**
- Skeleton screens for room loading
- Button loading indicators
- Progressive image loading
- Smooth transitions

### **Error Handling**
- Network error detection
- GraphQL error messages
- Form validation feedback
- Fallback UI components

### **Accessibility**
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA labels

## Next Steps

### **Pending Features**
1. **Reservation Order Form** - Complete booking process with payment
2. **Room Management Interface** - Full CRUD operations for staff
3. **Email Confirmation System** - Integration with backend email service
4. **Advanced Filtering** - Room type, price range, amenities
5. **Booking History** - Guest reservation tracking

### **Enhancement Opportunities**
- Real-time availability updates
- Advanced date range selection
- Room recommendation engine
- Multi-language support
- Progressive Web App features

## Testing

### **Component Testing**
```bash
# Future implementation
npm run test
```

### **E2E Testing**
```bash
# Future implementation
npm run test:e2e
```

## Deployment

### **Vercel Deployment**
```bash
npm install -g vercel
vercel
```

### **Docker Deployment**
```dockerfile
# Dockerfile included in project
docker build -t hotel-frontend .
docker run -p 3000:3000 hotel-frontend
```

This frontend provides a complete, modern interface for the hotel reservation system with excellent user experience and full administrative capabilities.