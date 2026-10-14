# Comprehensive Implementation Plan: Unified Routine Architecture, Schedule Isolation & Firebase Guide

**Target Repository**: `c:\Users\manis\Projects\Regimen`  
**Current Milestone**: All Phases Complete, Cleaned, Unified & Verified End-to-End  
**Status**: Implementation & Final QA Complete  
**Primary Standards**: Next.js 16.1 (Webpack server build, App Router), Firebase Admin SDK v14.5, Firebase Web SDK v12.7, Cloud Firestore Security Rules v2  

---

## 1. Executive Summary & Verified Architecture

This engineering initiative established a clean, unified routine architecture that delivers full routine management, interactive tracking, and visual distinction for personalized routines while ensuring client bundles remain completely free of proprietary routines and other users only receive generic foundation routines.

### Core Architectural Pillars
1. **Single Source of Truth Category Architecture**: All habit categories derive directly from `CATEGORY_CONFIG` into a single `CATEGORIES` array. Obsolete constants and misleading labels have been completely removed.
2. **Server-Only Schedule Quarantine**: Personal routines (Word Power Made Easy, 12-Week Progressive Movement Plan, 30-Discourse Osho Library) are strictly isolated in `web/src/lib/server/personal-schedule.js`. Client static bundles are verified 100% leak-free (`0 leaks found`). Public client bundles in `seed-data.js` only contain general-purpose foundation routines.
3. **Unified Authoritative Firestore Collection (`/habits`)**: All active user routines (personalized routines, foundation routines, and custom habits) reside in `/habits`. Each document is strictly owned by `userId == request.auth.uid`. This unifies data access, real-time snapshot listeners, dashboard cards, routine management, and completion tracking into a clean, maintainable model without collection fragmentation.
4. **Direct Admin CLI Synchronization**: The CLI sync script (`scripts/fetch-personal-schedule.mjs`, executed via `npm run schedule:fetch-personal`) is the exclusive mechanism for seeding and synchronizing Manish's personalized routines. It runs with Firebase Admin SDK credentials, resolves `manishborikar92@gmail.com` to UID `f5qe4PMQoLYJcuT5ZA5eUdkj1Ue2`, and upserts the 6 routines directly into `/habits` under deterministic IDs (`${userId}_${routine.stableKey}`).
5. **No UI Synchronization Controls for Personal Schedule**: The web UI contains zero personalized schedule selectors, buttons, or sync modals. For non-personalized accounts, the UI provides "Sync Routines" to seed generic foundation routines. For accounts with personal routines, the UI protects the personal schedule from accidental generic routine injection.
6. **Card & Subsystem Integration**:
   - **Dashboard**: Renders rich interactive cards mapped 1:1 to routine types: `WorkbookCard` (Word Power Made Easy), `MovementCard` (12-Week Progressive Plan), `OshoCard` (30-Discourse Library), `ReadingCard` (Bedtime Reading timer), `SpeakingCard` (ChatGPT Voice Practice), and `DiaryCard` (Private Journal with reflection prompts).
   - **Routine Manager (`/habits`)**: Displays all routines with their category, timing, and a distinctive `Personal` badge for personalized routines (`seedOrigin: 'personal_preset'`) vs `Foundation` for generic routines.
   - **Tracking & History (`/dailyLogs`)**: Daily logs and completion history use the routine's stable document ID (`${userId}_canonical_*`). Tracking logs and streaks are preserved across CLI executions.
7. **Customization Preservation**: The sync engine reconciles system routine metadata while strictly preserving user-customized times, frequencies, checklists, and notes. Running the CLI repeatedly never creates duplicates or resets user progress.
8. **Decisive Credential Strategy**: Standardized on Vercel Sensitive Environment Variable `FIREBASE_SERVICE_ACCOUNT_KEY` for production deployments, paired with secure external file storage (`%USERPROFILE%\.credentials\`) for local development and CLI operations.
9. **Permanent Firebase Setup & Operations Runbook**: Authored comprehensive documentation in `docs/firebase-setup.md` detailing Windows local development, Vercel Sensitive Env Var deployment, IAM least-privilege scoping, and maintenance runbooks.

```mermaid
flowchart TD
    subgraph Client Layer (Universal Web UI)
        AllUsers["All Authenticated Users"]
        WebClient["Firebase Web Client SDK v12.7"]
        UI_Dash["Dashboard: Interactive Cards<br/>(Workbook, Movement, Osho, Reading, Diary)"]
        UI_Habits["Routine Manager<br/>(Personal & Foundation Badges)"]
    end

    subgraph Direct CLI Channel (Exclusive Seeding for Manish)
        CLI["scripts/fetch-personal-schedule.mjs<br/>(npm run schedule:fetch-personal)"]
        AdminCLI{"Firebase Admin SDK<br/>External Credentials"}
        ServerData["Server-Only: MANISH_PERSONAL_ROUTINES<br/>(Word Power, 12-Wk Movement, Osho Library)"]
        SyncEngine["syncPersonalSchedule(userId)<br/>(Reconcile & Preserve Customizations)"]
    end

    subgraph Database Layer (Cloud Firestore)
        RulesHabits{"Firestore Rules: /habits<br/>(Owner R/W, Valid Category, Scoped Reads)"}
        DocManish["/habits/{manishUid}_canonical_*<br/>(Manish's Personalized Routines)"]
        DocOthers["/habits/{otherUid}_routine_*<br/>(Other Users' Foundation Routines)"]
        DocLogs["/dailyLogs/{userId}_{date}<br/>(Daily Progress & Streaks)"]
    end

    CLI --> AdminCLI
    AdminCLI -->|getUserByEmail('manishborikar92@gmail.com')| SyncEngine
    ServerData --> SyncEngine
    SyncEngine -->|Privileged Batch Upsert| DocManish

    AllUsers --> WebClient
    WebClient -->|Real-time Snapshot on /habits| RulesHabits
    RulesHabits -->|Owner UID == Manish| DocManish
    RulesHabits -->|Owner UID == Other| DocOthers
    DocManish --> UI_Dash
    DocManish --> UI_Habits
    UI_Dash -->|updateProgress() / toggleHabit()| DocLogs
```

---

## 2. Completed Milestones & Verification Records

### Phase 1: Environment Audit, Test Harness & Category Baseline
- Audited repository: Node v24, Next.js 16.1, Firebase Admin v14.5, Firebase Web Client v12.7.
- Established clean Node test harness: 48 / 48 tests passing across 12 test suites.

### Phase 2: Category Architecture Consolidation
- Single source of truth established in `web/src/lib/constants/categories.js` (`CATEGORY_CONFIG` -> `CATEGORIES`).
- Removed all legacy category aliases (`FOUNDATIONAL_CATEGORIES`, `LEGACY_CATEGORIES`).
- Synchronized with `firestore.rules` `isValidCategory()` validation whitelist.

### Phase 3: Server-Side Schedule Isolation
- Isolated `MANISH_PERSONAL_ROUTINES` in `web/src/lib/server/personal-schedule.js`.
- Client-safe starter routines maintained in `web/src/lib/seed-data.js` (`DEFAULT_ROUTINES`).
- Audited production webpack bundle: zero leaks of private metadata in client static chunks.

### Phase 4: Firebase Credential Strategy & Setup Documentation
- Evaluated OIDC vs Service Account Key vs Service Account JSON file.
- Standardized on Vercel Sensitive Environment Variable `FIREBASE_SERVICE_ACCOUNT_KEY`.
- Documented complete setup guide in `docs/firebase-setup.md`.

### Phase 5: Architecture Simplification & CLI-Centric Design
- Removed client-side sync selector modals (`PresetSelectorModal.js`) and web sync route (`/api/schedule/personal`).
- CLI script `scripts/fetch-personal-schedule.mjs` made the sole mechanism for seeding the personal schedule.

### Phase 6: Unified /habits Collection & End-to-End Verification
- **Root Cause Identified**: Previous iterations wrote personalized routines to `/personalRoutines`, while the web application data-access layer (`useHabits`) queries `/habits`. This caused the website to render empty habits for `manishborikar92@gmail.com`.
- **Architectural Solution**: Unified all active routines into `/habits`. Personal schedule definitions remain strictly server-isolated in `personal-schedule.js` and are seeded exclusively via the Admin SDK CLI.
- **Customization Preservation**: `syncPersonalSchedule` reconciles system metadata with deterministic IDs (`${userId}_${routine.stableKey}`) while preserving user-customized times, frequencies, checklists, notes, and custom habits.
- **UI Enhancement**:
  - `web/src/app/(protected)/habits/page.js`: Displays a `Personal` badge for personalized routines and a `Foundation` badge for generic routines. Guards "Sync Routines" to protect personal routines from accidental override.
  - `web/src/app/(protected)/dashboard/page.js`: Added loading state protection with `LoadingSpinner` to prevent flash of empty content during initial Firestore snapshot resolution.
- **Real Browser Verification via Chrome CDP**:
  - Authenticated as `manishborikar92@gmail.com` via session injection.
  - Verified Dashboard displays all 6 interactive cards: `WorkbookCard`, `MovementCard`, `OshoCard`, `ReadingCard`, `SpeakingCard`, and `DiaryCard`.
  - Verified Routine Manager displays all 6 routines with `Personal` badges.
  - Verified interactive progress recording creates `/dailyLogs` under the correct document ID (`f5qe4PMQoLYJcuT5ZA5eUdkj1Ue2_canonical_english_workbook`).
  - Verified persistence across page reloads and CLI re-execution.
  - Verified unauthorized read and collection query attempts are rejected with `403 Forbidden` (`PERMISSION_DENIED`).
- **Quality Gates**:
  - Unit tests: 48 / 48 passing.
  - Linter: 0 errors, 0 warnings.
  - Production build: Clean compilation with 10 static prerendered routes.
  - Client chunks: 0 leaks found.
