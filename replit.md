# QuickLoan - Full-Stack Loan Management System

## Project Overview

QuickLoan is a comprehensive loan management system built with:
- **Frontend**: React Native Expo Web (port 5000)
- **Backend**: Express + TypeScript API (port 3001)
- **Database**: Supabase (PostgreSQL with Row Level Security)

The system supports three user roles:
1. **Borrowers** - Apply for loans, track status, upload documents
2. **Admins** - Review applications, manage riders, assign verifications
3. **Riders** - Handle field verification, update status, upload verification documents

## Project Structure

```
quickloan/
├── frontend/              # Expo React Native Web app
│   ├── app/              # Expo Router screens
│   ├── contexts/         # Auth context
│   ├── lib/              # API client, Supabase client
│   └── utils/            # Loan calculator, products
├── backend/              # Express TypeScript API
│   ├── src/
│   │   ├── config/       # Server & Supabase config
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth, error handling
│   │   ├── routes/       # API endpoints
│   │   └── types/        # TypeScript types
│   └── package.json
├── schema.sql            # Complete database schema with RLS
└── package.json          # Root package (concurrently scripts)
```

## Setup Status

✅ **Completed:**
- Dependencies installed (frontend + backend)
- Frontend workflow configured (port 5000)
- Webpack configured for Replit proxy (allowedHosts: 'all')
- Metro bundler configured with cache control
- Backend .env file created with placeholders
- Frontend .env updated with Replit domain

⚠️ **Required to Run:**
1. **Supabase Project Setup** - User needs to:
   - Create Supabase project at https://supabase.com
   - Run schema.sql in Supabase SQL Editor
   - Get credentials from Settings → API
   
2. **Add Secrets** - User needs to add these secrets:
   - `SUPABASE_URL` - Project URL from Supabase
   - `SUPABASE_SERVICE_KEY` - Service role key (backend only)
   - `SUPABASE_ANON_KEY` - Anon public key (both frontend & backend)

## Environment Configuration

### Frontend (.env)
```env
EXPO_PUBLIC_SUPABASE_URL=<your_supabase_url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
EXPO_PUBLIC_API_URL=https://1d966e3c-71f7-46fe-a045-ef839f7daa33-00-2iyjxaundnvkz.pike.replit.dev:3001/api
```

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=<your_supabase_url>
SUPABASE_SERVICE_KEY=<your_service_key>
SUPABASE_ANON_KEY=<your_anon_key>
JWT_SECRET=quickloan_jwt_secret_change_in_production_xyz123
FRONTEND_URL=*
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf
```

## Workflows

**Frontend** - Active
- Command: `cd frontend && npm run web`
- Port: 5000 (exposed to users)
- Output: Webview
- Status: Running

**Backend** - Not configured as workflow
- Backend runs on localhost:3001 (internal only)
- Frontend connects to it via Replit domain
- User will need to manually start it after adding Supabase credentials

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - Authenticate user
- `POST /logout` - End session
- `GET /me` - Get current user profile

### Loans (`/api/loans`)
- `GET /` - List user's loans
- `POST /` - Create loan application
- `GET /:id` - Get loan details
- `POST /:id/documents` - Upload documents

### Admin (`/api/admin`)
- `GET /loans` - View all loan applications
- `PUT /loans/:id` - Update loan status
- `POST /loans/:id/assign` - Assign rider
- `GET /riders` - List all riders
- `POST /riders` - Create new rider
- `GET /metrics` - System analytics

### Rider (`/api/rider`)
- `GET /assignments` - View assigned loans
- `PUT /assignments/:id/status` - Update verification status
- `PUT /availability` - Set active/inactive
- `GET /metrics` - Personal performance metrics

## Database Schema

The schema.sql file includes:
- User profiles extending Supabase auth
- Role-based access control (borrower, admin, rider)
- Loan applications and documents
- Rider assignments and tracking
- Notifications system
- Row Level Security (RLS) policies for all tables
- Automatic triggers for status history

## Security Features

- Row Level Security (RLS) on all tables
- JWT-based authentication
- Role-based access control
- Service role for privileged backend operations
- Anon role for user-facing operations
- CORS protection
- Rate limiting
- File upload validation

## Development Workflow

1. User adds Supabase credentials to secrets
2. Frontend auto-runs on port 5000 (already configured)
3. User manually starts backend: `cd backend && npm run dev`
4. System creates default borrower role for new users
5. Admin role must be assigned manually via SQL

## Recent Changes (Import Setup)

**2024-11-17**
- Installed all npm dependencies
- Created backend/.env with placeholder values
- Updated frontend/.env with current Replit domain
- Configured frontend workflow on port 5000
- Verified Expo webpack config allows all hosts
- Verified Metro config includes cache control headers

## Next Steps for User

1. **Create Supabase project** at https://supabase.com
2. **Run schema.sql** in Supabase SQL Editor (creates all tables & RLS policies)
3. **Add secrets** in Replit for:
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY  
   - SUPABASE_ANON_KEY
4. **Restart frontend workflow** to pick up new environment variables
5. **Start backend** manually to verify connection
6. **Create admin user** via Supabase dashboard + SQL query

## Known Issues

- Backend cannot start without Supabase credentials (expected)
- Frontend .env needs to be updated with actual Supabase URL and key
- Admin user needs manual SQL insert after first user signup
- Minor package version warnings (non-blocking)

## Tech Stack Details

- **React Native**: 0.81.5
- **Expo**: ~54.0.22
- **React**: 19.1.0
- **Express**: 4.18.2
- **TypeScript**: 5.3.3 (backend), 5.9.2 (frontend)
- **Supabase JS**: 2.39.3 (backend), 2.79.0 (frontend)
- **Node**: 20.19.3

## Deployment Notes

When ready to deploy:
1. Configure deployment using Replit's deploy tool
2. Set deployment type (likely "vm" for stateful backend)
3. Update frontend .env with production backend URL
4. Change JWT_SECRET to a strong random value
5. Set NODE_ENV=production
6. Test all endpoints with production credentials
