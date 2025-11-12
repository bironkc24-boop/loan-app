# QuickLoan - Full Stack Loan Management System

**Last Updated**: November 12, 2025

## Overview

QuickLoan is a comprehensive loan management system built with React Native Expo (frontend) and Express + Supabase (backend). The app features a beautiful, modern design with role-based authentication supporting Borrowers, Admins, and Riders (field verification agents).

## Project Architecture

### Tech Stack
- **Frontend**: React Native Expo (web + mobile support)
- **Backend**: Express.js + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + JWT
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API

### Design System
- **Primary Color**: Indigo (#4F46E5)
- **Background**: Light Gray (#F9FAFB)
- **Card Backgrounds**: White (#FFFFFF)
- **Typography**: Bold headers, clear hierarchy
- **Components**: Card-based layout with shadows, 12px border radius
- **Icons**: Expo Ionicons

## Current Status

### ✅ Completed Features

#### Backend (100%)
- Express API server with TypeScript
- Complete database schema with Row Level Security (RLS)
- Authentication system (register, login, logout)
- Role-based access control (Borrower, Admin, Rider)
- All API endpoints for all three user roles
- File upload support with validation
- Error handling and rate limiting

#### Frontend (70%)
- **Home Screen**: Beautiful landing page with loan products
- **Calculator Screen**: Loan payment calculator
- **Apply Screen**: Complete loan application form with document upload
- **Status Screen**: Track loan applications
- **Profile Screen**: User profile management
- **Auth Context**: User authentication and session management
- **API Client**: Configured to work with backend
- **Navigation**: Tab-based navigation with Expo Router

### ⏳ In Progress
- Setting up Supabase credentials (waiting for user input)
- Backend server configuration

### 📋 Next Steps
1. User provides Supabase credentials
2. Run database schema setup in Supabase SQL Editor
3. Test authentication flow
4. Complete remaining UI screens (Login, Register, Admin, Rider)
5. Connect all screens to backend APIs

## Application Structure

### Frontend Structure
```
frontend/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Tab navigation layout
│   ├── index.tsx          # Home screen
│   ├── calculator.tsx     # Loan calculator
│   ├── apply.tsx          # Loan application
│   ├── status.tsx         # Application status
│   ├── profile.tsx        # User profile
│   ├── login.tsx          # Login screen
│   ├── register.tsx       # Registration screen
│   ├── admin.tsx          # Admin dashboard
│   └── rider.tsx          # Rider interface
├── contexts/
│   └── AuthContext.tsx    # Authentication state
├── lib/
│   ├── api.ts            # API client wrapper
│   └── supabase.ts       # Supabase client
├── utils/
│   ├── loanCalculator.ts # Loan calculation logic
│   ├── loanProducts.ts   # Loan product definitions
│   └── storage.ts        # Local storage utilities
└── types/
    └── index.ts          # TypeScript type definitions
```

### Backend Structure
```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── index.ts     # Environment config
│   │   └── supabase.ts  # Supabase client
│   ├── controllers/      # Business logic
│   │   ├── authController.ts   # Auth operations
│   │   ├── loanController.ts   # Loan operations
│   │   ├── adminController.ts  # Admin operations
│   │   └── riderController.ts  # Rider operations
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication
│   │   └── errorHandler.ts    # Error handling
│   ├── routes/          # API routes
│   │   ├── auth.ts     # /api/auth/*
│   │   ├── loans.ts    # /api/loans/*
│   │   ├── admin.ts    # /api/admin/*
│   │   └── rider.ts    # /api/rider/*
│   ├── types/
│   │   └── index.ts    # TypeScript types
│   └── index.ts        # Server entry point
└── .env                # Environment variables
```

## User Roles & Features

### 🙋 Borrower (Default Role)
- Browse loan products (Personal, Business, Education)
- Use loan calculator
- Apply for loans with document upload
- Track application status
- View loan history
- Receive notifications

### 👔 Admin
- Review all loan applications
- Approve/reject loans
- Create and manage riders
- Assign riders to loan verifications
- View system metrics and analytics
- Manage all users

### 🏍️ Rider (Field Verification Agent)
- View assigned loan verifications
- Update verification status
- Upload verification documents
- Manage availability (active/inactive)
- View personal performance metrics

## Loan Products

1. **Personal Loan** 💼
   - Amount: $1,000 - $50,000
   - Rate: 8.5% APR
   - Term: 6-60 months
   - Purpose: Personal expenses, debt consolidation

2. **Business Loan** 🏢
   - Amount: $5,000 - $500,000
   - Rate: 6.5% APR
   - Term: 12-84 months
   - Purpose: Business expansion, equipment

3. **Education Loan** 🎓
   - Amount: $2,000 - $100,000
   - Rate: 4.5% APR
   - Term: 12-120 months
   - Purpose: Tuition, education expenses

## Environment Configuration

### Frontend Environment Variables
Located in `frontend/.env`:
- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `EXPO_PUBLIC_API_URL`: Backend API URL (configured for Replit)

### Backend Environment Variables
Located in `backend/.env`:
- `PORT`: 3001 (backend port)
- `NODE_ENV`: development
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `JWT_SECRET`: JWT signing secret
- `FRONTEND_URL`: Replit frontend URL (for CORS)

## Workflows

### Frontend Workflow
- **Name**: frontend
- **Port**: 5000 (webview)
- **Command**: `cd frontend && npm run web`
- **Status**: Running ✅

### Backend Workflow
- **Name**: backend
- **Port**: 3001 (console)
- **Command**: `cd backend && npm run dev`
- **Status**: Waiting for Supabase credentials ⏳

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Borrower Routes
- `GET /api/loans` - Get user's loans
- `POST /api/loans` - Create loan application
- `GET /api/loans/:id` - Get loan details
- `POST /api/loans/:id/documents` - Upload documents

### Admin Routes
- `GET /api/admin/loans` - Get all loans
- `PUT /api/admin/loans/:id` - Update loan status
- `POST /api/admin/loans/:id/assign` - Assign rider
- `GET /api/admin/riders` - List riders
- `POST /api/admin/riders` - Create rider
- `GET /api/admin/metrics` - System analytics

### Rider Routes
- `GET /api/rider/assignments` - Get assignments
- `PUT /api/rider/assignments/:id/status` - Update status
- `PUT /api/rider/availability` - Set availability
- `GET /api/rider/metrics` - Personal metrics

## Database Schema

Located in `schema.sql` - comprehensive schema with:
- `users` - User profiles
- `roles` - System roles (borrower, admin, rider)
- `user_roles` - User-to-role mapping
- `borrower_profiles` - Extended borrower data
- `riders` - Rider profiles
- `loans` - Loan applications
- `loan_documents` - Document uploads
- `loan_status_history` - Audit trail
- `rider_assignments` - Loan assignments
- `notifications` - User notifications

All tables include Row Level Security (RLS) policies for data protection.

## Design Guidelines

When adding new screens or components, maintain consistency:

1. **Colors**:
   - Primary: #4F46E5 (Indigo)
   - Background: #F9FAFB
   - Cards: #FFFFFF
   - Text primary: #111827
   - Text secondary: #6B7280
   - Success: #16A34A
   - Warning: #EAB308
   - Error: #DC2626

2. **Typography**:
   - Headers: 28px, bold, primary color or white
   - Section titles: 18-20px, bold
   - Body: 14-16px, regular
   - Labels: 14px, semi-bold

3. **Spacing**:
   - Section padding: 24px
   - Card padding: 16-20px
   - Element margins: 8-16px
   - Border radius: 8-12px

4. **Shadows**:
   - Cards: shadowOpacity 0.08-0.1, elevation 2-3
   - Buttons: No shadow by default

## Security Features

- Row Level Security (RLS) on all database tables
- JWT-based authentication
- Password hashing via Supabase Auth
- API rate limiting
- Input validation (Zod)
- CORS protection
- Environment variable management

## Next Development Tasks

1. **Authentication Screens**
   - Complete login screen UI
   - Complete registration screen UI
   - Add password reset flow

2. **Admin Dashboard**
   - Loan review interface
   - Rider management UI
   - Analytics charts and metrics
   - User management panel

3. **Rider Interface**
   - Assignment list view
   - Status update UI
   - Document upload for verifications
   - Availability toggle

4. **Enhancements**
   - Push notifications
   - Email notifications
   - Payment gateway integration
   - Advanced search and filters

## User Preferences

- Maintain beautiful, modern design aesthetic
- Use card-based layouts
- Keep color scheme consistent (Indigo primary)
- Ensure responsive design for web and mobile
- Prioritize clean, intuitive UI/UX
