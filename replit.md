# Overview

PrepNaija is a Nigerian exam preparation platform designed to help students prepare for JAMB, WAEC, and NECO exams. The application features a comprehensive quiz engine, progress tracking, offline functionality, SMS notifications, and AI-powered explanations. Built as a full-stack application with React frontend and Express backend, it provides an interactive learning experience with Khan Academy-style mastery tracking.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Styling**: Tailwind CSS with shadcn/ui components for consistent, mobile-first responsive design
- **State Management**: React Query for server state management, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with session management
- **API Design**: RESTful endpoints with credential-based authentication

## Database Design
- **ORM**: Drizzle with PostgreSQL dialect for schema management and migrations
- **Schema**: Modular design with separate tables for users, profiles, questions, quiz sessions, progress tracking, and achievements
- **Session Storage**: PostgreSQL-based session storage for authentication persistence

## Key Features Architecture

### Quiz Engine
- **Question Management**: Random question selection with difficulty levels and subject categorization
- **Timer System**: Client-side countdown with automatic submission
- **Answer Tracking**: Real-time answer capture with immediate feedback

### Progress Tracking
- **Mastery System**: Khan Academy-inspired progress tracking with energy points
- **Performance Analytics**: Subject-wise performance metrics and trend analysis
- **Achievement System**: Gamification elements to encourage continued learning

### Offline Functionality
- **IndexedDB Caching**: Local storage of questions for offline practice
- **Cache Management**: Automatic expiration and sync mechanisms
- **Progressive Enhancement**: Graceful degradation when offline

### AI Integration
- **OpenAI Integration**: GPT-powered explanations for incorrect answers
- **Contextual Help**: Subject-specific explanations with Nigerian educational context
- **Error Handling**: Fallback mechanisms for AI service unavailability

# External Dependencies

## Database and Infrastructure
- **Neon Database**: PostgreSQL hosting with serverless architecture
- **Drizzle Kit**: Database migrations and schema management

## Authentication and Security
- **Replit Auth**: OAuth-based authentication with session management
- **Express Session**: Session persistence with PostgreSQL store

## Third-Party Services
- **OpenAI API**: GPT models for generating question explanations and educational content
- **Termii SMS API**: Nigerian SMS service for study reminders and notifications

## Frontend Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **React Hook Form**: Form state management with validation
- **React Query**: Server state management with caching and synchronization
- **Axios**: HTTP client for API requests

## Development Tools
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast JavaScript bundling for production builds
- **Tailwind CSS**: Utility-first CSS framework with design system
- **PostCSS**: CSS processing with autoprefixer support