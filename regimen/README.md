# Routine Tracker PWA

A Progressive Web App for tracking daily health routines, built with Next.js 16, Firebase, and Tailwind CSS.

## Features

- 🔐 Google Sign-In authentication
- 📱 Installable PWA (works offline)
- 🔥 Streak tracking
- ✅ Daily habit checklist
- 🔄 Real-time sync across devices
- 📊 Progress tracking

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name and follow the setup wizard

### 2. Enable Google Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Google** provider
3. Add your authorized domains (localhost for dev, your Vercel domain for prod)

### 3. Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Start in **test mode** (we'll add security rules later)
3. Choose a region close to your users

### 4. Get Firebase Configuration

1. Go to **Project Settings** > **General**
2. Scroll to "Your apps" and click the web icon (`</>`)
3. Register your app and copy the config values

### 5. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Firebase config values in `.env.local`

### 6. Deploy Firestore Security Rules

1. Go to **Firestore Database** > **Rules**
2. Copy the contents of `firestore.rules` and paste into the editor
3. Click **Publish**

### 7. Install Dependencies & Run

```bash
npm install
npm run dev
```

### 8. Seed the Database

After starting the dev server, make a POST request to seed the habits:

```bash
curl -X POST http://localhost:3000/api/seed
```

Or open your browser console and run:
```javascript
fetch('/api/seed', { method: 'POST' }).then(r => r.json()).then(console.log)
```

## Deployment (Vercel)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

## Tech Stack

- Next.js 16 (App Router)
- Firebase Auth + Firestore
- Tailwind CSS
- PWA with offline support

## Project Structure

```
regimen/
├── src/
│   ├── app/
│   │   ├── api/seed/route.js    # Seed endpoint
│   │   ├── dashboard/page.js    # Main dashboard
│   │   ├── login/page.js        # Login page
│   │   ├── layout.js            # Root layout
│   │   └── page.js              # Home redirect
│   ├── components/
│   │   ├── AuthProvider.js      # Auth context
│   │   ├── HabitCard.js         # Simple habit card
│   │   ├── HabitAccordion.js    # Expandable habit card
│   │   └── StreakCounter.js     # Streak display
│   ├── lib/
│   │   ├── firebase.js          # Firebase config
│   │   └── seedData.js          # Habit seed data
│   └── utils/
│       └── dateHelpers.js       # Date utilities
├── public/
│   └── manifest.json            # PWA manifest
├── firestore.rules              # Security rules
└── .env.local.example           # Env template
```
