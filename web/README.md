# Regimen — Daily Routine Tracker

Regimen is a modern Progressive Web Application (PWA) designed to help you track your daily habits, build streaks, and visualize your progress over time. Built with Next.js, React, and Firebase, it features a clean, responsive UI with robust offline support.

## Features

- **Habit Tracking**: Create, edit, and delete daily habits with customizable categories and schedules.
- **Streak Counters**: See your consistency with real-time streak calculations.
- **Analytics Dashboard**: Visualize your performance over the last 30 days with a calendar heatmap and detailed statistics.
- **Offline Support**: Log your habits even without an internet connection. Your data syncs automatically with Firebase when you're back online.
- **Google Authentication**: Quick and secure sign-in process.
- **Accessibility**: Thoughtfully designed with proper ARIA attributes and keyboard navigability.
- **Responsive UI**: Looks great and functions flawlessly on both desktop and mobile devices.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **Icons**: [Lucide React](https://lucide.dev/)

## Architecture Overview

Regimen uses a modular, professional-grade architectural structure:
- **`src/app`**: Next.js App Router for all application routing, including separate route groups for `(auth)` and `(protected)` areas. Server middleware protects routes appropriately.
- **`src/hooks`**: Domain-specific logic encapsulated safely out of the UI. Hook boundaries exist for `useHabits`, `useDailyLogs`, `useStreak`, and `useAnalytics`.
- **`src/components/ui`**: Base presentation components and centralized reusable layout pieces (e.g. `TopNav`, `ConfirmDialog`, `LoadingSpinner`).
- **`src/lib/firebase`**: All remote data source access and setup is cleanly isolated away from component logic.
- **`src/contexts`**: Standard React Contexts for application-wide scoped state, like authentication and toast notifications.

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/manishborikar92/Regimen.git
   ```

2. **Navigate to the web directory:**
   ```bash
   cd Regimen/web
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Environment Configuration:**
   Create a `.env.local` file in `Regimen/web/` and add your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Deploy Security Rules:**
   Use the Firebase CLI from the **`web/` directory** to initialize your project link and deploy local security rules and index files:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   firebase deploy --only firestore
   ```

6. **Run the development server:**
   ```bash
   npm run dev
   ```

   The app will be accessible at [http://localhost:3000](http://localhost:3000).

## License

This project is proprietary and confidential. Ensure proper credentials before deploying.
