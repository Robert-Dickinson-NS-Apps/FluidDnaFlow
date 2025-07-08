# Fluid Dynamics Simulation Application

## Overview

This is a full-stack web application that simulates fluid flow around DNA molecules using the Lattice-Boltzmann method. The application features an interactive React frontend with real-time visualization and an Express.js backend designed for potential future API endpoints and database integration.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with shadcn/ui component library
- **Build Tool**: Vite with hot module replacement
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with custom theming

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: Prepared for connect-pg-simple
- **Development**: Hot reload with tsx

### Project Structure
- `client/` - React frontend application
- `server/` - Express.js backend server
- `shared/` - Common TypeScript schemas and types
- `components.json` - shadcn/ui configuration

## Key Components

### Simulation Engine
- **Lattice-Boltzmann Method**: D2Q9 implementation for 2D incompressible flow simulation
- **DNA Geometry Generator**: Configurable DNA molecule shapes with varying complexity
- **Real-time Visualization**: Canvas-based rendering with velocity fields, streamlines, and pressure visualization

### User Interface
- **Control Panel**: Interactive sliders and inputs for simulation parameters (Reynolds number, viscosity, velocity)
- **Simulation Canvas**: Real-time fluid flow visualization with multiple rendering modes
- **Educational Panel**: Contextual information about fluid dynamics phenomena
- **Performance Metrics**: Real-time display of simulation statistics

### Data Models
- **User Schema**: Basic user authentication structure (id, username, password)
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development

## Data Flow

1. **User Interaction**: Parameter changes in the control panel update simulation state
2. **Simulation Loop**: Lattice-Boltzmann solver updates fluid distribution functions
3. **Visualization**: Canvas renderer displays velocity fields, streamlines, and pressure data
4. **Performance Tracking**: Metrics calculator monitors FPS and flow characteristics

## External Dependencies

### Frontend Libraries
- `@tanstack/react-query` - Server state management
- `@radix-ui/*` - Accessible UI primitives
- `class-variance-authority` - Component variant management
- `cmdk` - Command palette functionality
- `date-fns` - Date manipulation utilities
- `embla-carousel-react` - Carousel component
- `lucide-react` - Icon library
- `wouter` - Lightweight routing

### Backend Libraries
- `drizzle-orm` - Type-safe database ORM
- `drizzle-zod` - Schema validation
- `@neondatabase/serverless` - Serverless PostgreSQL driver
- `connect-pg-simple` - PostgreSQL session store
- `express` - Web application framework

### Development Tools
- `vite` - Frontend build tool and dev server
- `tailwindcss` - CSS framework
- `typescript` - Static type checking
- `tsx` - TypeScript execution for development

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React app to `dist/public/`
2. **Backend Build**: esbuild bundles Express server to `dist/`
3. **Database Migration**: Drizzle pushes schema changes to PostgreSQL

### Production Setup
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **Static Assets**: Frontend built files served by Express
- **Database**: Neon Database for managed PostgreSQL hosting

### Development Workflow
- **Hot Reload**: Both frontend (Vite) and backend (tsx) support hot reloading
- **Database Schema**: Drizzle migrations in `migrations/` directory
- **Type Safety**: Shared schemas ensure consistency between frontend and backend

## Changelog
- July 08, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.