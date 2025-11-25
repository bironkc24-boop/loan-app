# SJDC - Loan Management System

## Overview

SJDC is a full-stack loan management platform designed for the Philippine market. The system enables borrowers to apply for and manage loans while providing administrative and field verification capabilities through role-based access control. The application supports three user roles: Borrowers who apply for loans, Admins who manage the entire system, and Riders who perform field verification tasks.

The platform offers three loan products: Personal Loans (8.5% APR, up to ₱500,000), Business Loans (6.5% APR, up to ₱5,000,000), and Education Loans (4.5% APR, up to ₱1,000,000). It includes features such as real-time loan calculators, document upload capabilities, status tracking, and notification systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend uses React Native with Expo Router for cross-platform support (web, iOS, Android). The application employs file-based routing where each screen is a separate file in the `app/` directory. Navigation is handled through a tab-based system with five main screens: Home, Calculator, Apply, Status, and Profile.

State management is implemented using React Context API, specifically the AuthContext which manages user authentication state, session management, and role-based access. The context provides global access to user information and authentication methods throughout the application.

The UI design follows a card-based layout with a consistent color scheme: Indigo (#4F46E5) for primary actions, white (#FFFFFF) for cards, and light gray (#F9FAFB) for backgrounds. All cards use 12px border radius and shadow effects for depth. Typography emphasizes bold headers with clear hierarchy.

### Backend Architecture

The backend is built with Express.js and TypeScript, following a modular controller-route pattern. The API is organized into distinct route groups: authentication (`/api/auth`), loans (`/api/loans`), admin operations (`/api/admin`), rider operations (`/api/rider`), notifications (`/api/notifications`), and user management (`/api/users`).

Middleware layers handle authentication via JWT tokens, role-based access control, error handling, and rate limiting (100 requests per 15 minutes). CORS is configured to allow all origins during development, with Helmet providing security headers.

The authentication flow uses Supabase Auth with JWT tokens. When users register, the system creates a Supabase auth user, then inserts a corresponding record in the users table and assigns the appropriate role through the user_roles junction table. All subsequent requests include the JWT token in the Authorization header, which is validated against Supabase and used to fetch user roles.

### Database Design

The database uses PostgreSQL through Supabase with Row Level Security (RLS) policies to enforce data access controls. The schema consists of the following core tables:

- **users**: Stores basic user information (email, full_name, phone, avatar_url)
- **roles**: Defines three system roles (borrower, admin, rider)
- **user_roles**: Junction table for many-to-many relationship between users and roles
- **borrower_profiles**: Extended information for borrowers (employment_status, monthly_income, address, credit_score)
- **riders**: Profile information for field verification personnel (status, zone, max_assignments, current_assignments)
- **loans**: Core loan records (borrower_id, product_type, amount, term_months, interest_rate, status, monthly_payment, total_repayment)
- **loan_documents**: File uploads associated with loans (loan_id, document_type, file_url)
- **loan_status_history**: Audit trail of status changes for loans
- **rider_assignments**: Tracks field verification assignments (rider_id, loan_id, status, assigned_at, completed_at)
- **notifications**: User notification system (user_id, type, title, message, read status)

Enums define allowed values for fields like employment_status, rider_status, loan_product_type, loan_status, document_type, and notification_type.

The schema enforces referential integrity through foreign key constraints and uses RLS policies to ensure users can only access their own data unless they have admin privileges.

### API Design

The API follows RESTful conventions with JSON request/response bodies. Authentication endpoints handle registration (with terms acceptance tracking), login, logout, password reset, and token refresh. 

Loan endpoints support creating applications, retrieving loan lists, fetching individual loans, viewing status history, and uploading documents. Admin endpoints provide full CRUD operations for loans, riders, and users, plus system metrics. Rider endpoints enable viewing assignments, updating assignment status, adding notes, and managing availability.

All protected routes require a valid JWT token in the Authorization header. Role-based middleware (`requireRole`) restricts access to specific endpoints based on user roles.

### File Upload System

Document uploads are handled through the expo-image-picker library on the frontend, which allows users to select images from their device. The backend uses multer middleware for processing multipart/form-data requests, with validation for file size (max 10MB) and allowed file types.

Uploaded files are stored in Supabase Storage with metadata tracked in the loan_documents table, including document type, upload timestamp, and associated loan ID.

### Error Handling

The system implements a centralized error handling approach using a custom AppError class that extends the native Error class. All errors flow through a global error handler middleware that distinguishes between operational errors (with known status codes) and unexpected errors (returned as 500 Internal Server Error).

## External Dependencies

### Authentication & Database
- **Supabase**: Primary authentication provider and PostgreSQL database host. Handles user signup/signin, session management, and database operations with RLS policies. Requires SUPABASE_URL, SUPABASE_SERVICE_KEY, and SUPABASE_ANON_KEY environment variables.

### Backend Services
- **Express.js**: Web application framework for the REST API
- **TypeScript**: Type-safe JavaScript for backend development
- **jsonwebtoken**: JWT token generation and validation (requires JWT_SECRET environment variable)
- **cors**: Cross-origin resource sharing middleware
- **helmet**: Security headers middleware
- **express-rate-limit**: API rate limiting protection
- **morgan**: HTTP request logging
- **multer**: Multipart/form-data file upload handling
- **zod**: Runtime type validation for request data
- **dotenv**: Environment variable management

### Frontend Services
- **React Native**: Cross-platform mobile framework
- **Expo**: Development toolchain and SDK for React Native (includes Expo Router, Expo Font, Expo Constants, Expo Image Picker, Expo Linking, Expo Status Bar)
- **@supabase/supabase-js**: Supabase client library for authentication
- **@react-native-async-storage/async-storage**: Local storage for caching
- **@tanstack/react-query**: Data fetching and caching (currently imported but not actively used)
- **react-native-chart-kit**: Charting library for loan calculator visualization
- **react-native-svg**: SVG rendering support
- **@expo/vector-icons**: Icon library (Ionicons)
- **react-native-safe-area-context**: Safe area boundaries for modern devices
- **react-native-screens**: Native screen management

### Development Tools
- **ts-node-dev**: TypeScript development server with auto-reload
- **concurrently**: Run multiple npm scripts simultaneously
- **eslint** & **@typescript-eslint**: Code linting and style enforcement

### Environment Configuration
The application requires the following environment variables:
- **Backend**: SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY, JWT_SECRET, PORT (default 3001), NODE_ENV, FRONTEND_URL (default http://localhost:5000)
- **Frontend**: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_API_URL (default http://localhost:3001/api)