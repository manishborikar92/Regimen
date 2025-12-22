# Complete Specification Document for Routine Tracker Web App

## Project Overview
A Progressive Web App (PWA) built with Next.js 16 to track a specific daily health routine protocol. The app features authentication, cloud database storage, and a clean interface for checking off daily habits with nested exercise routines.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, JavaScript)
- **Styling:** Tailwind CSS
- **Authentication:** Firebase Auth (Google Sign-In) - **Free Tier**
- **Database:** **Firebase Firestore** - **Free Tier** (See design decision below)
- **Deployment:** Vercel - **Free Tier**
- **PWA:** Installable on mobile devices

---

## Database Design Decision: Firestore vs MongoDB

### **Choice: Firebase Firestore (Winner)**

**Rationale:**

#### **1. Cost - 100% Free for This Use Case**
- **Firestore Free Tier:**
  - 50,000 reads/day
  - 20,000 writes/day
  - 1 GB storage
  - For a single-user app checking ~11 habits/day: ~11 writes + ~20 reads/day = **Well within free limits**
  
- **MongoDB Atlas Free Tier:**
  - 512 MB storage
  - Limited to M0 cluster
  - Connection limits can be restrictive
  - May require credit card for setup

**Winner: Firestore** - Generous free tier, no credit card required.

#### **2. Simplicity - Faster Development**
- **Firestore:**
  - Same Firebase SDK as authentication (one setup)
  - No separate connection string management
  - Built-in real-time listeners (bonus feature: live updates)
  - Automatic indexing
  
- **MongoDB:**
  - Separate service setup
  - Mongoose ODM configuration
  - Manual connection pooling
  - Index management required

**Winner: Firestore** - Single Firebase setup, less configuration.

#### **3. Scalability - Both Sufficient**
- This is a **personal tracker** (single user)
- Both can handle thousands of users easily
- Firestore scales automatically with zero configuration
- MongoDB requires manual scaling considerations

**Winner: Tie** (but Firestore requires zero effort to scale)

#### **4. Data Structure Fit**
- **Firestore:**
  - Document-based (perfect for habits + daily logs)
  - Supports subcollections (could nest exercise checklists)
  - Supports arrays (completedHabitIds)
  
- **MongoDB:**
  - Also document-based
  - Slightly more flexible schema

**Winner: Tie** (both excellent for this structure)

#### **5. Development Speed**
- Firestore integrates seamlessly with Firebase Auth
- No backend API routes needed for CRUD (can use Firebase SDK directly from client)
- Real-time updates out of the box

**Winner: Firestore**

### **Final Verdict: Firestore**
For a single-user, personal tracking app built in one day, **Firestore is the superior choice** due to:
- 100% free for this use case
- Faster setup (same SDK as auth)
- No backend API boilerplate required
- Real-time updates as a bonus

---

## Core Features

### 1. Authentication System
- Google Sign-In via Firebase Auth (Free)
- Global auth context provider
- Protected routes for dashboard
- Simple login/logout flow

### 2. Data Models (Firestore Collections)

#### **Collection: `users`**
```javascript
Document ID: {uid} // Firebase UID
{
  email: "user@example.com",
  createdAt: Timestamp,
  displayName: "User Name"
}
```

#### **Collection: `habits`**
```javascript
Document ID: Auto-generated
{
  title: "Morning Posture Routine",
  time: "08:15 AM",
  category: "Movement", // 'Schedule', 'Movement', 'Nutrition', 'Recovery'
  instructions: "Focus: Neck, Shoulders...",
  checklistItems: [
    { label: "Chin Tucks (10 Reps)" },
    { label: "Doorway Stretch (Hold 30s)" }
  ],
  frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // Days active
  order: 1 // For sorting
}
```

#### **Collection: `dailyLogs`**
```javascript
Document ID: {uid}_{YYYY-MM-DD} // e.g., "abc123_2025-12-22"
{
  userId: "abc123",
  date: "2025-12-22",
  completedHabitIds: ["habitId1", "habitId2"],
  notes: "",
  createdAt: Timestamp
}
```

### 3. Seed Data (Pre-defined Routine)

**Morning (08:00 AM - 11:00 AM)**
- **Wake Up & Hydrate** (08:00 AM) - Schedule - Daily
  - Instructions: "Drink 500ml water immediately upon waking."
  
- **Movement A: Morning Posture Routine** (08:15 AM) - Movement - Mon-Sat
  - Instructions: "Focus: Neck, Shoulders, Forward Head Posture. *Pain vs Discomfort: Sharp pain means stop immediately.*"
  - Checklist Items:
    - Chin Tucks (10 Reps) - Hold 3s
    - Doorway Stretch (Hold 30s)
    - Wall Angels (10 Slow Reps)
    - Scapular Squeezes (15 Reps)
    
- **Breakfast: The Chunky Monkey Shake** (08:45 AM) - Nutrition - Daily
  - Instructions: "Blend: 2 Bananas, 1 Glass Full-Cream Milk, 2 tbsp Peanut Butter, 1 tbsp Honey. *Rule: Never Skip Breakfast.*"
  
- **Sunlight Exposure** (11:00 AM) - Recovery - Daily
  - Instructions: "10-15 minutes of direct sun for Vitamin D."

**Afternoon (02:00 PM - 06:00 PM)**
- **Lunch: Solid Meal** (02:00 PM) - Nutrition - Daily
  - Instructions: "Rice/Roti + Protein + Curd."
  
- **Afternoon Snack** (06:00 PM) - Nutrition - Daily
  - Instructions: "Nuts, Boiled Eggs, or Fruit."

**Evening (08:00 PM - 12:00 AM)**
- **Movement B: Evening Stability Routine** (08:00 PM) - Movement - Mon-Sat
  - Instructions: "Focus: Waist Stiffness, Pelvic Tilt, Legs."
  - Checklist Items:
    - Dead Bugs (10 Reps)
    - Glute Bridges (3 Sets of 10)
    - Seated Hamstring Stretch (30s per leg)
    - Clamshells (10 Reps per side)
    - Legs-Up-The-Wall (5 Minutes) - DO LAST
    
- **Dinner** (10:00 PM) - Nutrition - Daily
  - Instructions: "Similar to lunch but lighter."
  
- **Wind Down (No Screens)** (11:30 PM) - Recovery - Daily
  - Instructions: "Put the phone away. No screens allowed."
  
- **Sleep** (12:00 AM) - Recovery - Daily
  - Instructions: "Lights out completely."

### 4. Dashboard Features

**Main View:**
- Current date display prominently
- Streak counter (consecutive days with >50% completion)
- List of today's habits sorted by time
- Category color coding (Movement, Nutrition, Recovery, Schedule)
- Checkbox for simple habits
- Accordion/expandable view for habits with checklists (Movement routines)

**Interaction:**
- Click checkbox → toggle completion → update Firestore
- Expand accordion → view exercise checklist details
- Visual feedback for completed items
- Progress indicator (X of Y completed today)
- Real-time updates (if you check off on phone, desktop updates automatically)

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
Regimen/
├── docs/
│   ├── Guide.md (this document)
│   ├── Prompt.md (AI implementation prompt)
│   ├── project.md
│   └── update.md
├── regimen/
│   ├── .env.local
│   ├── .gitignore
│   ├── next.config.mjs
│   ├── jsconfig.json
│   ├── package.json
│   ├── package-lock.json
│   ├── eslint.config.mjs
│   ├── postcss.config.mjs
│   ├── README.md
│   ├── public/
│   │   ├── manifest.json
│   │   ├── icons/
│   │   │   ├── icon-192x192.png
│   │   │   └── icon-512x512.png
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   └── src/
│       ├── app/
│       │   ├── layout.js
│       │   ├── page.js
│       │   ├── globals.css
│       │   ├── favicon.ico
│       │   ├── login/
│       │   │   └── page.js
│       │   ├── dashboard/
│       │   │   └── page.js
│       │   └── api/
│       │       └── seed/
│       │           └── route.js
│       ├── components/
│       │   ├── AuthProvider.js
│       │   ├── HabitCard.js
│       │   ├── HabitAccordion.js
│       │   └── StreakCounter.js
│       ├── lib/
│       │   ├── firebase.js
│       │   └── seedData.js
│       └── utils/
│           └── dateHelpers.js
├── LICENSE
└── README.md
```

---

## Environment Variables Required

```
# Firebase (All FREE tier)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**Note:** No MongoDB URI needed! Firestore uses the same Firebase config.

---

## Firestore Operations

**Simplified with Firestore:**

Since Firestore can be accessed directly from the client with security rules, we only need:

1. **POST /api/seed** - One-time seed script (development only)

**Client-side Firestore Operations:**
- Read habits: `getDocs(collection(db, 'habits'))`
- Read daily log: `getDoc(doc(db, 'dailyLogs', '{uid}_{date}'))`
- Toggle habit: `updateDoc()` or `setDoc()` with merge
- Real-time listener: `onSnapshot()` for live updates

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Habits are read-only for all authenticated users
    match /habits/{habitId} {
      allow read: if request.auth != null;
      allow write: if false; // Habits are seeded, not user-editable
    }
    
    // Users can only read/write their own daily logs
    match /dailyLogs/{logId} {
      allow read, write: if request.auth != null 
                          && logId.matches('^' + request.auth.uid + '_.*');
    }
    
    // Users can read their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## UI/UX Requirements

### Design Principles
- Clean, minimal interface
- Mobile-first responsive design
- High contrast for readability
- Color-coded categories:
  - Movement: Blue (#3B82F6)
  - Nutrition: Green (#10B981)
  - Recovery: Purple (#8B5CF6)
  - Schedule: Gray (#6B7280)

### Key Interactions
- Instant visual feedback on checkbox click
- Smooth accordion animations
- Loading states for Firestore operations
- Error handling with user-friendly messages
- Offline capability (Firestore has built-in offline persistence)

---

## Development Phases

**Phase 1: Setup & Auth (1.5 hours)**
- Project scaffolding with JavaScript
- Firebase project creation (enable Auth + Firestore)
- Auth context provider
- Login page

**Phase 2: Firestore Setup & Seed (1.5 hours)**
- Firestore initialization
- Security rules deployment
- Seed script with provided routine
- Test data reading

**Phase 3: Dashboard Core (3 hours)**
- Main dashboard layout
- Habit list rendering from Firestore
- Checkbox toggle logic
- Accordion for Movement routines
- DailyLog creation/updating in Firestore
- Real-time updates

**Phase 4: Polish & PWA (2 hours)**
- Streak counter logic
- PWA manifest and metadata
- Deployment configuration
- Testing on mobile device

---

## Critical Implementation Notes

1. **No Manual Habit Creation UI Initially** - The routine is seeded to Firestore once. Building a CRUD interface for habits is out of scope for day 1.

2. **Smart DailyLog Logic** - Don't pre-create log documents. The UI renders the master habit list every day. Only create/update a DailyLog document when the user checks their first item. Use document ID format: `{uid}_{YYYY-MM-DD}`.

3. **Frequency Filtering** - When displaying habits for "Today", filter by the `frequency` array on the client side. If today is Sunday, exclude habits that don't include 'Sun'.

4. **Accordion State** - The checklist items in Movement routines are for display only. The main habit has one checkbox. Expanding shows the exercise list for reference during workout.

5. **Streak Calculation** - Query last 30 dailyLogs documents for the user. Count consecutive days from today backward where `completedHabitIds.length / totalHabitsForThatDay >= 0.5`.

6. **Firestore Offline Persistence** - Enable by default: `enableIndexedDbPersistence(db)`. This makes the app work offline automatically.

7. **Real-time Updates** - Use `onSnapshot()` for the dashboard to get live updates. If you check a habit on your phone, your desktop browser updates instantly.

---

## Free Tier Usage Estimates

**Daily Firestore Operations (Single User):**
- Dashboard load: ~15 reads (11 habits + 1 daily log + user doc)
- Checking habits: ~11 writes (worst case)
- Real-time listeners: included in reads

**Monthly Totals:**
- Reads: ~450/month (way under 1.5M free tier)
- Writes: ~330/month (way under 600K free tier)
- Storage: <1 MB (way under 1 GB free tier)

**Verdict:** Will never hit free tier limits for personal use.

---

## Component Specifications

### AuthProvider.js
- Creates a React Context for authentication state
- Manages Firebase Auth state with `onAuthStateChanged`
- Provides `user`, `loading`, `signInWithGoogle()`, and `logout()` to all components
- Wraps the entire app in layout.js

### HabitCard.js
- Displays a single habit with checkbox
- Props: `habit`, `isCompleted`, `onToggle`
- Color-coded border based on category
- Shows time and title prominently
- Displays instructions below title
- If habit has `checklistItems`, renders as HabitAccordion instead

### HabitAccordion.js
- Extends HabitCard for habits with checklist items
- Expandable/collapsible section showing exercise list
- Main checkbox at top for marking entire routine complete
- Checklist items displayed in expanded view (read-only, for reference)
- Smooth transition animation

### StreakCounter.js
- Fetches last 30 days of dailyLogs for current user
- Calculates consecutive days from today backward
- Counts day as "complete" if completion rate >= 50%
- Displays: "🔥 X Day Streak"
- Shows 0 if no consecutive days

### Dashboard Page
- Protected route (redirects to /login if not authenticated)
- Fetches habits from Firestore on mount
- Filters habits by today's day of week (frequency array)
- Fetches today's dailyLog (or initializes empty state)
- Real-time listener for dailyLog updates
- Renders habits sorted by time (order field)
- Shows progress: "X of Y habits completed"
- Toggle function updates Firestore dailyLog document

### Login Page
- Simple centered card with Google Sign-In button
- Shows loading state during sign-in
- Redirects to /dashboard on successful auth
- Error handling for auth failures

---

## Seed Data Implementation

### Complete Habits Array (11 items)

```javascript
const seedHabits = [
  {
    title: "Wake Up & Hydrate",
    time: "08:00 AM",
    category: "Schedule",
    instructions: "Drink 500ml water immediately upon waking.",
    checklistItems: [],
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    order: 1
  },
  {
    title: "Movement A: Morning Posture Routine",
    time: "08:15 AM",
    category: "Movement",
    instructions: "Focus: Neck, Shoulders, Forward Head Posture.\n*Pain vs Discomfort: Sharp pain means stop immediately.*",
    checklistItems: [
      { label: "Chin Tucks (10 Reps) - Hold 3s" },
      { label: "Doorway Stretch (Hold 30s)" },
      { label: "Wall Angels (10 Slow Reps)" },
      { label: "Scapular Squeezes (15 Reps)" }
    ],
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    order: 2
  },
  {
    title: "Breakfast: The Chunky Monkey Shake",
    time: "08:45 AM",
    category: "Nutrition",
    instructions: "Blend: 2 Bananas, 1 Glass Full-Cream Milk, 2 tbsp Peanut Butter, 1 tbsp Honey.\n*Rule: Never Skip Breakfast.*",
    checklistItems: [],
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    order: 3
  },
  {
    title: "Sunlight Exposure",
    time: "11:00 AM",
    category: "Recovery",
    instructions: "10-15 minutes of direct sun for Vitamin D.",
    checklistItems: [],
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    order: 4
  },
  {
    title: "Lunch: Solid Meal",
    time: "02:00 PM",
    category: "Nutrition",
    instructions: "Rice/Roti + Protein + Curd.",
    checklistItems: [],
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    order: 5
  },
  {
    title: "Afternoon Snack",
    time: "06:00 PM",
    category: "Nutrition",
    instructions: "Nuts, Boiled Eggs, or Fruit.",
    checklistItems: [],
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    order: 6
  },
  {
    title: "Movement B: Evening Stability Routine",
    time: "08:00 PM",
    category: "Movement",
    instructions: "Focus: Waist Stiffness, Pelvic Tilt, Legs.",
    checklistItems: [
      { label: "Dead Bugs (10 Reps)" },
      { label: "Glute Bridges (3 Sets of 10)" },
      { label: "Seated Hamstring Stretch (30s per leg)" },
      { label: "Clamshells (10 Reps per side)" },
      { label: "Legs-Up-The-Wall (5 Minutes) - DO LAST" }
    ],
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    order: 7
  },
  {
    title: "Dinner",
    time: "10:00 PM",
    category: "Nutrition",
    instructions: "Similar to lunch but lighter.",
    checklistItems: [],
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    order: 8
  },
  {
    title: "Wind Down (No Screens)",
    time: "11:30 PM",
    category: "Recovery",
    instructions: "Put the phone away. No screens allowed.",
    checklistItems: [],
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    order: 9
  },
  {
    title: "Sleep",
    time: "12:00 AM",
    category: "Recovery",
    instructions: "Lights out completely.",
    checklistItems: [],
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    order: 10
  }
];
```

---

## Why This Stack Saves Money

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| Firebase Auth | Unlimited | 1 user | $0 |
| Firestore | 50K reads/day | ~15/day | $0 |
| Firestore | 20K writes/day | ~11/day | $0 |
| Vercel | 100GB bandwidth | <1GB/month | $0 |
| **Total Monthly Cost** | | | **$0.00** |

This setup will remain **100% free forever** for personal use, even if you track daily for years.