# QuickLoan - Full-Stack Loan Management System

## Overview

QuickLoan is a comprehensive full-stack loan management system built with:
- **Frontend**: React Native + Expo (Web, iOS, Android)
- **Backend**: Express.js + TypeScript + Node.js
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth + JWT

## Current State

### ✅ Completed Setup
- Dependencies installed for both frontend and backend
- Workflows configured:
  - **Frontend**: Running on port 5000 (Expo web)
  - **Backend**: Running on port 3001 (Express API)
- CORS configured for Replit environment
- Cache control headers added for proper preview functionality
- Environment files created with Replit-specific configuration

### ⏳ Required Setup Steps

**IMPORTANT**: The system requires Supabase credentials to function:

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and create a free account
   - Create a new project (takes 2-3 minutes)
   - Note your project credentials

2. **Set Up Database**:
   - In Supabase, go to SQL Editor
   - Copy the contents of `schema.sql` from this project
   - Paste and run in Supabase SQL Editor
   - This creates all tables, RLS policies, and functions

3. **Add Secrets in Replit**:
   - Get credentials from Supabase Settings → API:
     - `SUPABASE_URL` (your project URL)
     - `SUPABASE_SERVICE_KEY` (service_role key - keep secret!)
     - `SUPABASE_ANON_KEY` (anon public key)
   - Also add to frontend environment:
     - `EXPO_PUBLIC_SUPABASE_URL`
     - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Project Structure

```
quickloan/
├── backend/               # Express.js API server
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   └── types/        # TypeScript types
│   └── package.json
├── frontend/             # React Native Expo app
│   ├── app/             # Expo Router screens
│   ├── contexts/        # React contexts
│   ├── lib/             # API & Supabase clients
│   ├── utils/           # Utility functions
│   └── package.json
└── schema.sql           # Database schema
```

## Features

### Multi-Role System
1. **Borrower** (default role):
   - Apply for loans
   - Upload documents
   - Track loan status
   - View loan history

2. **Admin**:
   - Review loan applications
   - Approve/reject loans
   - Manage riders
   - Assign riders to loan verifications
   - View system metrics

3. **Rider** (field agent):
   - View assigned loan verifications
   - Update verification status
   - Upload verification documents
   - Manage availability

### API Endpoints

```
/api/auth/*       - Authentication (public)
/api/loans/*      - Borrower loans (requires auth)
/api/admin/*      - Admin operations (requires admin role)
/api/rider/*      - Rider operations (requires rider role)
```

## Security

- Row Level Security (RLS) on all database tables
- Role-based access control
- JWT token validation
- Service role separation (backend uses privileged access)
- CORS protection
- Rate limiting
- Password hashing via Supabase Auth

## Development

### Running Locally
Both workflows should start automatically:
- Frontend: `cd frontend && npm run web` (port 5000)
- Backend: `cd backend && npm run dev` (port 3001)

### Environment Variables

**Backend** (`backend/.env`):
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_KEY=<your-service-key>
SUPABASE_ANON_KEY=<your-anon-key>
JWT_SECRET=<generated-secret>
FRONTEND_URL=*
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf
```

**Frontend** (`frontend/.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
EXPO_PUBLIC_API_URL=https://<replit-domain>:3001/api
```

## User Preferences

None set yet.

## Recent Changes

- **2025-11-12**: Initial Replit environment setup
  - Installed all dependencies
  - Configured workflows for frontend (port 5000) and backend (port 3001)
  - Updated CORS to allow Replit proxy
  - Added cache control headers to Metro config
  - Created environment files
  - Updated .gitignore for Node.js/TypeScript/Expo project

## Next Steps

1. User needs to provide Supabase credentials
2. Create admin user in Supabase
3. Test authentication flow
4. Complete frontend UI screens (login, register, dashboards)

## Documentation

- `SETUP_GUIDE.md` - Comprehensive setup instructions
- `FEATURES.md` - Detailed feature documentation
- `schema.sql` - Complete database schema with RLS policies
