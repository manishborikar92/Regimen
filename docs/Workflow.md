# Development Workflow

## Overview

This document describes the development workflow for the Routine Tracker application, including setup, development, testing, and deployment processes.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account (free)
- Vercel account (free, optional for deployment)

### Initial Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd Regimen

# 2. Navigate to the app directory
cd regimen

# 3. Install dependencies
npm install

# 4. Copy environment template
cp .env.local.example .env.local

# 5. Add Firebase credentials to .env.local
# (Get from Firebase Console > Project Settings)

# 6. Start development server
npm run dev
```

---

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name
4. Disable Google Analytics (optional)
5. Create project

### 2. Enable Authentication
1. Go to Authentication > Sign-in method
2. Enable Google provider
3. Add authorized domains:
   - `localhost`
   - Your Vercel domain (after deployment)

### 3. Create Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Start in test mode (we'll add rules later)
4. Choose region closest to users

### 4. Get Configuration
1. Go to Project Settings > General
2. Scroll to "Your apps"
3. Click web icon (`</>`)
4. Register app
5. Copy config values to `.env.local`

### 5. Deploy Security Rules
1. Go to Firestore > Rules
2. Copy contents of `regimen/firestore.rules`
3. Paste and Publish

---

## Development Workflow

### Daily Development

```bash
# Start dev server
npm run dev

# Open in browser
# http://localhost:3000
```

### Code Structure

```
src/
├── app/           # Pages (App Router)
├── components/    # Reusable components
├── lib/           # Firebase, utilities
└── utils/         # Helper functions
```

### Making Changes

1. **Pages:** Edit files in `src/app/`
2. **Components:** Edit files in `src/components/`
3. **Styles:** Use Tailwind classes inline
4. **Firebase:** Edit `src/lib/firebase.js`

### Hot Reload
- Changes auto-reload in browser
- No need to restart server

---

## Testing Workflow

### Manual Testing Checklist

#### Authentication
- [ ] Google Sign-In works
- [ ] Sign out works
- [ ] Protected routes redirect to login
- [ ] Auth state persists on refresh

#### Dashboard
- [ ] Habits load for current user
- [ ] Only today's habits shown (frequency filter)
- [ ] Checkbox toggles work
- [ ] Progress bar updates
- [ ] Streak counter displays

#### Habits Management
- [ ] Add new habit works
- [ ] Edit habit works
- [ ] Delete habit works (with confirmation)
- [ ] "Load Sample Routine" works for new users

#### Analytics
- [ ] Calendar view shows 30 days
- [ ] Colors reflect completion rates
- [ ] Click date shows details
- [ ] Statistics calculate correctly

#### Cross-Device
- [ ] Changes sync in real-time
- [ ] Works on mobile browser
- [ ] PWA installs correctly

### Testing Different Users
1. Sign out
2. Sign in with different Google account
3. Verify habits are separate

---

## Build & Deploy

### Local Build Test

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Deploy to Vercel

#### First Time
1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import repository
4. Add environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Deploy

#### Subsequent Deploys
- Push to main branch
- Vercel auto-deploys

### Post-Deployment
1. Add Vercel domain to Firebase Auth authorized domains
2. Test production site
3. Verify PWA installation works

---

## Common Tasks

### Add a New Page

```bash
# Create page file
mkdir -p src/app/newpage
touch src/app/newpage/page.js
```

```javascript
// src/app/newpage/page.js
'use client';

import { useAuth } from '@/components/AuthProvider';
import BottomNav from '@/components/BottomNav';

export default function NewPage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Content */}
      <BottomNav />
    </div>
  );
}
```

### Add a New Component

```bash
touch src/components/NewComponent.js
```

```javascript
// src/components/NewComponent.js
'use client';

export default function NewComponent({ prop1, prop2 }) {
  return (
    <div className="...">
      {/* Component content */}
    </div>
  );
}
```

### Add Firestore Query

```javascript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// In your component
const fetchData = async () => {
  const q = query(
    collection(db, 'collectionName'),
    where('userId', '==', user.uid)
  );
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

### Update Security Rules

1. Edit `regimen/firestore.rules`
2. Copy to Firebase Console > Firestore > Rules
3. Publish

---

## Troubleshooting

### "Missing or insufficient permissions"
- Check Firestore security rules
- Ensure `userId` field matches `auth.uid`
- Verify user is authenticated

### "Firebase not initialized"
- Check `.env.local` has all variables
- Restart dev server after changing env
- Verify Firebase project exists

### Habits not showing
- Check browser console for errors
- Verify `userId` filter in query
- Check if habits exist in Firestore

### Real-time updates not working
- Verify `onSnapshot()` is set up
- Check for errors in console
- Ensure Firestore rules allow read

### PWA not installing
- Must be served over HTTPS (or localhost)
- Check `manifest.json` is valid
- Verify icons exist

---

## Git Workflow

### Branching Strategy

```
main (production)
  └── feature/new-feature
  └── fix/bug-fix
```

### Commit Messages

```bash
# Features
git commit -m "feat: add analytics page"

# Fixes
git commit -m "fix: habit toggle not updating"

# Docs
git commit -m "docs: update README"

# Refactor
git commit -m "refactor: extract HabitCard component"
```

### Pull Request Process
1. Create feature branch
2. Make changes
3. Test locally
4. Push branch
5. Create PR
6. Review & merge
7. Vercel auto-deploys

---

## Environment Variables

### Required Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

### Where to Set

| Environment | Location |
|-------------|----------|
| Local | `.env.local` file |
| Vercel | Project Settings > Environment Variables |

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vercel Docs](https://vercel.com/docs)
