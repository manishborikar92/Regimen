# Complete Specification Document for Routine Tracker Web App

## Project Overview
A Progressive Web App (PWA) built with Next.js 16 to track a specific daily health routine protocol. The app features authentication, MongoDB storage, and a clean interface for checking off daily habits with nested exercise routines.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Authentication:** Firebase Auth (Google Sign-In)
- **Database:** MongoDB with Mongoose ODM
- **Deployment:** Vercel
- **PWA:** Installable on mobile devices

---

## Core Features

### 1. Authentication System
- Google Sign-In via Firebase
- Global auth context provider
- Protected routes for dashboard
- Simple login/logout flow

### 2. Data Models

#### User Schema
```typescript
{
  _id: ObjectId,
  email: String,
  uid: String // Firebase UID
}
```

#### Habit Schema
```typescript
{
  title: String, // e.g., "Morning Posture Routine"
  time: String, // e.g., "08:00 AM"
  category: 'Schedule' | 'Movement' | 'Nutrition' | 'Recovery',
  instructions: String, // Markdown or plain text
  checklistItems: [{
    label: String, // e.g., "Chin Tucks (10 Reps)"
    isCompleted: Boolean
  }],
  frequency: [String] // ['Mon', 'Tue', 'Wed', ...]
}
```

#### DailyLog Schema
```typescript
{
  userId: String,
  date: String, // "2025-12-22" (YYYY-MM-DD format)
  completedHabitIds: [ObjectId],
  notes: String,
  createdAt: Date
}
```

### 3. Seed Data (Pre-defined Routine)

**Morning (08:00 AM - 11:00 AM)**
- Wake Up & Hydrate (08:00 AM) - Schedule
- Movement A: Morning Posture Routine (08:15 AM) - Movement
  - Chin Tucks (10 Reps) - Hold 3s
  - Doorway Stretch (Hold 30s)
  - Wall Angels (10 Slow Reps)
  - Scapular Squeezes (15 Reps)
  - *Frequency: Mon-Sat (REST on Sunday)*
- Breakfast: The Chunky Monkey Shake (08:45 AM) - Nutrition
- Sunlight Exposure (11:00 AM) - Recovery

**Afternoon (02:00 PM - 06:00 PM)**
- Lunch: Solid Meal (02:00 PM) - Nutrition
- Afternoon Snack (06:00 PM) - Nutrition

**Evening (08:00 PM - 12:00 AM)**
- Movement B: Evening Stability Routine (08:00 PM) - Movement
  - Dead Bugs (10 Reps)
  - Glute Bridges (3 Sets of 10)
  - Seated Hamstring Stretch (30s per leg)
  - Clamshells (10 Reps per side)
  - Legs-Up-The-Wall (5 Minutes) - DO LAST
  - *Frequency: Mon-Sat (REST on Sunday)*
- Dinner (10:00 PM) - Nutrition
- Wind Down (No Screens) (11:30 PM) - Recovery
- Sleep (12:00 AM) - Recovery

### 4. Dashboard Features

**Main View:**
- Current date display prominently
- Streak counter (consecutive days with >50% completion)
- List of today's habits sorted by time
- Category color coding (Movement, Nutrition, Recovery, Schedule)
- Checkbox for simple habits
- Accordion/expandable view for habits with checklists (Movement routines)

**Interaction:**
- Click checkbox → toggle completion → update DailyLog
- Expand accordion → view exercise checklist details
- Visual feedback for completed items
- Progress indicator (X of Y completed today)

**Additional Views:**
- Simple calendar/history view (optional for later)
- Settings/profile page

### 5. PWA Configuration
- `manifest.json` with app name, icons, theme colors
- Metadata configuration for Next.js 16
- Installable on iOS/Android home screen
- Full-screen mode (no browser chrome)
- App icons (512x512, 192x192)

---

## File Structure

```
routine-tracker/
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── public/
│   ├── manifest.json
│   └── icons/ (app icons)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (redirects to dashboard)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── habits/
│   │       │   └── route.ts
│   │       ├── daily-log/
│   │       │   ├── route.ts (GET/POST)
│   │       │   └── toggle/
│   │       │       └── route.ts
│   │       └── seed/
│   │           └── route.ts
│   ├── components/
│   │   ├── AuthProvider.tsx
│   │   ├── HabitCard.tsx
│   │   ├── HabitAccordion.tsx
│   │   └── StreakCounter.tsx
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── mongodb.ts
│   │   └── seedData.ts
│   └── models/
│       ├── User.ts
│       ├── Habit.ts
│       └── DailyLog.ts
└── scripts/
    └── seed.js
```

---

## Environment Variables Required

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# MongoDB
MONGODB_URI=
```

---

## API Endpoints

1. **GET /api/habits** - Fetch all habits filtered by current day
2. **GET /api/daily-log?date=YYYY-MM-DD** - Fetch log for specific date
3. **POST /api/daily-log** - Create/update daily log
4. **POST /api/daily-log/toggle** - Toggle habit completion
5. **POST /api/seed** - One-time seed script (development only)

---

## UI/UX Requirements

### Design Principles
- Clean, minimal interface
- Mobile-first responsive design
- High contrast for readability
- Color-coded categories:
  - Movement: Blue
  - Nutrition: Green
  - Recovery: Purple
  - Schedule: Gray

### Key Interactions
- Instant visual feedback on checkbox click
- Smooth accordion animations
- Loading states for API calls
- Error handling with user-friendly messages
- Offline capability (cache today's data)

---

## Development Phases

**Phase 1: Setup & Auth (2 hours)**
- Project scaffolding
- Firebase configuration
- Auth context provider
- Login page

**Phase 2: Database & Models (2 hours)**
- MongoDB connection
- Mongoose schemas
- Seed script with provided routine
- API routes for data fetching

**Phase 3: Dashboard Core (3 hours)**
- Main dashboard layout
- Habit list rendering
- Checkbox toggle logic
- Accordion for Movement routines
- DailyLog creation/updating

**Phase 4: Polish & PWA (2 hours)**
- Streak counter logic
- PWA manifest and metadata
- Deployment configuration
- Testing on mobile device

---

## Critical Implementation Notes

1. **No Manual Habit Creation UI Initially** - The routine is hardcoded/seeded. Building a CRUD interface for habits is out of scope for day 1.

2. **Smart DailyLog Logic** - Don't pre-create log entries. The UI renders the master habit list every day. Only create/update a DailyLog document when the user checks their first item.

3. **Frequency Filtering** - When fetching habits for "Today", filter by the `frequency` array. If today is Sunday, exclude habits that don't include 'Sun'.

4. **Accordion State** - The checklist items in Movement routines are for display only. The main habit has one checkbox. Expanding shows the exercise list for reference during workout.

5. **Streak Calculation** - Query last N days of DailyLogs. Count consecutive days where `completedHabitIds.length / totalHabitsForThatDay >= 0.5`.

---

