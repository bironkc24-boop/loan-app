# QuickLoan - Full-Stack Loan Management System

## Overview
QuickLoan is a comprehensive loan management system built with **React Native Expo** (frontend) and **PERN stack** (PostgreSQL/Supabase, Express, React Native, Node.js) for the backend. The system supports multiple user roles (Borrower, Admin, Rider) with complete loan lifecycle management.

## Project Structure

```
quickloan/
├── frontend/              # React Native Expo application
│   ├── app/              # Expo Router screens
│   ├── contexts/         # React contexts (Auth, etc.)
│   ├── lib/              # Utilities (Supabase, API client)
│   ├── utils/            # Helper functions
│   ├── types/            # TypeScript types
│   └── assets/           # Images and icons
├── backend/              # Express API server
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, error handling
│   │   ├── services/     # Business logic
│   │   ├── config/       # Configuration
│   │   └── types/        # TypeScript types
│   └── dist/            # Compiled JavaScript
├── schema.sql           # Database schema for Supabase
├── FEATURES.md          # Complete feature documentation
└── README.md            # This file
```

## Technology Stack

### Frontend
- **Framework**: React Native Expo ~54.0.22
- **Navigation**: expo-router (file-based routing)
- **UI**: React Native with react-native-web
- **State**: React Context + @tanstack/react-query
- **Auth**: Supabase Auth
- **API Client**: Custom fetch wrapper with Supabase tokens

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth + JWT validation
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

### Database
- **Service**: Supabase (PostgreSQL)
- **Features**: Row Level Security (RLS), triggers, functions
- **Schema**: Multi-role user system, loans, riders, assignments

## Quick Start

### Prerequisites
1. **Supabase Account**: Create a free project at [supabase.com](https://supabase.com)
2. **Node.js**: Version 20 or higher

### Setup Instructions

#### 1. Database Setup
1. Create a new Supabase project
2. Copy all content from `schema.sql`
3. Go to Supabase SQL Editor
4. Paste and run the schema
5. Note down your credentials from Project Settings > API:
   - Project URL
   - `anon` public key
   - `service_role` secret key

#### 2. Backend Configuration
```bash
cd backend
cp .env.example .env
# Edit .env and add your Supabase credentials:
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY
# - SUPABASE_ANON_KEY
# - Generate a strong JWT_SECRET
npm install
npm run dev  # Starts on port 3001
```

#### 3. Frontend Configuration
```bash
cd frontend
cp .env.example .env
# Edit .env and add:
# - EXPO_PUBLIC_SUPABASE_URL
# - EXPO_PUBLIC_SUPABASE_ANON_KEY
# - EXPO_PUBLIC_API_URL (http://localhost:3001/api for local dev)
npm install
npm run web  # Starts on port 5000
```

#### 4. Create Admin User
After setting up the database:
1. Sign up through the app to create your first user
2. In Supabase Dashboard > Authentication, find the user ID
3. Run this SQL in Supabase SQL Editor to make them admin:
```sql
INSERT INTO user_roles (user_id, role_id)
SELECT 
    'YOUR_USER_ID_HERE',
    (SELECT id FROM roles WHERE name = 'admin');
```

Alternatively, manually create the admin user:
1. Go to Supabase Authentication
2. Add user with email: `kcbiron79@gmail.com`, password: `almonte17`
3. Copy the user ID
4. Run the above SQL with that user ID

## User Roles & Access

### Borrower (Default)
- Apply for loans
- Upload documents
- Track loan status
- View loan history
- Use loan calculator

### Admin (kcbiron79@gmail.com)
- Review and approve/reject loans
- Manage riders (create, edit, assign)
- View analytics and metrics
- Assign riders to loan applications
- Full system oversight

### Rider
- View assigned loans
- Update loan verification status
- Conduct field visits
- Upload verification documents
- Manage availability

## Running the Application

### Development Mode

**Both servers together** (from root):
```bash
npm run dev
```

**Frontend only**:
```bash
cd frontend
npm run web  # Web version on port 5000
npm run android  # Android
npm run ios  # iOS
```

**Backend only**:
```bash
cd backend
npm run dev  # Development with hot reload
npm run build  # Build TypeScript
npm start  # Production mode
```

### Production Deployment on Replit

1. **Update backend .env** with production Supabase URL
2. **Update frontend .env** with your Replit backend URL
3. **Workflows are configured** to run both frontend and backend
4. Frontend runs on port 5000 (webview)
5. Backend runs on port 3001 (console)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Loans (Borrower)
- `GET /api/loans` - Get all loans for current user
- `POST /api/loans` - Create loan application
- `GET /api/loans/:id` - Get loan details
- `POST /api/loans/:id/documents` - Upload documents

### Admin
- `GET /api/admin/loans` - Get all loans (admin)
- `PUT /api/admin/loans/:id` - Update loan status
- `POST /api/admin/loans/:id/assign` - Assign rider
- `GET /api/admin/riders` - Manage riders
- `GET /api/admin/metrics` - System metrics

### Rider
- `GET /api/rider/assignments` - Get assigned loans
- `PUT /api/rider/assignments/:id/status` - Update status
- `PUT /api/rider/availability` - Update availability

## Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5000
```

### Frontend (.env)
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

## Complete Feature List

See **FEATURES.md** for comprehensive feature documentation including:
- Detailed feature breakdown by role
- API endpoint documentation
- User flow diagrams
- Testing scenarios
- Future enhancements

## Recent Changes (November 5, 2025)
- 🎉 Transformed simple loan app into full PERN stack system
- ✅ Created comprehensive database schema with RLS
- ✅ Built Express backend with TypeScript
- ✅ Implemented Supabase Auth integration
- ✅ Created role-based access control (Borrower, Admin, Rider)
- ✅ Set up frontend with Supabase client
- ✅ Configured dual workflow (frontend + backend)
- ✅ Added complete feature documentation

## Troubleshooting

### Backend won't start
- Check that all Supabase credentials are in backend/.env
- Verify database schema is installed in Supabase
- Check backend logs for specific errors

### Frontend can't connect to backend
- Ensure EXPO_PUBLIC_API_URL points to correct backend URL
- Check that backend is running on port 3001
- Verify CORS settings in backend allow frontend URL

### Authentication fails
- Confirm Supabase credentials match in both frontend and backend
- Check that user has proper role assignments in database
- Verify JWT_SECRET is set in backend .env

## Next Steps

1. **Set up Supabase** - Create project and run schema.sql
2. **Configure environment** - Add credentials to .env files
3. **Test locally** - Run both frontend and backend
4. **Create admin user** - Follow admin setup instructions
5. **Customize** - Modify loan products, interest rates, etc.
6. **Deploy** - Configure for production deployment

## Support

For issues or questions:
- Check FEATURES.md for detailed documentation
- Review schema.sql for database structure
- Examine backend/src for API implementation
- See frontend/app for screen implementations
