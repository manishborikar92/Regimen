
---

# AI IDE Prompt

**Copy and paste this prompt into your AI IDE (Cursor, Windsurf, Bolt.new, v0, etc.):**

---

Read `Guide.md` (Complete Specification Document for Routine Tracker Web App) and the `client/` folder (Next.js 16 project structure), then implement the application according to the specifications.

**Project Requirements:**

1. **Technology Stack (JavaScript Only):**
   - Next.js 16 with App Router (all `.js` files, NOT TypeScript)
   - Tailwind CSS for styling
   - Firebase Authentication (Google Sign-In)
   - Firebase Firestore database
   - Progressive Web App (PWA) configuration
   - All services must use 100% FREE tiers

2. **Complete File Implementation:**

   Create and implement ALL files in the `client/src/` directory structure:

   **`client/src/app/layout.js`**
   - Root layout with AuthProvider wrapper
   - PWA metadata configuration
   - Tailwind CSS imports
   - Inter font from next/font/google

   **`client/src/app/page.js`**
   - Root page that redirects authenticated users to /dashboard
   - Redirects unauthenticated users to /login

   **`client/src/app/login/page.js`**
   - Clean, centered login interface
   - Google Sign-In button using Firebase Auth
   - Loading states and error handling
   - Redirect to /dashboard on successful authentication

   **`client/src/app/dashboard/page.js`**
   - Protected route (redirect to /login if not authenticated)
   - Display current date prominently
   - StreakCounter component at top
   - Fetch all habits from Firestore `habits` collection
   - Filter habits by today's day of week (check `frequency` array)
   - Fetch today's dailyLog from Firestore (document ID: `{uid}_{YYYY-MM-DD}`)
   - Real-time listener using `onSnapshot()` for live updates
   - Render habits sorted by `order` field
   - Show completion progress: "X of Y habits completed"
   - For each habit: render HabitCard or HabitAccordion based on whether `checklistItems` exists
   - Toggle function that updates Firestore dailyLog document

   **`client/src/app/api/seed/route.js`**
   - POST endpoint to seed Firestore with all 11 habits
   - Use the complete seedHabits array from Guide.md
   - Check if habits already exist before seeding (idempotent)
   - Return success/error JSON response

   **`client/src/components/AuthProvider.js`**
   - React Context for authentication state
   - Firebase `onAuthStateChanged` listener
   - Provide: `user`, `loading`, `signInWithGoogle()`, `logout()`
   - Loading state while checking auth

   **`client/src/components/HabitCard.js`**
   - Display single habit with checkbox
   - Props: `habit` (object), `isCompleted` (boolean), `onToggle` (function)
   - Color-coded left border based on category:
     - Movement: blue-500
     - Nutrition: green-500
     - Recovery: purple-500
     - Schedule: gray-500
   - Show time (large), title (bold), instructions (smaller text)
   - Checkbox at right side
   - Smooth hover effects

   **`client/src/components/HabitAccordion.js`**
   - Extends HabitCard for habits with `checklistItems`
   - Main checkbox at top for marking entire routine complete
   - Expandable section (click to expand/collapse)
   - When expanded, show all checklist items as bullet list
   - Smooth transition animation (max-height transition)
   - Checklist items are read-only (for reference during workout)

   **`client/src/components/StreakCounter.js`**
   - Fetch last 30 days of dailyLogs for current user
   - Calculate consecutive days from today backward
   - Day counts as "complete" if: `completedHabitIds.length / totalHabitsForThatDay >= 0.5`
   - Display: "🔥 {streakCount} Day Streak" in large, bold text
   - Show "0 Day Streak" if no consecutive days
   - Handle loading state

   **`client/src/lib/firebase.js`**
   - Initialize Firebase app with environment variables
   - Initialize Firebase Auth
   - Initialize Firestore
   - Enable offline persistence: `enableIndexedDbPersistence(db)`
   - Export: `auth`, `db`, `googleProvider`

   **`client/src/lib/seedData.js`**
   - Export the complete `seedHabits` array with all 11 habits
   - Match exactly the structure from Guide.md
   - Include all fields: title, time, category, instructions, checklistItems, frequency, order

   **`client/src/utils/dateHelpers.js`**
   - Export `getTodayString()` - returns "YYYY-MM-DD" format
   - Export `getDayOfWeek()` - returns "Mon", "Tue", etc.
   - Export `formatDate()` - returns human-readable date like "Monday, December 22, 2025"

3. **Root Configuration Files:**

   **`package.json`**
   - Include dependencies: next (latest), react, react-dom, firebase (v10+), tailwindcss, autoprefixer, postcss
   - Scripts: dev, build, start, lint

   **`next.config.js`**
   - Enable PWA support
   - Any necessary configuration for Firebase

   **`tailwind.config.js`**
   - Standard Tailwind configuration
   - Content paths for client/src

   **`jsconfig.json`**
   - Path aliases: "@/*" maps to "./client/src/*"

   **`.env.local` (template with placeholder values)**
   - All required Firebase environment variables
   - Include comments explaining where to get values

   **`public/manifest.json`**
   - PWA manifest with:
     - name: "Routine Tracker"
     - short_name: "Routine"
     - description: "Daily health routine tracker"
     - start_url: "/"
     - display: "standalone"
     - theme_color: "#3B82F6"
     - background_color: "#FFFFFF"
     - icons: references to 192x192 and 512x512 PNG icons

4. **Additional Files:**

   **`README.md`**
   - Project overview
   - Setup instructions:
     - Create Firebase project
     - Enable Google Authentication
     - Create Firestore database
     - Copy environment variables
     - Install dependencies
     - Run seed script (POST to /api/seed)
     - Deploy Firestore security rules
     - Run development server
   - Deployment instructions for Vercel

   **`firestore.rules` (separate file)**
   - Complete security rules from Guide.md
   - Instructions to copy-paste into Firebase Console

5. **Implementation Requirements:**

   - Use JavaScript (.js), NOT TypeScript
   - Use Firebase v10+ modular syntax: `import { collection, getDocs } from 'firebase/firestore'`
   - All Firestore operations must include proper error handling
   - DailyLog document IDs must use format: `${userId}_${YYYY-MM-DD}`
   - Implement real-time updates with `onSnapshot()` on dashboard
   - Enable Firestore offline persistence
   - Mobile-first responsive design with Tailwind
   - Smooth animations for accordions (transition-all duration-300)
   - Loading spinners during async operations
   - Empty states when no habits or logs exist
   - Proper React key props in all lists

6. **Exact Seed Data:**

   Include ALL 11 habits in `seedData.js` exactly as specified in the Guide.md seed data section, with complete instructions and checklist items for Movement routines.

7. **DO NOT:**
   - Use placeholder comments like "// Add logic here"
   - Skip any files or functions
   - Use TypeScript syntax or type annotations
   - Hardcode Firebase credentials (use env variables)
   - Create habits CRUD UI (out of scope for v1)

**Deliverable:**

A complete, working Next.js 16 application with all files implemented, ready to run with `npm install && npm run dev` after adding Firebase credentials to `.env.local`.

---