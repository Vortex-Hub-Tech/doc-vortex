# Overview

This is a full-stack project documentation system built with React on the frontend and Express.js on the backend. The application serves as a complete content management system for technical projects, allowing administrators to create, edit, and manage project documentation while providing a public-facing interface for users to browse published projects. The system features a clean, modern UI with markdown support for rich content creation and a comprehensive admin panel with multiple management areas.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **Routing**: Wouter for client-side routing with separate public and admin routes
- **UI Components**: shadcn/ui component library built on Radix UI primitives for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Markdown**: Custom markdown editor and renderer components for content creation

## Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Session-based authentication using express-session with PostgreSQL storage
- **File Structure**: Modular design with separate route handlers and storage abstraction layer

## Database Design
- **Users Table**: Stores admin credentials with bcrypt password hashing
- **Categories Table**: Organizes projects into different categories (IA, Automação, Bot, etc.)
- **Tools Table**: Represents specific tools/technologies used in projects
- **Projects Table**: Main content table with title, description, markdown content, and publication status
- **Project Images Table**: Stores project image metadata with ordering support

## Authentication & Authorization
- **Session Management**: Server-side sessions with PostgreSQL storage for persistence
- **Password Security**: bcrypt for password hashing with salt rounds
- **Route Protection**: Middleware-based authentication for admin routes
- **Public Access**: Unauthenticated access to published project content

## Content Management
- **Rich Text Editing**: Custom markdown editor with toolbar and live preview
- **Image Management**: Integration with Supabase Storage for file uploads
- **Draft/Publish Workflow**: Projects can be saved as drafts or published
- **SEO-Friendly URLs**: Slug-based routing for projects
- **Categories Management**: Complete CRUD operations for project categories
- **Tools Management**: Full management of technologies and tools used in projects
- **System Settings**: Admin configuration panel with statistics and backup functionality

## Development Tools
- **Build System**: Vite with TypeScript compilation and hot module replacement
- **Database Migrations**: Drizzle Kit for schema management and migrations
- **Code Quality**: TypeScript strict mode for type safety
- **Development Experience**: Auto-reload and error overlay for rapid iteration

# Recent Changes

## 2025-09-26: Complete Admin Panel Implementation
- ✅ **Categories Management**: Full CRUD operations with form validation and UI
- ✅ **Tools Management**: Complete tool management with category associations  
- ✅ **Settings Panel**: System statistics, backup/export functionality, and configuration
- ✅ **Dynamic Dashboard**: Section-based content rendering in admin panel
- ✅ **Enhanced Navigation**: Fully functional sidebar with all admin areas
- ✅ **Database Connectivity**: Fixed and optimized PostgreSQL connection using postgres-js driver
- ✅ **TypeScript Compliance**: Resolved all type errors across admin components

# External Dependencies

## Database
- **Neon Database**: PostgreSQL database hosting with connection pooling
- **Drizzle ORM**: TypeScript ORM for database operations and schema management
- **postgres-js**: High-performance PostgreSQL client for Node.js

## File Storage  
- **Supabase Storage**: Cloud storage service for project images and media files

## UI Framework
- **Radix UI**: Unstyled, accessible UI primitives for complex components including dialogs
- **Tailwind CSS**: Utility-first CSS framework for styling and responsive design
- **Lucide React**: Icon library for consistent iconography

## Authentication
- **bcrypt**: Password hashing library for secure credential storage
- **express-session**: Session middleware for user authentication state
- **connect-pg-simple**: PostgreSQL session store for persistent sessions

## Development
- **Replit Integration**: Vite plugins for development banner and error overlay
- **PostCSS**: CSS processing with autoprefixer for browser compatibility
- **Date-fns**: Date manipulation and formatting library with Portuguese locale support