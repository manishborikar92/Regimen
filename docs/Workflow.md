# Development Workflow

## Overview

This document describes the development workflow for the Routine Tracker application, including setup, development, testing, and deployment processes based on Next.js App Router and Firebase.

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

# 2. Navigate to the web directory
cd web

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

### 5. Deploy Security Rules & Indexes via CLI
Run the following from the **`web/` directory**:
1. Install the Firebase CLI tools globally (if you haven't already) and login:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Initialize Firebase to link your default project, then deploy the predefined Firestore Rules and composite Indexes:
   ```bash
   firebase init firestore
   firebase deploy --only firestore
   ```
   *Note: During `init`, do NOT overwrite the existing local `firestore.rules` and `firestore.indexes.json` files if it prompts you.*
---

## Development Workflow

### Daily Development

```bash
# Start dev server
npm run dev

# Open in browser
# http://localhost:3000
```

### Code Structure Configuration

```
web/
├── src/
│   ├── app/                    # Next.js 16 App Router
│   ├── components/             # Presentation UI
│   ├── contexts/               # React Providers
│   ├── hooks/                  # Specialized logical segments
│   ├── lib/                    # Firebase / Constants / Seeding
│   └── utils/                  # Pure math / formatting
├── public/                     # Icons & Manifest
├── firestore.rules
├── firestore.indexes.json
├── package.json
└── tailwind.config.mjs         # Tailwind configuration
```

### Making Changes
1. **Pages:** Edit files inside route groups `src/app/(protected)` or `src/app/(auth)`.
2. **Components:** Edit files in `src/components/habits/` or `src/components/ui/`
3. **Styles:** Update `globals.css` custom variables or standard Tailwind classes.
4. **Data Logic:** Modify custom hooks in `src/hooks/` (e.g. `use-habits.js`).
5. **Constants:** Edit central definitions like `src/lib/constants/categories.js`.

### Hot Reload
- Changes auto-reload in browser via Turbopack.
- No need to restart the development server.

---

## Testing Workflow

### Manual Testing Checklist

#### Authentication
- [ ] Google Sign-In works
- [ ] Landing page intelligently redirects to `/dashboard` or `/login`
- [ ] Sign out works triggers `/login`
- [ ] Direct linking to `/habits` while signed out redirects correctly

#### Dashboard & Habits
- [ ] Add new habit validates (require title, valid frequency)
- [ ] Add new habit displays gracefully
- [ ] Checkboxes animate cleanly and immediately update progress bars
- [ ] "Delete" opens a `<ConfirmDialog/>` popup 
- [ ] Toast notifications slide up sequentially on saves and fails

#### Analytics
- [ ] Calendar grid aligns spaces before the 1st of the month
- [ ] Colors accurately reflect the daily completion percentage
- [ ] Tapping a calendar day loads precise habit history

#### Cross-Device
- [ ] Tested offline: toggling checkboxes buffers changes to sync when restored
- [ ] Checked mobile dimensions (nav sticks to bottom, grid remains legible)

---

## Build & Deploy

### Local Build Test

```bash
# Lint source code
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Vercel Deployment

1. Make sure to commit changes to GitHub
2. Connect the repository in the Vercel Dashboard
3. Set the Root Directory to `web`
4. Add the massive array of Environment Variables matching your local `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - etc...
5. Ensure `middleware.js` appropriately blocks restricted paths during Edge rendering.

---

## Adding New Features

### Appending Pages

```bash
mkdir -p src/app/\(protected\)/settings
touch src/app/\(protected\)/settings/page.js
```

```javascript
'use client';

import { useAuth, useData } from '@/contexts';
import { TopNav } from '@/components/ui';

export default function SettingsPage() {
  const { user } = useAuth();
  
  return (
    <>
      <TopNav title="Settings" />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <p>Config options for {user.displayName}</p>
      </main>
    </>
  );
}
```

### Expanding the Design System

To add a new Category:
1. Update `src/lib/constants/categories.js` to define styling and the Lucide Icon mappings.
2. Update `firestore.rules` to permit the new category string.
3. Update `globals.css` if necessary to allocate matching semantic colors.

---

## Troubleshooting

### "Missing or insufficient permissions"
- Confirm the habit's `userId` payload rigidly matches `request.auth.uid`.
- Ensure rules are fully deployed via the Firebase Dashboard.

### "Null Document Error / Firebase SDK"
- Restart dev server to clear broken cached initialization variables.
- Ensure `persistentLocalCache` initialized without Tab Conflicts.

### Route Loops
- Verify `middleware.js` is filtering URLs correctly without matching static assets like `.svg` files or Next.js `_next` system routes.
