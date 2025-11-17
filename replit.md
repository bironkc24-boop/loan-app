# QuickLoan - Full-Stack Loan Management System

## Overview

QuickLoan is a comprehensive loan management application built with:
- **Frontend**: React Native Expo (web mode) with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Multi-role system (Borrower, Admin, Rider)

## Project Structure

```
quickloan/
├── frontend/           # React Native Expo web application
│   ├── app/           # Application screens/pages
│   ├── contexts/      # React contexts (Auth, etc.)
│   ├── lib/           # API client and utilities
│   └── types/         # TypeScript type definitions
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── config/    # Configuration and Supabase setup
│   │   ├── controllers/ # Business logic for routes
│   │   ├── middleware/  # Auth and error handling
│   │   ├── routes/    # API route definitions
│   │   └── types/     # TypeScript types
│   └── dist/          # Compiled JavaScript (production)
└── schema.sql         # Database schema with RLS policies
```

## Current State

The project has been configured to run in the Replit environment:

✅ **Dependencies installed** for all packages
✅ **Frontend workflow** configured on port 5000 with webview
✅ **Webpack configured** with `allowedHosts: 'all'` for Replit proxy
✅ **Environment files** created and configured
✅ **Deployment settings** configured for production
✅ **Static file serving** added for production builds

## Environment Setup

### Required Secrets

Before the application can fully function, you need to configure Supabase:

1. **Create a Supabase Project** at https://supabase.com
2. **Run the database schema** (schema.sql) in Supabase SQL Editor
3. **Get your credentials** from Supabase Settings → API:
   - Project URL
   - anon/public key
   - service_role key

4. **Update environment files**:

   **backend/.env**:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_public_key
   ```

   **frontend/.env**:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
   ```

## Features

### User Roles

- **Borrower** (default): Apply for loans, upload documents, track status
- **Admin**: Review applications, approve/reject loans, manage riders
- **Rider**: Field verification, document collection, status updates

### API Endpoints

- `/api/auth` - Authentication (register, login)
- `/api/loans` - Borrower loan operations
- `/api/admin` - Admin operations (loan management, rider CRUD)
- `/api/rider` - Rider operations (assignments, status updates)
- `/api/users` - User profile management
- `/api/notifications` - User notifications

## Running the Application

The frontend workflow is already configured and running on port 5000.

To access the application:
1. Click the "Webview" tab to see the frontend
2. The frontend will connect to the backend API once Supabase is configured

## Development Notes

- Frontend runs on port 5000 (0.0.0.0) with Expo
- Backend should run on port 3001 (localhost) when needed
- Webpack configured to allow all hosts for Replit proxy environment
- Metro bundler configured with no-cache headers for development

## Deployment

The project is configured for autoscale deployment:
- **Build**: Compiles backend TypeScript and exports frontend static files
- **Run**: Serves API and static files from a single Express server
- Frontend static files are served from `/backend/dist/public` in production

## Documentation

See the following files for more information:
- `SETUP_GUIDE.md` - Detailed setup instructions
- `FEATURES.md` - Feature documentation
- `schema.sql` - Complete database schema
- `SYSTEM_ANALYSIS.md` - System architecture overview

## Next Steps

1. **Configure Supabase** - Add credentials to .env files
2. **Restart workflows** - Ensure both frontend and backend are running
3. **Create admin user** - Follow SETUP_GUIDE.md to create your first admin
4. **Test the application** - Sign up, apply for loans, test features

## User Preferences

(No user preferences have been set yet)
