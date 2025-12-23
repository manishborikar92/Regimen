# System Architecture

## Overview

The Routine Tracker is a Progressive Web App (PWA) built with a modern serverless architecture. It uses Firebase for authentication and database, Next.js for the frontend, and Vercel for hosting.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Next.js 16 App Router                    ││
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ ││
│  │  │ Login   │  │Dashboard│  │ Habits  │  │   Analytics     │ ││
│  │  │ Page    │  │  Page   │  │  Page   │  │     Page        │ ││
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘ ││
│  │                         │                                   ││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │                  Context Providers                      │││
│  │  │  AuthContext (auth state) │ DataContext (habits, logs)  │││
│  │  └─────────────────────────────────────────────────────────┘││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │              Shared Components                          │││
│  │  │  habits/: HabitCard, HabitAccordion, HabitModal, Streak │││
│  │  │  ui/: BottomNav, LoadingSpinner                         │││
│  │  └─────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Firebase Services                          │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │   Firebase Auth     │    │      Firestore Database         │ │
│  │  ┌───────────────┐  │    │  ┌───────────┐ ┌─────────────┐  │ │
│  │  │ Google Sign-In│  │    │  │  habits   │ │  dailyLogs  │  │ │
│  │  └───────────────┘  │    │  │ Collection│ │  Collection │  │ │
│  └─────────────────────┘    │  └───────────┘ └─────────────┘  │ │
│                             └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | React Framework | 16.x |
| React | UI Library | 19.x |
| Tailwind CSS | Styling | 4.x |

### Backend Services
| Service | Purpose | Tier |
|---------|---------|------|
| Firebase Auth | Authentication | Free |
| Firestore | Database | Free |
| Vercel | Hosting | Free |

### Key Libraries
| Library | Purpose |
|---------|---------|
| firebase | Firebase SDK (v10+ modular) |
| next/font | Font optimization |

---

## Centralized State Management

The application uses React Context for centralized state management, eliminating redundant Firebase API calls across pages.

### Context Architecture

```
layout.js
└── AuthProvider (Authentication State)
    └── DataProvider (Habits & Logs State)
        └── {children} (All Pages)
```

### AuthContext (`contexts/AuthContext.js`)
Manages authentication state:
- `user` - Current Firebase user object
- `loading` - Auth loading state
- `signInWithGoogle()` - Google sign-in
- `signOut()` - Sign out

### DataContext (`contexts/DataContext.js`)
Centralized data management with real-time updates:

**State:**
- `habits` - All user habits (real-time listener)
- `dailyLogs` - Historical completion logs
- `todayLog` - Today's completed habit IDs (real-time listener)
- `loading` / `error` - Loading and error states

**Computed Values:**
- `todaysHabits` - Habits filtered by today's day of week
- `todayStats` - `{ total, completed, percentage }`
- `streak` - Current streak count

**Actions:**
- `toggleHabit(habitId)` - Toggle habit completion (optimistic update)
- `addHabit(habitData)` - Create new habit
- `updateHabit(habitId, habitData)` - Update existing habit
- `deleteHabit(habitId)` - Delete habit
- `seedHabits(seedData)` - Seed sample habits
- `fetchDailyLogs(days)` - Fetch historical logs for analytics

### Benefits of Centralized State
1. **Single Firebase Connection** - One real-time listener for habits, shared across all pages
2. **No Redundant Fetches** - Data loaded once, available everywhere
3. **Optimistic Updates** - UI updates immediately, syncs in background
4. **Consistent State** - All components see the same data
5. **Simplified Components** - Pages just consume data via hooks

---

## Data Flow

### Authentication Flow
```
User clicks "Sign in with Google"
         │
         ▼
┌─────────────────────┐
│  Firebase Auth      │
│  (Google Provider)  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  AuthContext        │
│  - user state       │
│  - loading state    │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  DataContext        │
│  (initializes when  │
│   user available)   │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Protected Routes   │
│  - /dashboard       │
│  - /habits          │
│  - /analytics       │
└─────────────────────┘
```

### Habit Data Flow (Centralized)
```
┌─────────────────────────────────────────────────────────────┐
│                   INITIALIZATION                            │
│                                                             │
│  DataProvider mounts (user authenticated)                   │
│         │                                                   │
│         ▼                                                   │
│  onSnapshot() listener on habits collection                 │
│         │                                                   │
│         ▼                                                   │
│  Habits stored in context state                             │
│         │                                                   │
│         ▼                                                   │
│  All pages receive habits via useData() hook                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      WRITE FLOW                             │
│                                                             │
│  User creates/edits habit via HabitModal                    │
│         │                                                   │
│         ▼                                                   │
│  Call addHabit/updateHabit from useData()                   │
│         │                                                   │
│         ▼                                                   │
│  Firestore write with userId attached                       │
│         │                                                   │
│         ▼                                                   │
│  onSnapshot() triggers → context state updates              │
│         │                                                   │
│         ▼                                                   │
│  All consuming components re-render automatically           │
└─────────────────────────────────────────────────────────────┘
```

### Daily Log Flow
```
User checks habit checkbox
         │
         ▼
┌─────────────────────────────────────────┐
│  toggleHabit(habitId) called            │
│  from DataContext                       │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Optimistic update: todayLog state      │
│  updates immediately                    │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Firestore write (setDoc/updateDoc)     │
│  Document ID: {userId}_{YYYY-MM-DD}     │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  onSnapshot() confirms update           │
│  (or reverts on error)                  │
└─────────────────────────────────────────┘
```

---

## Component Architecture

```
layout.js
└── AuthProvider
    └── DataProvider
        └── {children}
            ├── page.js (redirect logic)
            ├── login/page.js
            │   └── Google Sign-In Button
            ├── dashboard/page.js
            │   ├── StreakCounter (uses useData)
            │   ├── Progress Bar (uses todayStats)
            │   ├── HabitCard (uses toggleHabit)
            │   ├── HabitAccordion (uses toggleHabit)
            │   └── BottomNav
            ├── habits/page.js
            │   ├── Habit List (uses habits)
            │   ├── HabitModal (uses addHabit/updateHabit)
            │   ├── Delete (uses deleteHabit)
            │   └── BottomNav
            └── analytics/page.js
                ├── Calendar Grid (uses dailyLogs)
                ├── Stats Cards (uses habits, dailyLogs)
                └── BottomNav
```

### Folder Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── analytics/page.js
│   ├── dashboard/page.js
│   ├── habits/page.js
│   ├── login/page.js
│   ├── layout.js           # Root layout with providers
│   └── page.js             # Landing/redirect
├── components/
│   ├── habits/             # Habit-specific components
│   │   ├── HabitAccordion.js
│   │   ├── HabitCard.js
│   │   ├── HabitModal.js
│   │   ├── StreakCounter.js
│   │   └── index.js
│   └── ui/                 # Generic UI components
│       ├── BottomNav.js
│       ├── LoadingSpinner.js
│       └── index.js
├── contexts/               # React Context providers
│   ├── AuthContext.js
│   ├── DataContext.js
│   └── index.js
├── lib/
│   └── firebase.js         # Firebase initialization
└── utils/
    └── dateHelpers.js      # Date utility functions
```

---

## Security Architecture

### Client-Side Security
- Firebase Auth manages user sessions
- Auth state checked before rendering protected content
- Redirect to `/login` if not authenticated

### Database Security (Firestore Rules)
```
habits/{habitId}
├── READ:   userId == auth.uid
├── CREATE: request.data.userId == auth.uid
├── UPDATE: resource.data.userId == auth.uid
└── DELETE: resource.data.userId == auth.uid

dailyLogs/{logId}
└── READ/WRITE: logId starts with auth.uid
```

### Data Isolation
- Each user's data is completely isolated
- Queries always filter by `userId`
- Security rules enforce at database level

---

## Offline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Firestore SDK                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              IndexedDB Persistence                      ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  ││
│  │  │   habits    │  │  dailyLogs  │  │  Pending Writes │  ││
│  │  │   (cached)  │  │   (cached)  │  │    (queue)      │  ││
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Optimizations

1. **Centralized Data Fetching** - Single Firebase listener shared across pages
2. **Real-time Listeners** - `onSnapshot()` for habits and today's log
3. **Optimistic Updates** - UI updates before Firestore confirms
4. **Memoized Computed Values** - `useMemo` for filtered habits and stats
5. **Callback Memoization** - `useCallback` for action functions
6. **Offline Persistence** - Firestore SDK handles caching automatically

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Edge Network (CDN)                    ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  ││
│  │  │   Static    │  │   API       │  │    Next.js      │  ││
│  │  │   Assets    │  │   Routes    │  │    Runtime      │  ││
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase (Google Cloud)                  │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   Authentication    │    │         Firestore           │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
