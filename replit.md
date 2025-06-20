# Replit Project Guide

## Overview

This is a donation platform called "DonVie" that connects users with charitable associations. The application allows users to browse associations, make donations, register new associations, and track donation history. It's built as a mobile-first web application with a React frontend and Express.js backend.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js 20
- **Development**: tsx for TypeScript execution in development
- **Production Build**: esbuild for server bundling

### Data Layer
- **Database**: PostgreSQL with persistent storage
- **ORM**: Drizzle ORM for type-safe database operations
- **Connection**: Neon Database with WebSocket support
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Validation**: Zod for runtime type validation
- **Seeding**: Automatic database seeding with sample associations

## Key Components

### Database Schema
The application uses two main entities:
- **Associations**: Charitable organizations with verification status, contact info, and donation statistics
- **Donations**: Individual donation records linking donors to associations

### API Structure
RESTful API endpoints include:
- `GET /api/associations` - List all associations
- `GET /api/associations/:id` - Get specific association
- `GET /api/associations/search/:query` - Search associations
- `GET /api/associations/category/:category` - Filter by category
- `POST /api/associations` - Register new association
- `POST /api/donations` - Create new donation
- `GET /api/donations/email/:email` - Get donations by email
- `GET /api/donations/:id/receipt` - Get tax receipt data for PDF generation

### Frontend Pages
- **Home**: Browse and search associations with category filtering
- **Association Detail**: Detailed view with donation button
- **Donation Flow**: Multi-step donation process with form validation and instant tax receipt generation
- **Register Association**: Form for new association registration
- **Donation History**: Track personal donation history with downloadable tax receipts

### Mobile-First Design
- Responsive layout optimized for mobile devices
- Sticky header with brand identity
- Bottom navigation tabs
- Floating action button for quick donations
- Touch-friendly UI components

## Data Flow

1. **Association Browsing**: Users browse associations fetched from the API, with real-time search and filtering
2. **Donation Process**: Three-step flow (amount selection, donor info, payment) with form validation
3. **Data Persistence**: All data stored in PostgreSQL with automatic statistics updates
4. **State Management**: TanStack Query handles caching, background updates, and optimistic updates

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **class-variance-authority**: Type-safe variant API

### Forms and Validation
- **React Hook Form**: Performant form handling
- **Zod**: Schema validation for TypeScript
- **@hookform/resolvers**: Zod integration for forms

### Development Tools
- **Replit Integration**: Custom plugins for development environment
- **PostCSS**: CSS processing with autoprefixer
- **ESBuild**: Fast JavaScript bundler

## Deployment Strategy

### Development Environment
- Replit-hosted with live reload
- PostgreSQL instance provisioned automatically
- Environment variables managed through Replit secrets

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: ESBuild bundles server code with external dependencies
- Database: Drizzle migrations applied via `npm run db:push`

### Environment Configuration
- Development: `npm run dev` starts both frontend and backend
- Production: `npm run build` then `npm run start`
- Database migrations: `npm run db:push` applies schema changes

The application uses a modern full-stack TypeScript architecture with emphasis on type safety, performance, and mobile user experience. The storage layer includes both in-memory implementation for development and PostgreSQL for production, with Drizzle ORM providing the abstraction layer.

## Changelog

```
Changelog:
- June 19, 2025. Initial setup
- June 19, 2025. Added tax receipt generation system with PDF download functionality
- June 19, 2025. Migrated from in-memory storage to PostgreSQL database with persistent data
- June 19, 2025. Implemented Replit Auth system with user authentication and personal spaces
- June 19, 2025. Modified donation flow to skip personal info step for authenticated users
- June 19, 2025. Added Google and Apple Auth support with proper error handling
- June 19, 2025. Fixed donation receipt generation and amount display issues
- June 19, 2025. Redesigned navigation with single bottom bar for mobile-first experience
- June 19, 2025. Created unified authentication page for both donors and associations
- June 19, 2025. Simplified interface with context-aware navigation tabs
- June 19, 2025. Implemented user type system (donor vs association) with specialized interfaces
- June 19, 2025. Added onboarding flow for user type selection and association registration
- June 19, 2025. Created association dashboard with donation tracking and campaign management
- June 19, 2025. Added QR code generation feature for associations with customizable parameters
- June 19, 2025. Implemented QR code scanner for donors with camera access and URL parsing
- June 19, 2025. Enhanced donation flow to support QR code parameters (amount, campaign)
- June 19, 2025. Implemented complete email/password authentication system independent of Replit Auth
- June 19, 2025. Added password hashing with bcryptjs and session management for email/password users
- June 19, 2025. Modified all protected routes to support both Replit Auth and email/password sessions
- June 19, 2025. Fixed session configuration for development environment and added explicit session saving
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```