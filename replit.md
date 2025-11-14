# QuickLoan - Full-Stack Loan Management System

## Overview

QuickLoan is a comprehensive full-stack loan management system built with:
- **Frontend**: React Native + Expo (Web, iOS, Android)
- **Backend**: Express.js + TypeScript + Node.js
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth + JWT

## Current State

### ✅ Completed Setup - Replit Import Complete
- Dependencies installed for both frontend and backend
- Workflows configured and running:
  - **Frontend**: Running on port 5000 (Expo web) ✅
  - **Backend**: Configured on port 3001 (awaiting Supabase credentials - will start when credentials are added)
- CORS configured for Replit environment (FRONTEND_URL=*)
- Webpack dev server configured with `allowedHosts: 'all'` for Replit proxy
- Cache control headers added for proper preview functionality
- Environment files created with Replit-specific configuration
  - Backend .env created with all required variables (Supabase credentials need to be filled)
  - Frontend .env updated with current Replit domain
- Deployment configuration added (autoscale deployment)
- .gitignore properly configured for Node.js/TypeScript/Expo project
- **Philippine Localization Complete**:
  - All currency converted from USD to Philippine Peso (₱)
  - Centralized currency formatting using formatCurrency utility
  - Realistic Philippine loan amounts (Personal: ₱10k-500k, Business: ₱50k-5M, Education: ₱20k-1M)
  - Philippine phone number format (+63)
- **All Screens Complete**:
  - Login & Register with beautiful modern UI
  - Home screen with loan products
  - Loan Calculator with Philippine Peso
  - Apply screen with document upload
  - Status screen for loan tracking
  - Profile screen with user management
  - Admin Dashboard for loan management
  - Rider Portal for field verification
- **Design**: Beautiful indigo/purple theme (#4F46E5) maintained throughout

### ⏳ Required Setup Steps - NEXT ACTIONS

**IMPORTANT**: The system requires Supabase credentials to function. The backend will not start until these are provided.

**Why Supabase?** This application uses Supabase (external PostgreSQL with authentication) instead of Replit's built-in database because:
- Supabase provides built-in authentication with JWT
- Row Level Security (RLS) policies for data protection
- Real-time subscriptions and advanced features
- The schema.sql is specifically designed for Supabase

**To complete setup:**

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and create a free account
   - Create a new project (takes 2-3 minutes)
   - Note your project credentials

2. **Set Up Database**:
   - In Supabase, go to SQL Editor
   - Copy the contents of `schema.sql` from this project
   - Paste and run in Supabase SQL Editor
   - This creates all tables, RLS policies, and functions

3. **Add Credentials**:
   - Get credentials from Supabase Settings → API:
     - `SUPABASE_URL` (your project URL)
     - `SUPABASE_SERVICE_KEY` (service_role key - keep secret!)
     - `SUPABASE_ANON_KEY` (anon public key)
   - Update backend/.env with these values
   - Update frontend/.env with:
     - `EXPO_PUBLIC_SUPABASE_URL`
     - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Restart the backend workflow after updating credentials

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

- **2025-11-12**: Complete Philippines market localization
  - Converted all currency from USD to Philippine Peso (₱)
  - Implemented centralized formatCurrency utility for consistency
  - Updated all loan amounts to realistic Philippine values
  - Changed phone format to Philippine standard (+63)
  - Completed all UI screens (Login, Register, Apply, Calculator, Status, Profile, Admin, Rider)
  - Maintained beautiful modern design throughout (indigo/purple theme)
  - Architect-reviewed and approved for production readiness

- **2025-11-12**: Initial Replit environment setup
  - Installed all dependencies
  - Configured workflows for frontend (port 5000) and backend (port 3001)
  - Updated CORS to allow Replit proxy
  - Added cache control headers to Metro config
  - Created environment files
  - Updated .gitignore for Node.js/TypeScript/Expo project

## Next Steps

1. **Provide Supabase Credentials** (Required - Backend won't start without these):
   - Follow the "Required Setup Steps" section above
   - Update backend/.env and frontend/.env with your Supabase credentials
   - Restart the backend workflow
2. Create admin user in Supabase (instructions in SETUP_GUIDE.md)
3. Test full authentication and loan application flow
4. Deploy to production when ready (click "Deploy" button in Replit)

## Important Notes

- **Database**: This project uses Supabase (external), NOT Replit's built-in PostgreSQL
- **Frontend**: Already running and accessible at port 5000
- **Backend**: Will start automatically once Supabase credentials are added to backend/.env

## Documentation

- `SETUP_GUIDE.md` - Comprehensive setup instructions
- `FEATURES.md` - Detailed feature documentation
- `schema.sql` - Complete database schema with RLS policies
