# User Flow Documentation

## Overview

This document describes the complete user journey through the Routine Tracker application, from modern Next.js 16 Edge middleware redirection to seamless Toast notifications in daily operation.

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

### Step 1: Landing Redirect Layer
```
User visits app
       │
       ▼
┌─────────────────────────────────────┐
│           / (Root page.js)          │
│                                     │
│  Client Auth Context Checks:        │
│  - Not logged in → Redirect /login  │
│  - Logged in → Redirect /dashboard  │
└─────────────────────────────────────┘
```

### Step 2: Bespoke Login Page (`(auth)/login/page.js`)
```
┌─────────────────────────────────────┐
│           /login                    │
│                                     │
│  Track your daily health            │
│  routine                            │
│                                     │
│  ┌───────────────────────┐          │
│  │ Continue with Google  │          │
│  └───────────────────────┘          │
│                                     │
│    ✓ Track Habits                   │
│    ✓ Build Streaks                  │
│    ✓ View Analytics                 │
│    ✓ Private & Secure               │
└─────────────────────────────────────┘
       │
       ▼
  Google OAuth Popup
       │
       ▼
  Success (Cookie Generated) → Redirect to /dashboard
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
│  Enjoy your rest day! 🎉            │
│                                     │
│  ┌─────────┬─────────┬──────────┐   │
│  │  Today  │ Habits  │Analytics │   │
│  └─────────┴─────────┴──────────┘   │
└─────────────────────────────────────┘
```

### Step 4: Empty Habits Screen
```
┌─────────────────────────────────────┐
│           /habits                   │
│  ┌─────────────────────────────┐    │
│  │  Manage Habits              │    │
│  └─────────────────────────────┘    │
│                                     │
│            📝                       │
│                                     │
│  No habits yet. Create your first!  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   Load Sample Routine       │    │
│  └─────────────────────────────┘    │
│                                     │
│              [Floating ＋ Add]      │
└─────────────────────────────────────┘
```

### Step 5a: Load Sample Routine
```
User clicks "Load Sample Routine"
       │
       ▼
┌─────────────────────────────────────┐
│  src/lib/seed-data.js triggers      │
│  addHabit() sequentially            │
└─────────────────────────────────────┘
       │
       ▼
  Batch write executes across 10 items
       │
       ▼
  Toast Notification: "Sample routine loaded successfully!"
```

### Step 5b: Modular Create Habit
```
User clicks Floating "＋" Button
       │
       ▼
┌─────────────────────────────────────┐
│         HabitModal                  │
│  ┌─────────────────────────────┐    │
│  │  Add New Habit              │    │
│  │                             │    │
│  │  Title: [____________]      │    │
│  │  [Error text if needed]     │    │
│  │                             │    │
│  │  Time:  [08:00 AM   ]       │    │
│  │  Category: [Schedule ▼]     │    │
│  │  Instructions: [________]   │    │
│  │                             │    │
│  │  Active Days:               │    │
│  │  [M][T][W][T][F][S][S]      │    │
│  │                             │    │
│  │  Checklist Items:           │    │
│  │  [Add item...        ][Add] │    │
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
│  │  Routine Tracker   [ Profile]│   │
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
│  ... more habits ...                │
│                                     │
│  ┌─────────┬─────────┬──────────┐   │
│  │ ●Today  │ Habits  │Analytics │   │
│  └─────────┴─────────┴──────────┘   │
└─────────────────────────────────────┘
```

### Interacting with a Habit
```
User taps checkbox
       │
       ▼
┌─────────────────────────────────────┐
│  Optimistic DataContext Update      │
│  - Checkbox Lucide icon fills       │
│  - Progress bar % jumps upward      │
│  - Background dims gracefully       │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Firestore Offline Persistence SDK  │
│  - Processes operation atomically   │
│  - Syncs to Cloud instantly         │
└─────────────────────────────────────┘
```

---

## Flow 3: Habit Maintenance

### Updating an Item
```
User taps Edit icon (Pencil)
       │
       ▼
┌─────────────────────────────────────┐
│  Form populated with Firestore Doc  │
│  Validation blocks invalid states   │
│  Save → "Habit Updated" Toast       │
└─────────────────────────────────────┘
```

### Safe Deletion Process
```
User taps Delete icon (Trash)
       │
       ▼
┌─────────────────────────────────────┐
│      Secure ConfirmDialog           │
│  ┌─────────────────────────────┐    │
│  │  [Warning Icon]             │    │
│  │  Delete Habit?              │    │
│  │  This action cannot be      │    │
│  │  undone.                    │    │
│  │                             │    │
│  │  [Cancel]        [Delete]   │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
       │
       ▼ (if confirmed)
  deleteDoc() process triggers spinner
       │
       ▼
  Success Toast Notification slides in
```

---

## Flow 4: Analytical Reporting

### Component Interactions
```
┌─────────────────────────────────────┐
│           /analytics                │
│                                     │
│  [●Calendar] [Statistics]           │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Last 30 Days               │    │
│  │                             │    │
│  │  M  T  W  T  F  S  S        │    │
│  │    [🟢][🟡][🟢][🟢][🔴][⚪] │    │
│  │ [🟢][🟢][🟢][🟡][🟢][🟢][⚪] │    │
│  │ [🟢][🟢][🟢][🟢][🟡][🟢][⚪] │    │
│  │ [🟢][🟢][🟢][🟢][🟢][🟢][⚪] │    │
│  │ [22]                        │    │
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
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## Application Notifications

### The Toast Stack
```
┌─────────────────────────────────────┐
│                                     │
│  (Screen Content)                   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ Habit updated successfully X │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```
Toasts arrive dynamically pinned to the bottom of the viewport under the nav via `ToastContext`, clearing native interference from Edge and Chrome system alerts.

---

## Responsive Breakdowns

### Mobile First (< 640px)
- Max-width restricted elements
- Floating Action Buttons scale appropriately
- Modals consume near full-screen space safely inside notches
- Navigation persists tightly glued to bottom frame

### Tablet/Desktop (≥ 640px)
- Hard center layout width cap (672px max-width)
- Navigation icons receive textual hovering tooltips if available
- TopNav profile drops down an actual menu segment
