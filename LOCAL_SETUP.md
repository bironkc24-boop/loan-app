# 📱 QuickLoan - Local Setup Guide for Expo Go

This guide will help you set up and run the QuickLoan app on your local computer and test it using the Expo Go mobile app.

---

## 📋 Prerequisites

Before starting, make sure you have:

1. **Node.js** (v20.x or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Expo Go App** on your mobile device
   - **iOS**: Download from App Store
   - **Android**: Download from Google Play Store

4. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/

---

## 🚀 Installation Steps

### Step 1: Clone or Download the Project

If you have Git installed:
```bash
git clone <your-repository-url>
cd <project-folder>
```

Or download the ZIP file and extract it to your preferred location.

### Step 2: Install Backend Dependencies

Open your terminal in the project root folder and run:

```bash
cd backend
npm install
```

This will install all required packages for the backend server.

### Step 3: Install Frontend Dependencies

In a new terminal window (keep the first one open), run:

```bash
cd frontend
npm install
```

This will install all required packages for the React Native app.

---

## ⚙️ Configuration

### Step 1: Set Up Environment Variables

Create a `.env` file in the **backend** folder with the following content:

```env
# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
SUPABASE_ANON_KEY=your-supabase-anon-key

# Server Configuration
PORT=3001
NODE_ENV=development
```

**How to get Supabase credentials:**
1. Go to https://supabase.com
2. Create a new project (or use an existing one)
3. Go to **Settings** → **API**
4. Copy your:
   - **URL** (Project URL)
   - **Service Role Key** (service_role secret)
   - **Anon Key** (anon public)

### Step 2: Set Up the Database

1. Go to your Supabase project
2. Click on **SQL Editor** in the left menu
3. Open the `schema.sql` file from the project root
4. Copy and paste the entire content into the SQL Editor
5. Click **Run** to create all tables and set up Row Level Security

### Step 3: Configure Frontend Environment

Create a `.env` file in the **frontend** folder:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3001/api
```

**Important**: Replace `YOUR_LOCAL_IP` with your computer's local IP address:
- **Windows**: Run `ipconfig` in CMD, look for "IPv4 Address"
- **Mac/Linux**: Run `ifconfig` in Terminal, look for "inet" under your network interface
- Example: `http://192.168.1.100:3001/api`

**Why local IP?** Your phone and computer need to be on the same WiFi network, and your phone needs to connect to your computer's local IP address.

---

## 🏃 Running the Application

### Step 1: Start the Backend Server

In the backend terminal:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Configuration loaded successfully
📝 Environment: development
🚀 Port: 3001
✅ QuickLoan API server is running on port 3001
```

Keep this terminal running.

### Step 2: Start the Frontend (Expo)

In the frontend terminal:

```bash
cd frontend
npm start
```

This will start the Expo development server. You'll see:
- A QR code in your terminal
- A browser window with the Expo Dev Tools

### Step 3: Open on Your Phone

#### For Android:
1. Open the **Expo Go** app on your phone
2. Tap **Scan QR Code**
3. Scan the QR code from your terminal or browser
4. Wait for the app to load

#### For iOS:
1. Open the **Camera** app on your iPhone
2. Point it at the QR code
3. Tap the notification that appears
4. The Expo Go app will open and load your app

**Alternative Method**: If QR code doesn't work, make sure your phone and computer are on the same WiFi network, then in Expo Go, tap "Enter URL manually" and type the URL shown in your terminal (e.g., `exp://192.168.1.100:8081`).

---

## 🎯 Testing the App

Once the app loads on your phone, you can test all features:

### 1. **Register a New Account**
- Tap "Profile" tab
- Tap "Create Account"
- Fill in the registration form
- Accept terms and conditions
- Tap "Create Account"

### 2. **Login**
- Use the email and password you just created
- Tap "Sign In"

### 3. **Browse Loan Products**
- Go to "Home" tab
- View available loan products
- See loan details and APR rates

### 4. **Calculate Loan Payments**
- Go to "Calculator" tab
- Enter loan amount, interest rate, and term
- See monthly payment calculation

### 5. **Apply for a Loan**
- Go to "Apply" tab
- Select loan type
- Fill in loan details
- Submit application

### 6. **Check Application Status**
- Go to "Status" tab
- View all your loan applications
- See status (Pending, Under Review, Approved, Rejected)

### 7. **Admin Features** (if you have admin role)
- Go to Profile → Admin Dashboard
- View all loans
- Manage riders
- See metrics

---

## 🔧 Troubleshooting

### Problem: Cannot connect to backend

**Solution:**
1. Make sure both your phone and computer are on the same WiFi network
2. Check that your backend server is running (terminal should show "server is running")
3. Verify your `EXPO_PUBLIC_API_URL` in frontend `.env` file uses your correct local IP
4. Disable any firewall that might be blocking port 3001

### Problem: "Network Error" when making API calls

**Solution:**
1. Check your backend logs for errors
2. Verify Supabase credentials are correct in backend `.env`
3. Make sure your phone can ping your computer's IP address

### Problem: QR Code not scanning

**Solution:**
1. Make sure Expo Go app is installed
2. Try the manual URL entry method
3. Restart the Expo server with `npm start` again
4. Make sure your terminal/browser QR code is visible and not blurry

### Problem: App crashes on load

**Solution:**
1. Check terminal for error messages
2. Clear Expo cache: `npx expo start -c`
3. Reinstall dependencies:
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   ```

---

## 📱 Building for Production

When you're ready to deploy your app:

### For Web:
```bash
cd frontend
npm run build
```

### For Android APK:
```bash
cd frontend
eas build --platform android
```

### For iOS:
```bash
cd frontend
eas build --platform ios
```

Note: Building for mobile requires setting up an Expo EAS account. Visit https://expo.dev/ for more information.

---

## 🛠️ Development Tips

### Hot Reload
- The app automatically reloads when you save changes to your code
- Shake your phone to open the developer menu

### Debugging
- In the developer menu, select "Debug Remote JS"
- Use Chrome DevTools for debugging
- View console logs in your terminal

### Testing on Web
You can also test on web browser:
```bash
cd frontend
npm run web
```
Then open http://localhost:8081 in your browser.

---

## 📚 Project Structure

```
quickloan/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Auth, validation
│   │   ├── routes/         # API endpoints
│   │   └── index.ts        # Server entry point
│   └── package.json
│
├── frontend/               # React Native Expo app
│   ├── app/               # App screens (Expo Router)
│   │   ├── index.tsx      # Welcome/Home
│   │   ├── login.tsx      # Login screen
│   │   ├── register.tsx   # Registration
│   │   ├── admin.tsx      # Admin dashboard
│   │   └── rider.tsx      # Rider portal
│   ├── components/        # Reusable components
│   ├── contexts/          # Auth context
│   ├── lib/              # API client
│   └── package.json
│
├── schema.sql            # Database schema
└── LOCAL_SETUP.md        # This file
```

---

## 🎨 Design System

The app uses a consistent design language:

- **Primary Color**: #4F46E5 (Indigo)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Orange)
- **Error**: #DC2626 (Red)
- **Background**: #F9FAFB (Light Gray)

All screens follow the same card-based layout with consistent spacing and typography.

---

## 🔒 Security Notes

- Never commit `.env` files to version control
- Keep your Supabase Service Key secret
- Use environment variables for all sensitive data
- The app includes Row Level Security (RLS) in the database
- JWT tokens are used for authentication

---

## 📞 Getting Help

If you encounter issues:

1. Check the terminal/console for error messages
2. Verify all environment variables are set correctly
3. Ensure Supabase database is set up properly
4. Make sure both servers (backend and frontend) are running
5. Check that your phone and computer are on the same network

---

## ✅ Checklist

Before running the app, make sure you have:

- [ ] Installed Node.js and npm
- [ ] Downloaded Expo Go app on your phone
- [ ] Cloned/downloaded the project
- [ ] Installed backend dependencies (`npm install` in backend folder)
- [ ] Installed frontend dependencies (`npm install` in frontend folder)
- [ ] Created `.env` file in backend with Supabase credentials
- [ ] Created `.env` file in frontend with API URL
- [ ] Set up database using `schema.sql` in Supabase
- [ ] Started backend server (`npm run dev` in backend)
- [ ] Started frontend server (`npm start` in frontend)
- [ ] Connected your phone to same WiFi as computer
- [ ] Scanned QR code with Expo Go app

---

## 🎉 You're All Set!

Enjoy using QuickLoan! The app is fully functional with all screens completed:

✅ Home Screen  
✅ Calculator  
✅ Loan Application  
✅ Status Tracking  
✅ Profile Management  
✅ Login & Registration  
✅ Admin Dashboard  
✅ Rider Portal  

Happy developing! 🚀
