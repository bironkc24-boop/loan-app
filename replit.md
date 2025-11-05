# Loan App

## Overview
This is a loan application built with Expo and React Native that runs on the web. The app provides a complete loan management system with loan products, calculators, application forms, and status tracking.

## Project Structure
- **app/**: Contains all the main application screens
  - `_layout.tsx`: Tab-based navigation layout
  - `index.tsx`: Home screen showing loan products
  - `calculator.tsx`: Loan calculator screen
  - `apply.tsx`: Loan application form
  - `status.tsx`: Application status tracking
- **utils/**: Utility functions for loan calculations, products, and storage
- **types/**: TypeScript type definitions
- **assets/**: Application icons and images

## Technology Stack
- **Framework**: Expo ~54.0.22 with React Native
- **Router**: expo-router for navigation
- **UI**: React Native with react-native-web for web support
- **Charts**: react-native-chart-kit for data visualization
- **Storage**: @react-native-async-storage for local data persistence
- **Icons**: @expo/vector-icons (Ionicons)

## Running the Application
The app is configured to run on port 5000:
```bash
npm run web
```

## Recent Changes (November 5, 2025)
- Initial project setup in Replit environment
- Configured Expo to run on web at port 5000
- Added EXPO_DEVTOOLS_LISTEN_ADDRESS environment variable for proper network binding
- Created metro.config.js for Metro bundler configuration
- Set up web workflow for automatic deployment

## Architecture
The app uses Expo Router for file-based routing with a tab navigation pattern. Each screen is a separate file in the `app/` directory, and the layout file defines the navigation structure.

## Dependencies
All dependencies are managed through npm and defined in package.json. The project uses TypeScript for type safety.
