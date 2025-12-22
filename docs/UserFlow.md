# User Flow Documentation

## Overview

This document describes the complete user journey through the Routine Tracker application, from first visit to daily usage.

---

## User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     NEW USER JOURNEY                            │
│                                                                 │
│  Visit App → Login → Empty Habits → Load Sample OR Create Own   │
│      │                                    │                     │
│      ▼                                    ▼                     │
│  Dashboard → Check Habits → View Analytics → Manage Habits      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   RETURNING USER JOURNEY                        │
│                                                                 │
│  Visit App → Auto-Login → Dashboard → Check Today's Habits      │
│                              │                                  │
│                              ▼                                  │
│                    View Progress & Streak                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flow 1: First-Time User

### Step 1: Landing Page
```
User visits app
       │
       ▼
┌─────────────────────────────────────┐
│           / (Home Page)             │
│                                     │
│  Check auth state:                  │
│  - Not logged in → Redirect /login  │
│  - Logged in → Redirect /dashboard  │
└─────────────────────────────────────┘
```

### Step 2: Login
```
┌─────────────────────────────────────┐
│           /login                    │
│  ┌─────────────────────────────┐    │
│  │     Routine Tracker         │    │
│  │                             │    │
│  │  Track your daily health    │    │
│  │        routine              │    │
│  │                             │    │
│  │  ┌───────────────────────┐  │    │
│  │  │ Continue with Google  │  │    │
│  │  └───────────────────────┘  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
       │
       ▼
  Google OAuth Popup
       │
       ▼
  Success → Redirect to /dashboard
```

### Step 3: Empty Dashboard (First Visit)
```
┌─────────────────────────────────────┐
│           /dashboard                │
│  ┌─────────────────────────────┐    │
│  │  🔥 0 Day Streak            │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │  Today's Progress: 0 of 0   │    │
│  └─────────────────────────────┘    │
│                                     │
│  No habits scheduled for today.     │
│  Go to Habits to add some! 🎉       │
│                                     │
│  ┌─────────┬─────────┬──────────┐   │
│  │  Today  │ Habits  │Analytics │   │
│  └─────────┴─────────┴──────────┘   │
└─────────────────────────────────────┘
```

### Step 4: Habits Page (Empty State)
```
┌─────────────────────────────────────┐
│           /habits                   │
│  ┌─────────────────────────────┐    │
│  │  Manage Habits    [+ Add]   │    │
│  └─────────────────────────────┘    │
│                                     │
│            📝                       │
│                                     │
│  No habits yet. Create your first!  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │        Add Habit            │    │
│  └─────────────────────────────┘    │
│              or                     │
│  ┌─────────────────────────────┐    │
│  │   Load Sample Routine       │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Step 5a: Load Sample Routine
```
User clicks "Load Sample Routine"
       │
       ▼
┌─────────────────────────────────────┐
│  POST /api/seed                     │
│  { userId: "user_firebase_uid" }    │
└─────────────────────────────────────┘
       │
       ▼
  10 habits created with userId
       │
       ▼
  Page refreshes with habits list
```

### Step 5b: Create Custom Habit
```
User clicks "Add Habit"
       │
       ▼
┌─────────────────────────────────────┐
│         HabitModal                  │
│  ┌─────────────────────────────┐    │
│  │  Add New Habit              │    │
│  │                             │    │
│  │  Title: [____________]      │    │
│  │  Time:  [08:00 AM   ]       │    │
│  │  Category: [Schedule ▼]     │    │
│  │  Instructions:              │    │
│  │  [____________________]     │    │
│  │                             │    │
│  │  Active Days:               │    │
│  │  [M][T][W][T][F][S][S]      │    │
│  │                             │    │
│  │  Checklist Items:           │    │
│  │  [Add item...        ][+]   │    │
│  │                             │    │
│  │  Order: [1]                 │    │
│  │                             │    │
│  │  [Cancel]        [Create]   │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## Flow 2: Daily Usage

### Dashboard View
```
┌─────────────────────────────────────┐
│           /dashboard                │
│  ┌─────────────────────────────┐    │
│  │  Routine Tracker   [Sign out]│   │
│  │  Monday, December 22, 2025   │   │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🔥 5 Day Streak            │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Today's Progress           │    │
│  │  3 of 9 completed           │    │
│  │  [████████░░░░░░░░░] 33%    │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 08:00 AM  Schedule          │    │
│  │ Wake Up & Hydrate       [✓] │    │
│  │ Drink 500ml water...        │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 08:15 AM  Movement          │    │
│  │ Morning Posture Routine [✓] │    │
│  │ ▼ Show 4 exercises          │    │
│  │   • Chin Tucks (10 Reps)    │    │
│  │   • Doorway Stretch         │    │
│  │   • Wall Angels             │    │
│  │   • Scapular Squeezes       │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 08:45 AM  Nutrition         │    │
│  │ Breakfast Shake         [ ] │    │
│  │ Blend: 2 Bananas...         │    │
│  └─────────────────────────────┘    │
│                                     │
│  ... more habits ...                │
│                                     │
│  ┌─────────┬─────────┬──────────┐   │
│  │ ●Today  │ Habits  │Analytics │   │
│  └─────────┴─────────┴──────────┘   │
└─────────────────────────────────────┘
```

### Checking a Habit
```
User taps checkbox
       │
       ▼
┌─────────────────────────────────────┐
│  Optimistic UI Update               │
│  - Checkbox fills immediately       │
│  - Progress bar updates             │
│  - Card fades slightly              │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Firestore Update                   │
│  - If first check today:            │
│    setDoc() creates dailyLog        │
│  - Otherwise:                       │
│    updateDoc() with arrayUnion      │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  onSnapshot() triggers              │
│  - Syncs across all devices         │
│  - Confirms UI state                │
└─────────────────────────────────────┘
```

---

## Flow 3: Habit Management

### Viewing All Habits
```
┌─────────────────────────────────────┐
│           /habits                   │
│  ┌─────────────────────────────┐    │
│  │  Manage Habits    [+ Add]   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 08:00 AM  Schedule  #1      │    │
│  │ Wake Up & Hydrate           │    │
│  │ M T W T F S S               │    │
│  │                    [✏️][🗑️] │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 08:15 AM  Movement  #2      │    │
│  │ Morning Posture Routine     │    │
│  │ M T W T F S                 │    │
│  │ 4 checklist items           │    │
│  │                    [✏️][🗑️] │    │
│  └─────────────────────────────┘    │
│                                     │
│  ... more habits ...                │
└─────────────────────────────────────┘
```

### Editing a Habit
```
User taps edit icon (✏️)
       │
       ▼
┌─────────────────────────────────────┐
│         HabitModal                  │
│  ┌─────────────────────────────┐    │
│  │  Edit Habit                 │    │
│  │                             │    │
│  │  Title: [Wake Up & Hydrate] │    │
│  │  Time:  [08:00 AM        ]  │    │
│  │  Category: [Schedule ▼]     │    │
│  │  Instructions:              │    │
│  │  [Drink 500ml water...]     │    │
│  │                             │    │
│  │  Active Days:               │    │
│  │  [●][●][●][●][●][●][●]      │    │
│  │                             │    │
│  │  Order: [1]                 │    │
│  │                             │    │
│  │  [Delete] [Cancel] [Update] │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Deleting a Habit
```
User taps delete icon (🗑️)
       │
       ▼
┌─────────────────────────────────────┐
│      Delete Confirmation            │
│  ┌─────────────────────────────┐    │
│  │  Delete Habit?              │    │
│  │                             │    │
│  │  This action cannot be      │    │
│  │  undone.                    │    │
│  │                             │    │
│  │  [Cancel]        [Delete]   │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
       │
       ▼ (if confirmed)
  deleteDoc() removes habit
       │
       ▼
  Page refreshes without habit
```

---

## Flow 4: Analytics

### Calendar View
```
┌─────────────────────────────────────┐
│           /analytics                │
│  ┌─────────────────────────────┐    │
│  │  Analytics                  │    │
│  │  [●Calendar] [Statistics]   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Last 30 Days               │    │
│  │                             │    │
│  │  M  T  W  T  F  S  S        │    │
│  │ [🟢][🟢][🟡][🟢][🟢][🔴][⚪] │    │
│  │ [🟢][🟢][🟢][🟡][🟢][🟢][⚪] │    │
│  │ [🟢][🟢][🟢][🟢][🟡][🟢][⚪] │    │
│  │ [🟢][🟢][🟢][🟢][🟢][🟢][⚪] │    │
│  │ [22]                        │    │
│  │                             │    │
│  │  🔴 0%  🟡 50%+  🟢 100%    │    │
│  └─────────────────────────────┘    │
│                                     │
│  (User taps on date 22)            │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Monday, December 22, 2025  │    │
│  │                             │    │
│  │  [✓] Wake Up & Hydrate      │    │
│  │  [✓] Morning Posture        │    │
│  │  [✓] Breakfast Shake        │    │
│  │  [ ] Sunlight Exposure      │    │
│  │  ...                        │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Statistics View
```
┌─────────────────────────────────────┐
│           /analytics                │
│  ┌─────────────────────────────┐    │
│  │  Analytics                  │    │
│  │  [Calendar] [●Statistics]   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌────────────┬────────────────┐    │
│  │ 🔥 5       │ 12             │    │
│  │ Current    │ Longest        │    │
│  │ Streak     │ Streak         │    │
│  ├────────────┼────────────────┤    │
│  │ 78%        │ 8              │    │
│  │ Avg        │ Perfect        │    │
│  │ Completion │ Days           │    │
│  └────────────┴────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Last 30 Days Summary       │    │
│  │                             │    │
│  │  Days with 50%+: 25/30      │    │
│  │  Total completed: 245       │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Habit Performance          │    │
│  │                             │    │
│  │  Wake Up & Hydrate          │    │
│  │  [████████████████] 100%    │    │
│  │                             │    │
│  │  Morning Posture            │    │
│  │  [██████████████░░] 85%     │    │
│  │                             │    │
│  │  Breakfast Shake            │    │
│  │  [████████████░░░░] 73%     │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## Error States

### Network Error
```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐    │
│  │  ⚠️ Failed to load habits   │    │
│  │  Please check your          │    │
│  │  connection and try again.  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Auth Error
```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐    │
│  │  ❌ Failed to sign in       │    │
│  │  Please try again.          │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## Loading States

### Page Loading
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│              ⟳                     │
│         (spinner)                   │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### Streak Loading
```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐    │
│  │  Loading streak...          │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## Responsive Behavior

### Mobile (< 640px)
- Full-width cards
- Bottom navigation fixed
- Modal takes full screen
- Touch-friendly tap targets

### Tablet/Desktop (≥ 640px)
- Max-width container (672px)
- Centered content
- Modal centered with backdrop
- Hover states on buttons
