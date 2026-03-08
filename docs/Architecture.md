# System Architecture

## Overview

The Routine Tracker is a Progressive Web App (PWA) built with a modern serverless architecture. It uses Firebase for authentication and database operations, Next.js for the frontend, and is designed to run seamlessly on hosting platforms like Vercel.

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
│  │                         ▼                                   ││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │                  Context Providers                      │││
│  │  │  AuthContext (auth state) │ DataContext (habits, logs)  │││
│  │  │                     ToastContext                        │││
│  │  └─────────────────────────────────────────────────────────┘││
│  │                         │                                   ││
│  │                         ▼                                   ││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │              Shared UI Components                       │││
│  │  │  habits/: HabitCard, HabitAccordion, HabitModal, Streak │││
│  │  │  ui/: BottomNav, TopNav, ConfirmDialog, LoadingSpinner  │││
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
| Next.js | React Framework | 16.1.x |
| React | UI Library | 19.x |
| Tailwind CSS | Styling | 4.x |
| Lucide React | Iconography | 0.x |

### Backend Services
| Service | Purpose | Tier |
|---------|---------|------|
| Firebase Auth | Authentication | Free |
| Firestore | Real-time Database | Free |

### Key Libraries
| Library | Purpose |
|---------|---------|
| firebase | Firebase SDK (v10+ modular) |
| clsx | Class list merging utility |

---

## Centralized State Management

The application uses React Context to prevent redundant Firebase API calls and provide immediate optimistic UI updates.

### Context Architecture

```
layout.js
└── AuthProvider (Authentication State)
    └── DataProvider (Habits & Logs State)
        └── ToastProvider (Notification State)
            └── {children} (All Pages)
```

### AuthContext (`contexts/AuthContext.js`)
Manages authentication state via Firebase hooks:
- `user` - Current Firebase user object
- `loading` - Initialization state
- `signInWithGoogle()` - Trigger Google OAuth flow
- `logout()` - Sign out and clear sessions

### DataContext (`contexts/DataContext.js`)
Delegates complex operations to specialized sub-hooks (`useHabits`, `useDailyLogs`, `useStreak`, `useAnalytics`) and provides a unified interface:

**State:**
- `habits` - All user habits via `onSnapshot` listener
- `dailyLogs` - Historical completion logs
- `todayLog` - Today's completed habit IDs via `onSnapshot`
- Loading and error states

**Computed Values:**
- `todaysHabits` - Habits filtered by today's day of week
- `todayStats` - `{ total, completed, percentage }`
- `streak` - Current globally computed streak

**Actions:**
- `toggleHabit(habitId)` - Toggle habit completion (optimistic update)
- `addHabit(habitData)` - Create new habit
- `updateHabit(habitId, habitData)` - Update existing habit
- `deleteHabit(habitId)` - Delete habit
- `seedHabits(seedData)` - Populate sample habits for new users
- `fetchDailyLogs(days)` - Fetch historical records

### ToastContext (`contexts/ToastContext.js`)
Provides accessible, unified toast notifications:
- Eliminates native `alert()` blocking calls.
- `addToast(message, type)` triggers auto-dismissing visual alerts.

---

## Data Flow

### Authentication & Routing Flow
Next.js server-side `middleware.js` checks for Firebase auth session cookies:
1. Validates unauthenticated requests to protected groups (`/dashboard`, `/habits`, `/analytics`) bouncing them to `/login`.
2. Roots `/` direct to either `/dashboard` or `/login` respectively.
3. Client-side AuthContext confirms layout rendering.

### Write Flow (Centralized)
```
┌─────────────────────────────────────────────────────────────┐
│                      WRITE SEQUENCE                         │
│                                                             │
│  User checks habit box on Dashboard                         │
│         │                                                   │
│         ▼                                                   │
│  toggleHabit() fires from DataContext                       │
│         │                                                   │
│         ▼                                                   │
│  Optimistic ArrayUnion pushes ID locally                    │
│  ProgressBar fills immediately (No latency)                 │
│         │                                                   │
│         ▼                                                   │
│  Firestore process pushes updateDoc request                 │
│         │                                                   │
│         ▼                                                   │
│  onSnapshot triggers success and revalidates state          │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

```
app/
├── (auth)/                             # Unauthenticated Route Group
│   ├── layout.js                       # Empty minimalist layout
│   └── login/page.js                   # Google SSO & Benefits
├── (protected)/                        # Authenticated Route Group
│   ├── layout.js                       # Secure Guard + BottomNav
│   ├── dashboard/page.js
│   │   ├── StreakCounter
│   │   ├── HabitCard / HabitAccordion
│   │   └── loading.js                  # Next.js Streaming Fallbacks
│   ├── habits/page.js
│   │   ├── HabitModal                  # CRUD Modal with strict validation
│   │   ├── ConfirmDialog
│   │   └── loading.js
│   └── analytics/page.js
│       ├── Calendar Grid (Spaced automatically)
│       └── loading.js
├── error.js                            # Root React Error Boundary
├── not-found.js                        # App-styled 404 page
├── layout.js                           # Master Providers Wrapper
└── page.js                             # Root Redirector
```

### Folder Structure

```
src/
├── app/                  # Next.js 16 App Router
├── components/           
│   ├── habits/           # Domain-specific components
│   └── ui/               # Reusable primitives (Nav, Dialogs, Spinners)
├── contexts/             # Global React Contexts
├── hooks/                # Separated Domain Logic (useStreak, etc)
├── lib/                  
│   ├── constants/        # Centralized categories & styling configs
│   ├── firebase/         # Firebase initialization & operations
│   └── seed-data.js      # Onboarding initialization template
└── utils/                # Pure functions (date formatting)
```

---

## Security Architecture

### Rules Validation
Firestore rules strictly validate inbound data to prevent malformed writes:
```
match /habits/{habitId} {
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.title is string
    && request.resource.data.title.size() > 0
    && request.resource.data.title.size() <= 200
    && request.resource.data.category in ['Schedule', 'Movement', 'Nutrition', 'Recovery'];
}
```

### Route Groups
The `(protected)` directory enforces client-side layout guards via Layout cascading, backed by `middleware.js` executing edge-level cookie validation to prevent flashing of unauthorized content.

---

## Offline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Firestore SDK                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │          persistentLocalCache (Modern Config)           ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  ││
│  │  │   habits    │  │  dailyLogs  │  │  Pending Writes │  ││
│  │  │   (cached)  │  │   (cached)  │  │    (queue)      │  ││
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```
The App is configured to use the modern `persistentLocalCache` API, ensuring users can open the app, check off their habits on a subway, and have it sync completely when connection is restored.

---

## Design System

The application uses custom CSS variables within `globals.css` combined with Tailwind CSS v4 to enforce strict design token consistency, eliminating rogue inline colors.

Specifically, **Category Styles** are statically defined in `lib/constants/categories.js` ensuring that when a habit changes to 'Movement', its icon, border, and badge color instantly match globally across the HabitCard, Analytics, and Edit interfaces without logic duplication.
