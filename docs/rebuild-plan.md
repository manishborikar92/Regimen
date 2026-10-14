# Rebuild Plan: Personal Routine Companion (Vritta)

**Date:** 14 October 2026  
**Document version:** 1.0.0  
**Authority:** Follows `docs/regimen_project_brief.md` as the authoritative product specification.

---

## 1. Executive Summary & Provisional Brand Identity

The existing application is a Next.js 16 (App Router) mobile-first Progressive Web Application previously named **Regimen**. While it established a solid client-side Firebase foundation with offline-first persistence, its domain model conflated timing with life-area categories, treated time slots as rigid deadlines, and lacked structured support for multi-step workbook sessions, progressive physical conditioning, library exploration, and private journaling.

### Provisional In-App Brand Identity: **Vritta** (वृत्त)
- **Etymology & Concept:** In classical Sanskrit, *Vritta* signifies conduct, regular practice, rhythmic observance, and the cyclical nature of daily life (from the root *vṛt* — to turn, revolve, proceed). Unlike rigid militaristic or clinical terms, *Vritta* reflects a calm, mindful, recurring rhythm of self-cultivation.
- **Visual Identity:** A custom scalable vector logo embodying circular flow and steady progress — concentric harmonious arcs forming an open, grounding loop.
- **Reversibility:** Fully centralized in `web/src/lib/constants/brand.js`. No repository, domain, or cloud project identifiers are renamed.

---

## 2. Baseline Architecture & Audit Results

### 2.1 Codebase & Dependency Stack
- **Framework:** Next.js 16.1.0 (Turbopack, App Router)
- **UI & Runtime:** React 19.2.3, React DOM 19.2.3
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss: ^4`, `@import "tailwindcss";`) with custom CSS variables in `src/app/globals.css`.
- **Icons:** `lucide-react` v0.577.0
- **Database & Auth:** Firebase v12.7.0 (`firebase/auth`, `firebase/firestore` with `persistentLocalCache` and `persistentSingleTabManager`).
- **Platform & Host:** Deployed via Firebase/Vercel configuration, client-side SPA with App Router layouts.

### 2.2 Pre-Existing Audit Command Results
- **`npm --prefix web run lint`:**
  - Status: Succeeded with 0 errors, 2 warnings (`@next/next/no-img-element` in `login/page.js` and `TopNav.js`).
- **`npm --prefix web run build`:**
  - Status: Succeeded in 21.9s. All static routes (`/`, `/login`, `/dashboard`, `/habits`, `/analytics`) compiled cleanly.
- **Typecheck & Tests:**
  - TypeScript is installed (`typescript: ^5.9.3`) but no custom test framework was configured in `package.json`. No existing tests were present in `web/src`.

---

## 3. Discovered Technical Findings & Risks

### 3.1 Date / Timezone Flaw in `date-helpers.js`
- **Issue:** `getTodayString()` and `getDateString()` currently invoke `new Date().toISOString().split('T')[0]`.
- **Impact:** `.toISOString()` converts local time to UTC. For a user in India (IST, UTC+05:30) or any timezone ahead of UTC, between midnight and 05:30 AM, the app incorrectly identifies the date as yesterday.
- **Fix:** Parse local year, month, and day components (`d.getFullYear()`, `d.getMonth() + 1`, `d.getDate()`) into `YYYY-MM-DD`.

### 3.2 Firestore Security Rules Limitation
- **Issue:** `web/firestore.rules` enforces `request.resource.data.category in ['Schedule', 'Movement', 'Nutrition', 'Recovery'];`.
- **Impact:** Seeding the canonical categories (`English Learning`, `Movement & Strength`, `Listening & Awareness`, `Reading`, `Communication`, `Reflection`) will be rejected by Firestore if deployed rules enforce this strict enum.
- **Fix:** Update `firestore.rules` to include all canonical categories while preserving legacy ones for backward compatibility, and ensure user ownership rules cover enriched daily logs and user preferences.

### 3.3 Seeding Idempotency & Legacy Data Preservation
- **Issue:** The existing `useHabits.js` seed function checks `if (habits.length > 0) throw new Error(...)`.
- **Impact:** Reseeding fails if any habit exists, and the previous implementation generated random doc IDs using `addDoc`, creating duplicates on repeat calls.
- **Fix:** Use deterministic document IDs (e.g. `${userId}_seed_workbook`, `${userId}_seed_exercise`, etc.) and Firestore `setDoc(ref, data, { merge: true })`. This guarantees that reseeding is 100% idempotent, never creates duplicates, updates seed-owned attributes, and preserves existing custom user habits.

### 3.4 Denominator Flaw in Analytics
- **Issue:** Current analytics loops over 30 days and checks `habits.filter(h => h.frequency?.includes(dayOfWeek))`.
- **Impact:** Sunday exercise was treated as a failure if not completed, and any flexible routine without strict daily checkboxes penalized completion rates.
- **Fix:** Exclude planned rest days (like Sunday movement) from the denominator of completion metrics, and calculate insights based only on days actually scheduled.

---

## 4. Implementation Phases

### Phase 1: Baseline & Discovery (Complete)
- [x] Read `docs/regimen_project_brief.md` completely.
- [x] Inspect full codebase structure, Firebase configuration, contexts, hooks, and UI components.
- [x] Execute lint and build audits.
- [x] Establish provisional brand *Vritta* and verify collision-free status.
- [x] Document architecture findings and risk factors in this file.

### Phase 2: Domain Data, Schemas & Brand Centralization
- [ ] Centralize brand configuration, tokens, and scalable vector logo in `web/src/lib/constants/brand.js` and `web/public/logo.svg`.
- [ ] Update `categories.js` with canonical life areas, color tokens, and metadata.
- [ ] Create comprehensive canonical routine seed fixtures in `web/src/lib/seed-data.js` covering:
  - English Workbook (`Word Power Made Easy`, 2 daily sessions, prior-day review, uninterrupted session indicator).
  - Exercise / Movement Plan (12-week progression, M/W/F strength, T/Th/Sa walk+stretches, Sun rest, safety stop signals, medical check-up caution).
  - Osho Library (30 entries across 6 groups, URLs, notes, uncertainty markers).
  - Bedtime Reading (`30 minutes before bed`).
  - English Speaking with ChatGPT.
  - Maintain a Diary (private user journal, reflective prompts).
- [x] Refactor `date-helpers.js` to ensure true local timezone handling.
- [x] Update `firestore.rules` for canonical categories and progress persistence.

### Phase 3: Component Redesign & Interactive Flows
- [x] **Today (Dashboard):**
  - Group by time context: Flexible/Anytime, Preferred Afternoon (Exercise), Before Bed (Reading).
  - Activity-specific cards:
    - Workbook: 0/2, 1/2, 2/2 session stepper, review toggle, uninterrupted session toggle.
    - Exercise: Dynamic weekday view (Workout vs Walk+Stretches vs Rest Day), expandable step-by-step instructions, variations, safety stop signals.
    - Osho Listening: Daily listening toggle + quick link/modal to explore the 30-talk library and track series progress.
    - Reading: Before bed target with optional timer / manual mark.
    - Speaking: Manual check with optional practice notes.
    - Diary: In-app reflection journal editor with thoughtful prompts, kept strictly private.
- [x] **Routine Manager (Habits):**
  - Redesign editor around meaning, life area, completion method, and timing preferences rather than rigid clock times.
  - Safe create, edit, delete, and idempotent seed sync.
- [x] **Insights (Analytics):**
  - Supportive, non-punitive statistics.
  - Exclude Sunday rest from completion denominator.
  - Show workbook sessions, workout/walk consistency, Osho series progress, and 30-day rhythm.

### Phase 4: Automated Testing & Verification
- [x] Set up a robust, lightweight test runner (`node:test`) configured for the project in `web/package.json`.
- [x] Implement unit & integration test suites for:
  - Seed idempotency & stable keys (`tests/seed-idempotency.test.mjs`).
  - Local timezone boundary calculations (`tests/date-timezone.test.mjs`).
  - Preferred timing vs deadline semantics (`tests/seed-idempotency.test.mjs`).
  - Workbook session count & condition tracking (`tests/workbook-progress.test.mjs`).
  - Weekday movement plan resolution & progression safety guards (`tests/movement-schedule.test.mjs`).
  - Rest-day exclusion from analytics denominators (`tests/analytics-rest-day.test.mjs`).
  - Osho library integrity & separation of daily listening from series progress (`tests/osho-library.test.mjs`).
  - Diary privacy and user scoping (`tests/diary-privacy.test.mjs`).
  - Category backward-compatibility & Firestore rule safety (`tests/category-compatibility.test.mjs`).
- [x] Run full lint, typecheck, tests, and production build:
  - `npm test`: 34 tests passed across 8 test suites (0 failures).
  - `npm run lint`: 0 errors, 0 warnings.
  - `npm run build`: Compiled successfully in 10.0s with Turbopack, static page prerendering complete.

### Phase 5: Screenshot Analysis, Logo Reconstruction & Data Loading Resolution
- [x] **Logo Geometry & Alignment Reconstruction:**
  - Analyzed the target brand mark (`media_1791969236757_dd225ea2.png`) down to the exact mathematical center, stroke width, and angular sweep.
  - Reconstructed `web/public/logo.svg` and `web/src/components/ui/Logo.js` as an exact vector SVG:
    - Outer purple arc: radius 40.13, stroke-width 7.83, sweeping clockwise from 270° (top) to 212° (10 o'clock), gradient `#7279f5` to `#5550e9`.
    - Inner cyan arc: radius 24.54, stroke-width 6.79, sweeping clockwise from 314° (2 o'clock) to 270° (top), gradient `#38bdf8` to `#0ea5e9`.
    - Central anchor dot: radius 9.14 at center, fill `#5550e9`.
  - Side-by-side pixel rendering verified with Cairosvg and Pillow against the original reference.
- [x] **Consistent Logo Usage Across the Entire App:**
  - `LoadingSpinner.js`: Replaced legacy heartbeat icon and hardcoded "REGIMEN / Syncing Data" with the Vritta logo, `BRAND.name`, and calm breathing halo.
  - `TopNav.js`: Fixed container background from dark indigo gradient (which masked the purple outer ring) to a crisp white rounded card (`bg-white border border-gray-200/90 shadow-2xs`), ensuring both purple and cyan rings pop with 100% clarity.
  - `login/page.js`: Updated hero logo container to a clean white card with subtle glow, matching the brand system.
  - App icons & Favicons: Updated `web/src/app/icon0.svg` and regenerated `apple-icon.png`, `icon1.png`, `favicon.ico`, and `web-app-manifest-*.png` from the new vector geometry.
- [x] **Data Loading & Permission Error Resolution:**
  - Root cause diagnosed: Live Cloud Firestore rules enforced `request.resource.data.category in ['Schedule', 'Movement', 'Nutrition', 'Recovery']`.
  - Implemented dual-layer category mapping (`CANONICAL_TO_LEGACY_CATEGORY`) in `categories.js` and `firestore.js`.
  - Saving a habit automatically writes a valid legacy category (`'Schedule'`, `'Movement'`, `'Recovery'`) to satisfy the live Firestore rule, while storing `canonicalCategory` / `lifeArea` for the rich mobile UI.
  - Fixed `fetchHistoricalLogs` by querying `userId` only, eliminating composite index requirements.
  - Upgraded `updateDailyHabitProgress` to use nested object merges instead of dotted paths.
- [x] **Visual Verification & Fresh Screenshots:**
  - Headless Chrome captures executed across phone-sized portrait (412x915) and desktop (1280x800).
  - Captured `login_mobile.png`, `login_desktop.png`, `loading_spinner.png`, `routine_manager_mobile.png`, `routine_manager_desktop.png`, `dashboard_mobile.png`, and `analytics_mobile.png`.
  - Confirmed logo renders consistently across all views and data loads cleanly without red permission banners.

