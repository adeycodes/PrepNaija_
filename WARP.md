# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

PrepNaija is a Nigerian exam preparation platform for JAMB, WAEC, and NECO exams. It's a full-stack TypeScript application with React frontend, Express backend, PostgreSQL database, and AI-powered question generation and explanations.

## Development Commands

### Primary Development
- `npm run dev` - Start backend server with hot reload (runs on port 5000)
- `npm run dev:front` - Start frontend dev server only (Vite)
- `npm run build` - Build both frontend and backend for production
- `npm start` - Run production build

### Database Management
- `npm run db:push` - Push database schema changes using Drizzle Kit
- Database migrations are stored in `./migrations/` directory
- Schema is defined in `./shared/schema.ts`

### Type Checking
- `npm run check` - Run TypeScript type checking across the entire codebase

### Environment Setup
The application requires a `.env` file with:
- `DATABASE_URL` - PostgreSQL connection string (required)
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `REPLIT_DB_URL` - Replit database URL (if using Replit)
- SMS service credentials for notifications

## Architecture Overview

### Monorepo Structure
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and database schema
- `attached_assets/` - Static assets and uploads

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL
- **Schema**: Type-safe schema definitions in `shared/schema.ts`
- **Key Tables**: users, profiles, questions, quizSessions, userProgress, achievements, smsNotifications
- **Sessions**: PostgreSQL-based session storage for authentication

### Frontend Architecture (Client)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query for server state, React hooks for local state
- **UI**: Tailwind CSS + shadcn/ui components (Radix UI primitives)
- **Build Tool**: Vite with React plugin
- **Key Pages**: Landing, Dashboard, Quiz, Results, Profile

### Backend Architecture (Server)
- **Runtime**: Node.js with Express.js
- **Authentication**: Replit Auth integration with session management
- **API**: RESTful endpoints with JSON responses
- **Services**: Modular services for questions, OpenAI, SMS
- **Storage**: Database abstraction layer in `storage.ts`

### Key Services Integration

#### OpenAI Service (`server/services/openaiService.ts`)
- Uses GPT-5 model for question explanations and variations
- Generates contextual explanations with Nigerian educational context
- Creates question variations for dynamic content expansion
- Structured JSON responses with explanations, key points, and study tips

#### Question Service (`server/services/questionService.ts`)
- Manages quiz question retrieval and generation
- Supports 5 subjects: Mathematics, English, Physics, Chemistry, Biology
- Supports 3 exam types: JAMB, WAEC, NECO
- Automatically generates additional questions using AI when needed
- Includes comprehensive seed data for initial questions

#### SMS Service
- Termii SMS API integration for Nigerian phone numbers
- Study reminders and achievement notifications
- Progress tracking and engagement features

### Path Aliases
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

## Key Features Implementation

### Quiz Engine
- Random question selection by subject
- Timer-based quiz sessions with automatic submission
- Real-time answer tracking and immediate feedback
- Progress persistence and session recovery

### AI-Powered Learning
- GPT-5 powered explanations for incorrect answers
- Dynamic question generation based on existing content
- Nigerian educational context and examples
- Difficulty level matching and topic consistency

### Progress Tracking
- Khan Academy-inspired mastery system with energy points
- Subject-wise performance analytics
- Achievement system for gamification
- Historical progress data and trend analysis

### Offline Functionality
- IndexedDB caching for offline question access
- Automatic sync when connection is restored
- Progressive enhancement for network issues

## Development Guidelines

### Database Changes
1. Modify schema in `shared/schema.ts`
2. Generate migrations: `npm run db:push`
3. Update related types and service methods
4. Test with existing data

### Adding New Features
1. Update database schema if needed (shared/schema.ts)
2. Add/modify backend routes and services (server/)
3. Create/update frontend components and pages (client/src/)
4. Update shared types and API contracts

### Testing AI Features
- Requires valid OpenAI API key in environment
- Uses GPT-5 model specifically (not GPT-4 or GPT-3.5)
- Test with Nigerian educational context
- Verify JSON response format compliance

### SMS Integration
- Test with valid Nigerian phone numbers
- Check Termii API credentials and balance
- Verify message delivery status tracking

### Component Development
- Use shadcn/ui components from `client/src/components/ui/`
- Follow Tailwind CSS utility-first approach
- Maintain mobile-first responsive design
- Use TypeScript interfaces for all props

## File Structure Patterns
- Database models: `shared/schema.ts`
- API routes: `server/routes/`
- Services: `server/services/`
- Frontend components: `client/src/components/`
- Pages: `client/src/pages/`
- Utilities: `client/src/lib/` and `client/src/utils/`
- Types: `client/src/types/`

## Communication Style
Use simple, everyday language in all user-facing content and error messages, following the preference specified in the project documentation.
