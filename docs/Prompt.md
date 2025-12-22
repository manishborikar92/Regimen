# AI IDE Prompt

Copy and paste this prompt into your AI IDE (e.g., Cursor, Windsurf, etc.):

---

**PROMPT START:**

You are building a complete, production-ready Progressive Web App (PWA) using Next.js 16 (App Router) with TypeScript. Read the attached specification document carefully.

**Project:** Routine Tracker - A daily habit tracking app with a pre-defined health routine.

**Your tasks:**

1. **Generate the complete file structure** including:
   - All Next.js 16 App Router files (layout.tsx, page.tsx for login and dashboard)
   - Component files (AuthProvider, HabitCard, HabitAccordion, StreakCounter)
   - API routes (/api/habits, /api/daily-log, /api/daily-log/toggle, /api/seed)
   - Mongoose models (User, Habit, DailyLog)
   - Firebase configuration and MongoDB connection files
   - PWA manifest.json and metadata configuration
   - All configuration files (.env.local template, next.config.js, tailwind.config.js, tsconfig.json, package.json)

2. **Implement the complete authentication flow:**
   - Firebase Google Sign-In
   - AuthProvider context that wraps the entire app
   - Protected dashboard route (redirect to /login if not authenticated)
   - Login page with Google Sign-In button
   - Logout functionality

3. **Build the database layer:**
   - MongoDB connection utility with proper error handling
   - Complete Mongoose schemas exactly as specified in the document
   - Seed script with the full routine data provided (all habits from 08:00 AM to 12:00 AM)
   - API endpoint to run the seed script once

4. **Create the Dashboard:**
   - Display current date prominently at the top
   - Fetch habits for today (filtered by frequency - exclude Sunday-only items if today is Saturday, etc.)
   - Fetch or initialize today's DailyLog
   - Render habits as cards sorted by time
   - Color-code by category (Movement: blue, Nutrition: green, Recovery: purple, Schedule: gray)
   - For simple habits: show checkbox only
   - For Movement routines (habits with checklistItems): show checkbox + accordion that expands to reveal the exercise list
   - Implement checkbox toggle that calls the API to update DailyLog
   - Show completion progress (e.g., "7 of 11 completed")
   - Add a streak counter component at the top showing consecutive days with >50% completion

5. **API Implementation:**
   - GET /api/habits - returns all habits, accepts optional ?day=Mon query param to filter by frequency
   - GET /api/daily-log?date=2025-12-22 - returns DailyLog for the specified date (or null if doesn't exist)
   - POST /api/daily-log/toggle - accepts { habitId, date } and toggles the habit in completedHabitIds array (creates DailyLog if doesn't exist)
   - All API routes must verify Firebase auth token

6. **PWA Configuration:**
   - Generate manifest.json with proper app name, colors, and icons specifications
   - Configure Next.js 16 metadata for PWA support
   - Ensure the app can be installed on iOS and Android

7. **Styling:**
   - Use Tailwind CSS exclusively
   - Mobile-first responsive design
   - Clean, minimal interface with high contrast
   - Smooth animations for accordions
   - Loading and error states

**Important implementation details:**

- The app must work with Next.js 16's App Router (not Pages Router)
- Use TypeScript for all files
- Implement proper error handling throughout
- Add loading states for all async operations
- The seed data contains the EXACT routine from the specification document - do not modify the habits, times, or exercise lists
- DailyLog documents are created on-demand (when user checks first item of the day), not pre-created
- Habits with `checklistItems` render as accordions; the items are for display reference only
- The streak counter logic: fetch last 30 days of DailyLogs, count consecutive days from today backward where completion rate >= 50%

**Deliverables:**

- Complete, working codebase with all files
- Inline comments explaining key logic
- README.md with setup instructions (how to add Firebase keys, MongoDB URI, run seed script)
- Package.json with all necessary dependencies

**Reference the attached specification document for:**
- Complete seed data (all 11 habits with times, categories, and checklists)
- Exact schema structures
- API endpoint specifications
- File structure requirements

Begin by creating the complete file structure, then implement each file with full, production-ready code. Do not use placeholder comments like "// Add logic here" - implement everything completely.

**PROMPT END**

---

You can now paste this prompt directly into your AI IDE along with this specification document to generate the complete application.