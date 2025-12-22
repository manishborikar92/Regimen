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
│  │  │              Shared Components                          │││
│  │  │  AuthProvider │ BottomNav │ HabitCard │ HabitModal      │││
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
│                             │  ┌───────────┐                  │ │
│                             │  │   users   │                  │ │
│                             │  │ Collection│                  │ │
│                             │  └───────────┘                  │ │
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
| firebase | Firebase SDK |
| next/font | Font optimization |

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
│  AuthProvider       │
│  (React Context)    │
│  - user state       │
│  - loading state    │
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

### Habit Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                      READ FLOW                              │
│                                                             │
│  Dashboard/Habits/Analytics Page                            │
│         │                                                   │
│         ▼                                                   │
│  query(habitsRef, where('userId', '==', user.uid))          │
│         │                                                   │
│         ▼                                                   │
│  Firestore returns user's habits only                       │
│         │                                                   │
│         ▼                                                   │
│  Filter by frequency (dashboard only)                       │
│         │                                                   │
│         ▼                                                   │
│  Sort by order field                                        │
│         │                                                   │
│         ▼                                                   │
│  Render habit cards                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      WRITE FLOW                             │
│                                                             │
│  User creates/edits habit                                   │
│         │                                                   │
│         ▼                                                   │
│  HabitModal validates input                                 │
│         │                                                   │
│         ▼                                                   │
│  addDoc/updateDoc with userId attached                      │
│         │                                                   │
│         ▼                                                   │
│  Firestore security rules verify userId                     │
│         │                                                   │
│         ▼                                                   │
│  Document saved, UI refreshes                               │
└─────────────────────────────────────────────────────────────┘
```

### Daily Log Flow
```
User checks habit checkbox
         │
         ▼
┌─────────────────────────────────────────┐
│  Check if dailyLog exists for today     │
│  Document ID: {userId}_{YYYY-MM-DD}     │
└─────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 Exists    Doesn't Exist
    │         │
    ▼         ▼
updateDoc   setDoc
(arrayUnion/ (create new
arrayRemove) document)
    │         │
    └────┬────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  onSnapshot() triggers UI update        │
│  (Real-time sync across devices)        │
└─────────────────────────────────────────┘
```

---

## Component Architecture

```
layout.js
└── AuthProvider (Context)
    └── {children}
        ├── page.js (redirect logic)
        ├── login/page.js
        │   └── Google Sign-In Button
        ├── dashboard/page.js
        │   ├── StreakCounter
        │   ├── Progress Bar
        │   ├── HabitCard (simple habits)
        │   ├── HabitAccordion (with checklist)
        │   └── BottomNav
        ├── habits/page.js
        │   ├── Habit List
        │   ├── Add/Edit/Delete Buttons
        │   ├── HabitModal
        │   ├── Delete Confirmation Modal
        │   └── BottomNav
        └── analytics/page.js
            ├── View Toggle (Calendar/Stats)
            ├── Calendar Grid
            ├── Stats Cards
            ├── Per-Habit Performance
            └── BottomNav
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

users/{userId}
└── READ/WRITE: userId == auth.uid
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
                              │
                              ▼
                    ┌─────────────────┐
                    │  Online/Offline │
                    │    Detection    │
                    └─────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
        ┌──────────┐                   ┌──────────┐
        │  Online  │                   │ Offline  │
        │  - Sync  │                   │ - Cache  │
        │  - Write │                   │ - Queue  │
        └──────────┘                   └──────────┘
```

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/seed` | POST | Seed sample habits for a user |

### Seed API Request
```javascript
POST /api/seed
Content-Type: application/json

{
  "userId": "firebase_uid"
}
```

### Seed API Response
```javascript
// Success
{ "success": true, "message": "Successfully seeded habits", "count": 10 }

// Already seeded
{ "success": true, "message": "User already has habits", "count": 10 }

// Error
{ "success": false, "error": "Error message" }
```

---

## Performance Considerations

### Optimizations
1. **Firestore Queries:** Always filter by `userId` to minimize reads
2. **Real-time Listeners:** Single `onSnapshot()` per page
3. **Optimistic Updates:** UI updates before Firestore confirms
4. **Offline Persistence:** Reduces network requests

### Caching Strategy
- Firestore SDK handles caching automatically
- IndexedDB stores documents locally
- Stale-while-revalidate pattern for reads

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
