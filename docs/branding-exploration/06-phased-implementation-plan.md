# VRITTA — Next-Phase Implementation Plan & Engineering Migration Roadmap

**Project Name:** VRITTA (वृत्त)  
**Author:** Manish Borikar  
**Target Repository:** `c:\Users\manis\Projects\Regimen` → `c:\Users\manis\Projects\Vritta`  
**Date:** 14 October 2026 (Revision 3 — Corrected & Evidence-Based)  
**Status:** **PLANNING & RESEARCH GATE (APPROVAL-FIRST — DO NOT IMPLEMENT UNTIL EXPLICITLY APPROVED)**  
**Canonical Implementation Plan:** This document is the single authoritative implementation roadmap in the repository.

---

> [!IMPORTANT]
> **Strict Planning-Only Gate:**  
> This document is an architectural blueprint, audit report, and operational runbook. **No production code files, environment variables, Firebase resources, GitHub settings, Vercel configurations, domains, or existing data have been modified.** No files have been deleted or archived. Execution will proceed phase-by-phase only after explicit approval.

---

## 1. Finalized Branding & Design System Specifications

### 1.1 Brand Identity & Authoritative Color Lock
- **Project Name:** **VRITTA** (वृत्त — classical Sanskrit: "conduct, regular cadence, rhythmic observance, and the cyclical nature of daily life").
- **Authoritative Approved Brand Colors:**
  - **Deep Obsidian:** `#090D16` (Foundation Dark / Canvas & maximum-contrast brand text)
  - **Luminous Teal:** `#14B8A6` (Signature Brand Identity & Dark-Mode Ribbon Stroke / Buttons)
  - **Warm Amber:** `#D97706` (Rhythm, Streak Milestones, and Guiding Sutra Center Balance Point)
- **Theme Identity:** **Restorative Juniper** (organic, calming health companion; deep verdigris teal and warm amber on misty slate/deep obsidian).
- **Authoritative Selected Logo:** `docs/branding-exploration/03-logo-concepts/logo-concept-3-guiding-sutra.svg`. The Guiding Sutra geometry remains strictly preserved.

### 1.2 Logo Asset Audit & Derived Asset Plan
An audit of `docs/branding-exploration/03-logo-concepts/` confirms the following files exist:
- `logo-concept-3-guiding-sutra.svg` (766 bytes): The **authoritative original vector mark**. Geometry consists of a 200×200 viewBox, a background rect (`#F8FAFC`, `rx=36`), a continuous bezier loop path (`stroke="#0F766E"`, `stroke-width="13"`), and a center balance dot (`cx="100"`, `cy="100"`, `r="8"`, `fill="#D97706"`).
- `guiding-sutra-master.svg` (802 bytes): 800×800 scaled version preserving identical bezier geometry.
- `guiding-sutra-light.svg` (702 bytes) & `guiding-sutra-dark.svg` (710 bytes): Standalone marks without background rects, styled for light and dark surfaces.
- `guiding-sutra-favicon.svg` (656 bytes): Standalone mark with stroke boosted to 20px for optical clarity at 16×16 and 32×32 pixel browser tab sizes.
- `guiding-sutra-lockup.svg` (1397 bytes): Horizontal header lockup pairing the mark with VRITTA typography.

**Necessary Derived Production Assets (and strict constraints):**
1. `web/src/components/ui/Logo.js`: Reusable React SVG component. Must render the exact bezier curve (`M 68 132 C 44 132 40 100 68 84 C 92 70 108 130 132 116 C 160 100 156 68 132 68 C 108 68 92 128 68 132 Z`) and center dot, using `currentColor` and semantic accent CSS variables to adapt dynamically to light/dark surfaces.
2. `web/public/logo.svg`: Standalone vector logo file derived directly from `logo-concept-3-guiding-sutra.svg`.
3. `web/src/app/icon0.svg`: Scalable vector favicon for Next.js App Router metadata.
4. Binary Favicons & PWA Icons: `web/src/app/favicon.ico`, `web/src/app/apple-icon.png` (180×180), `web/public/web-app-manifest-192x192.png`, `web/public/web-app-manifest-512x512.png`. Generated from the authoritative vector geometry to ensure crisp rendering without pixelation.

### 1.3 Removal of Conflicting Heather Purple
In earlier exploratory drafts, a Heather Purple (`#6D28D9` / `#A78BFA`) was proposed for Sunday rest badges. This color conflicts with the approved Restorative Juniper palette and has been **completely removed**.
- **Approved Rest & Recovery Token:** Sunday rest is represented through harmonious slate and muted teal surfaces:
  - **Light Mode:** Canvas Surface `#F1F5F9` (Slate 100), Border `#CBD5E1` (Slate 300), Text `#475569` (Slate 600), Rest Badge `#0F766E14` (Juniper 8% tint).
  - **Dark Mode:** Canvas Surface `#1E293B` (Slate 800), Border `#334155` (Slate 700), Text `#94A3B8` (Slate 400), Rest Badge `#14B8A61F` (Teal 12% tint).

### 1.4 Approved Semantic Design Tokens (Aligned with Approved Swatches)

```css
/* ========================================
   VRITTA Design Tokens — Restorative Juniper
   Authoritative Brand Swatches:
   - Deep Obsidian: #090D16
   - Luminous Teal: #14B8A6
   - Warm Amber: #D97706
   ======================================== */

@custom-variant dark (&:where(.dark, .dark *));

:root {
  /* Surfaces & Canvas */
  --color-bg-canvas: #f8fafc;       /* Misty Slate canvas */
  --color-bg-surface: #ffffff;      /* Pure Porcelain card surface */
  --color-bg-subtle: #f1f5f9;       /* Slate 100 input/badge background */
  --color-border-subtle: #e2e8f0;   /* Slate 200 border */
  --color-border-strong: #cbd5e1;   /* Slate 300 border */

  /* Text & Content */
  --color-text-primary: #0f172a;    /* Deep Charcoal Slate (17.85:1 on surface) */
  --color-text-secondary: #475569;  /* Slate 600 (7.58:1 on surface) */
  --color-text-muted: #64748b;      /* Slate 500 (4.76:1 on surface) */

  /* Core Brand Swatches */
  --color-brand-primary: #14b8a6;   /* Luminous Teal core brand swatch */
  --color-brand-obsidian: #090d16;  /* Deep Obsidian core brand swatch */
  --color-brand-amber: #d97706;     /* Warm Amber core brand swatch */

  /* Brand & Rhythm Functional Accents */
  --color-accent-primary: #0f766e;  /* Accessible Deep Teal variant (5.23:1 on canvas, 5.47:1 on card) */
  --color-accent-hover: #115e59;    /* Deepened Juniper */
  --color-accent-subtle: #ccfbf1;   /* Juniper 100 tint */
  --color-warm-accent: #d97706;     /* Warm Amber core swatch (3.04:1 graphical SC 1.4.11) */
  --color-warm-text: #b45309;       /* Accessible Amber text variant (4.80:1 on canvas, 5.02:1 on card) */
  --color-warm-subtle: #fef3c7;     /* Amber 100 tint */

  /* Semantic Feedback */
  --color-success: #059669;         /* Emerald */
  --color-warning: #d97706;         /* Warm Amber */
  --color-error: #e11d48;           /* Rose */
}

.dark {
  /* Surfaces & Canvas */
  --color-bg-canvas: #090d16;       /* Deep Obsidian core brand swatch (18.57:1 AAA) */
  --color-bg-surface: #111827;      /* Mineral Charcoal card surface */
  --color-bg-subtle: #1e293b;       /* Slate 800 input/badge background */
  --color-border-subtle: #1e293b;   /* Slate 800 border */
  --color-border-strong: #334155;   /* Slate 700 border */

  /* Text & Content */
  --color-text-primary: #f8fafc;    /* Crisp Slate (16.96:1 on surface, 18.57:1 on canvas) */
  --color-text-secondary: #94a3b8;  /* Slate 400 (6.92:1 on surface, 7.58:1 on canvas) */
  --color-text-muted: #8092a5;      /* Slate 450 (5.55:1 on surface, 6.08:1 on canvas — passes AA) */

  /* Core Brand Swatches */
  --color-brand-primary: #14b8a6;   /* Luminous Teal core brand swatch */
  --color-brand-obsidian: #090d16;  /* Deep Obsidian core brand swatch */
  --color-brand-amber: #d97706;     /* Warm Amber core brand swatch */

  /* Brand & Rhythm Functional Accents */
  --color-accent-primary: #14b8a6;  /* Luminous Teal (7.81:1 on canvas, 7.13:1 on surface — AAA) */
  --color-accent-hover: #2dd4bf;    /* Lightened Teal */
  --color-accent-subtle: #134e4a;   /* Teal 900 dark tint */
  --color-warm-accent: #d97706;     /* Warm Amber core swatch (6.10:1 on canvas, 5.57:1 on surface — AA) */
  --color-warm-text: #d97706;       /* Warm Amber (6.10:1 on canvas — AA) */
  --color-warm-subtle: #78350f;     /* Amber 900 dark tint */

  /* Semantic Feedback */
  --color-success: #10b981;         /* Mint Emerald */
  --color-warning: #d97706;         /* Warm Amber */
  --color-error: #fb7185;           /* Light Rose */
}
```

---

## 2. Technical Audit & Accessibility Verification

### 2.1 Actual Installed Environment & Scripts
- **Framework:** Next.js `16.1.0` (App Router). In Next.js 16, `next lint` is deprecated in favor of running ESLint directly.
- **Linting Verification:** Verified directly against `web/package.json` line 10 (`"lint": "eslint"`) and `web/eslint.config.mjs`. Running `npm --prefix web run lint` executes ESLint flat config and exits with **code 0 (0 errors, 0 warnings)**.
- **Test Runner Verification:** Verified against `web/package.json` line 11 (`"lint": "eslint"`, `"test": "node --test tests/**/*.test.mjs"`). Running `npm --prefix web run test` executes Node.js native test runner and reports **57 passing tests across 13 suites in ~287ms (0 failures)**.
- **Personal Schedule CLI Verification:** Verified script `scripts/fetch-personal-schedule.mjs`. Can be executed from repository root via `npm --prefix web run schedule:fetch-personal` or directly within `web/` via `npm run schedule:fetch-personal`.
- **Build Script:** `"build": "next build --webpack"`. Uses Webpack mode for compatibility with server external package `firebase-admin`.

### 2.2 Mathematically Calculated Contrast Ratios
Contrast ratios were mathematically calculated using the official W3C relative luminance formula ($L = 0.2126 R + 0.7152 G + 0.0722 B$ where $R, G, B$ are sRGB converted to linear values) and contrast ratio formula $\frac{L_1 + 0.05}{L_2 + 0.05}$:

| Evaluated Foreground / Background Pair | Contrast Ratio | WCAG 2.2 AA Result | WCAG 2.2 AAA Result |
| :--- | :--- | :--- | :--- |
| **Brand Swatch:** Deep Obsidian `#090D16` on Canvas `#F8FAFC` | **18.57 : 1** | PASS (>= 4.5:1) | PASS (>= 7.0:1) |
| **Brand Swatch:** Deep Obsidian `#090D16` on Card Surface `#FFFFFF` | **19.43 : 1** | PASS (>= 4.5:1) | PASS (>= 7.0:1) |
| **Brand Swatch:** Luminous Teal `#14B8A6` on Dark Canvas `#090D16` | **7.81 : 1** | PASS (>= 4.5:1) | PASS (>= 7.0:1) |
| **Brand Swatch:** Luminous Teal `#14B8A6` on Dark Surface `#111827` | **7.13 : 1** | PASS (>= 4.5:1) | PASS (>= 7.0:1) |
| **Brand Button:** Obsidian Text `#090D16` on Luminous Teal `#14B8A6` | **7.81 : 1** | PASS (>= 4.5:1) | PASS (>= 7.0:1) |
| **Brand Swatch:** Warm Amber `#D97706` on Dark Canvas `#090D16` | **6.10 : 1** | PASS (>= 4.5:1) | AA Normal Text / UI |
| **Brand Swatch:** Warm Amber `#D97706` on Dark Surface `#111827` | **5.57 : 1** | PASS (>= 4.5:1) | AA Normal Text / UI |
| **Brand Graphic:** Warm Amber `#D97706` on Light Canvas `#F8FAFC` | **3.04 : 1** | PASS Graphics SC 1.4.11 (>= 3.0:1) | Non-text UI/Logo Dot |
| **Brand Graphic:** Warm Amber `#D97706` on Card Surface `#FFFFFF` | **3.19 : 1** | PASS Graphics SC 1.4.11 (>= 3.0:1) | Non-text UI/Logo Dot |
| **Text Variant:** Amber Text `#B45309` on Light Canvas `#F8FAFC` | **4.80 : 1** | PASS (>= 4.5:1) | AA Text (Documented Variant) |
| **Text Variant:** Amber Text `#B45309` on Card Surface `#FFFFFF` | **5.02 : 1** | PASS (>= 4.5:1) | AA Text (Documented Variant) |
| **Brand Accent Variant:** Deep Teal `#0F766E` on Canvas `#F8FAFC` | **5.23 : 1** | PASS (>= 4.5:1) | AA Text / Stroke Variant |
| **Brand Accent Variant:** Deep Teal `#0F766E` on Card `#FFFFFF` | **5.47 : 1** | PASS (>= 4.5:1) | AA Text / Stroke Variant |
| **Light Canvas:** Primary Text `#0F172A` on Canvas `#F8FAFC` | **17.06 : 1** | PASS (>= 4.5:1) | PASS (>= 7.0:1) |
| **Light Canvas:** Secondary Text `#475569` on Canvas `#F8FAFC` | **7.24 : 1** | PASS (>= 4.5:1) | PASS (>= 7.0:1) |
| **Light Canvas:** Muted Text `#64748B` on Canvas `#F8FAFC` | **4.55 : 1** | PASS (>= 4.5:1) | Not AAA |
| **Light Card:** Primary Text `#0F172A` on Card Surface `#FFFFFF` | **17.85 : 1** | PASS (>= 4.5:1) | PASS (>= 7.0:1) |
| **Light Card:** Secondary Text `#475569` on Card Surface `#FFFFFF` | **7.58 : 1** | PASS (>= 4.5:1) | PASS (>= 7.0:1) |
| **Light Card:** Muted Text `#64748B` on Card Surface `#FFFFFF` | **4.76 : 1** | PASS (>= 4.5:1) | Not AAA |
| **Dark Canvas:** Primary Text `#F8FAFC` on Dark Canvas `#090D16` | **18.57 : 1** | PASS (>= 4.5:1) | PASS (>= 7.0:1) |
| **Dark Canvas:** Secondary Text `#94A3B8` on Dark Canvas `#090D16` | **7.58 : 1** | PASS (>= 4.5:1) | PASS (>= 7.0:1) |
| **Dark Canvas:** Muted Text `#8092A5` on Dark Canvas `#090D16` | **6.08 : 1** | PASS (>= 4.5:1) | AA Normal Text |
| **Dark Surface:** Primary Text `#F8FAFC` on Dark Surface `#111827` | **16.96 : 1** | PASS (>= 4.5:1) | PASS (>= 7.0:1) |
| **Dark Surface:** Secondary Text `#94A3B8` on Dark Surface `#111827` | **6.92 : 1** | PASS (>= 4.5:1) | Large/UI AAA only |
| **Dark Surface:** Muted Text `#8092A5` on Dark Surface `#111827` | **5.55 : 1** | PASS (>= 4.5:1) | AA Normal Text |

### 2.3 Corrected WCAG 2.2 Target Size & Accessibility Standards
- **WCAG 2.2 SC 2.5.8 (Target Size - Minimum) — Level AA:** Requires an interactive target size of at least **24 × 24 CSS pixels**, or sufficient spacing such that a 24px diameter circle centered on the target does not intersect adjacent targets. All application buttons meet this criterion.
- **WCAG 2.2 SC 2.5.5 (Target Size - Enhanced) — Level AAA:** Requires a target size of at least **44 × 44 CSS pixels**.
- **Mobile Usability Goal:** 44 × 44 CSS pixels is adopted as the primary touch-target design standard for core mobile interactions (`BottomNav` links, habit completion checkmarks, modal buttons) in alignment with Apple Human Interface Guidelines and Google Material Design, satisfying Level AAA where implemented.
- **Focus Appearance (WCAG 2.2 SC 2.4.11 / 2.4.13 Level AA):** Focus outlines are styled with `:focus-visible` using `--color-accent-primary` with a 2px outline and 2px offset, ensuring >= 3:1 contrast against adjacent surface borders.

---

## 3. Disentangling Names, URLs & Resource Availability

To eliminate ambiguity, all project identifiers are separated into their distinct functional contexts:

| Identifier Context | Current Repository / Service Reality | Proposed Target Value | Availability / Verification Status |
| :--- | :--- | :--- | :--- |
| **Brand / Display Name** | "Vritta" in `brand.js`; "Regimen" in docs | **VRITTA** | **APPROVED & FINALIZED** by user |
| **Vercel Project Name** | Currently `Regimen` or `regimen-web` | `vritta-app` (or `vritta-web`) | **PROVISIONAL:** Must be verified in Vercel Dashboard |
| **Vercel Deployment Domain**| Existing deployment active on Vercel | `myvritta.vercel.app` | **PROVISIONAL:** Returned HTTP 404 on network check, but domain assignment can only be confirmed upon project creation or domain addition in Vercel |
| **GitHub Repository Name** | `manishborikar92/Regimen` | `manishborikar92/Vritta` | **PROVISIONAL:** Pending user rename in GitHub Settings |
| **Local Workspace Folder** | `c:\Users\manis\Projects\Regimen` | `c:\Users\manis\Projects\Vritta` | **LOCAL TARGET:** Pending execution in Phase 8 |
| **Firebase Project ID** | `regimen-e32a8` | `vritta-app` (or auto-suffixed) | **PROVISIONAL:** ID will be chosen during Firebase Console setup |

> [!CAUTION]
> **Domain Availability Clarification:** An HTTP 404 response on the public internet only indicates that no deployment is currently responding at that URL. It does **not** prove that the subdomain is unreserved, unblocked, or claimable by our Vercel account. Availability can only be confirmed by attempting to assign the domain within the Vercel Dashboard.

---

## 4. Firebase Architecture, Migration Options & Rollback

### 4.1 Resource Inventory from Existing Codebase
- **Client Configuration (`web/src/lib/firebase/config.js`):** Uses public environment variables (`NEXT_PUBLIC_FIREBASE_*`) to initialize client-side auth and Firestore with `persistentLocalCache` and `persistentSingleTabManager`.
- **Server Configuration (`web/src/lib/server/firebase-admin.js`):** Authoritative Admin SDK initialization. Supports `FIREBASE_SERVICE_ACCOUNT_KEY` (Sensitive JSON string), `GOOGLE_APPLICATION_CREDENTIALS` (file path), and individual private key variables. Contains hardcoded `'regimen-e32a8'` fallbacks on lines 50 and 107 that must be removed.
- **Security Rules (`web/firestore.rules`):** Rules version 2 enforcing authenticated access, owner-only reads/writes (`request.auth.uid == resource.data.userId`), category whitelisting, and read-only access to `/personalRoutines`.
- **Composite Indexes (`web/firestore.indexes.json`):** Defines collection group indexes for `dailyLogs` (`userId ASC`, `date DESC`) and `habits` (`userId ASC`, `order ASC`).

### 4.2 Detailed Comparison of Migration Options

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ OPTION A: Clean Slate (Fresh Start)                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • What is Lost: Historical daily completion logs (/dailyLogs), past streak counters, custom │
│   habits added by user, user customizations to timing/frequency, profile progress (/users). │
│ • What is Recreated: User signs in with Google; new account and new project-scoped UID are  │
│   provisioned; running "npm run schedule:fetch-personal" seeds the 6 canonical routines.   │
│ • Migration Overhead: Minimal (no export/import script needed).                             │
│ • Risk Profile: Zero risk of carrying forward corrupted or legacy schemas.                  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ OPTION B: Preserve Required Data (Admin SDK Scripted Migration)                             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • What is Preserved: Past daily logs (/dailyLogs), historical streak records, custom user   │
│   habits, customized frequency/notes, and long-term user profile progress (/users).         │
│ • Why Native Cloud Export/Import Fails: Google OAuth assigns a DIFFERENT project-scoped UID │
│   to manishborikar92@gmail.com in a new Firebase project. Standard Firestore export/import  │
│   dumps documents with the old UID. Because security rules require "auth.uid == userId",    │
│   the user would be permanently locked out of their own imported documents!                 │
│ • Required Scripted Mechanism: An Admin SDK script must read documents from "regimen-e32a8",│
│   remap document IDs from ${oldUid}_* to ${newUid}_*, remap foreign keys inside             │
│   completedHabitIds and habitProgress, and batch-write to the new project database.         │
│ • Migration Overhead: High (requires developing, testing, and running migration script).    │
│ • Risk Profile: Moderate (requires validation of UID mapping across all collections).       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Data-Preservation Decision Status:** This decision remains **explicitly pending**. Implementation will not proceed with any database migration until Manish explicitly chooses Option A or Option B.

### 4.3 Cloud Firestore Location Decision
- **Immutability Fact:** Once a Cloud Firestore database is created, **its physical location cannot be changed**. Choosing a location requires evaluating permanent trade-offs:
  - **`asia-south1` (Mumbai, India):** Closest physical proximity to Manish (India). Provides lowest latency for direct client-side browser queries, but is a single-region location (99.99% availability SLA).
  - **`nam5` (US Central multi-region):** Current location of `regimen-e32a8`. High availability multi-region location (99.999% SLA), closer to Vercel default serverless regions (`iad1`), but introduces higher round-trip latency for browser requests originating in India.
- **Decision Status:** Pending user confirmation of preferred location (`asia-south1` vs `nam5`) prior to provisioning Phase 6.

### 4.4 Environment Scoping & Staging Strategy
- **Local Development:** Uses `web/.env.local` pointing to local test credentials.
- **Preview Staging:** Vercel Preview environment variables point to the **new Firebase project**, allowing full integration testing on preview deployments before touching Production.
- **Production Cutover:** Vercel Production environment variables remain pointing to `regimen-e32a8` until the complete application and data migration have passed acceptance criteria on Preview.

### 4.5 Rollback Strategy
- The existing Firebase project `regimen-e32a8` will remain completely active and untouched throughout migration.
- If any defect or data inconsistency is detected on the new setup, rollback is instant:
  1. Revert `web/.env.local` to `regimen-e32a8`.
  2. Revert Vercel environment variables to `regimen-e32a8`.
  3. Redeploy the previous production deployment in Vercel Dashboard.

---

## 5. Dependency-Aware 10-Phase Roadmap & Safe Sequencing

```mermaid
flowchart TD
    Gate["Approval Gate (User Authorizes Plan)"] --> P1["Phase 1: Design Tokens & Theme Engine (Local)"]
    P1 --> P2["Phase 2: Master Vector Assets Migration (Local)"]
    P2 --> P3["Phase 3: UI/UX Component Polish (Local)"]
    P3 --> P4["Phase 4: Login Page Redesign (Local)"]
    P4 --> P5["Phase 5: Browser Verification & Accessibility Audit (Local)"]
    P5 --> Checkpoint["Recovery Checkpoint (Clean Git Tree & Local Tests Pass)"]
    Checkpoint --> P6["Phase 6: Fresh Firebase Setup & Staging Validation (Cloud/Preview)"]
    P6 --> P7["Phase 7: GitHub Repository Renaming & Git Remote Update"]
    P7 --> P8["Phase 8: Local Folder Renaming (External PowerShell)"]
    P8 --> P9["Phase 9: Vercel Project Renaming & Production Cutover"]
    P9 --> P10["Phase 10: Documentation Archival, Cleanup & Final Handover"]
```

### Why This Sequence is Safest:
1. **Phases 1–5 (Local Frontend Polish):** Completely decoupled from external cloud infrastructure. Developed and tested on the working local environment.
2. **Recovery Checkpoint:** Before modifying external repositories or databases, `git status` verifies a clean working tree and all 57 tests pass.
3. **Phase 6 (Firebase Setup in Isolation):** New project is created and validated in Preview staging. Production remains on `regimen-e32a8`.
4. **Phases 7–8 (Repository & Folder Renaming):** Executed in a dedicated maintenance window. Git remote is updated before Vercel builds from the new URL.
5. **Phase 9 (Vercel Cutover):** Triggered only after frontend code, Firebase project, and GitHub repository are completely verified.
6. **Phase 10 (Cleanup):** Archival occurs only after production is live and verified.

---

### Detailed Phase Specifications

#### Phase 1: Design Tokens & Zero-Flash Theme Engine
- **Objectives:** Implement Restorative Juniper semantic tokens and zero-flash theme switching without introducing external dependencies.
- **Affected Files:**
  - `web/src/app/globals.css` (add `@custom-variant dark`, define semantic tokens in `:root` and `.dark`).
  - `web/src/contexts/ThemeContext.js` (create React Context managing `theme`, `resolvedTheme`, and `setTheme`).
  - `web/src/contexts/index.js` (export `ThemeContext`).
  - `web/src/app/layout.js` (add `suppressHydrationWarning`, inject blocking script before `<body>`, wrap with `ThemeProvider`).
  - `web/src/components/ui/TopNav.js` (add 3-state Theme Toggle pill).
  - `web/src/lib/constants/brand.js` (update `BRAND.themeColor` to `#0F766E` and define Restorative Juniper constants).
- **Dependencies:** None.
- **Working Directory:** `web/`
- **Verification Commands:**
  - `npm --prefix web run lint` (must exit 0).
  - `npm --prefix web run test` (must pass 57/57 tests).
- **Acceptance Criteria:** Theme toggles between Light, Dark, and System; selection persists across reloads; dark mode reload produces zero white flash; 0 console hydration errors.

#### Phase 2: Master Vector Assets & Branding Metadata
- **Objectives:** Replace legacy gradient logo with the approved **Concept 3: Guiding Sutra** mark and install crisp icons.
- **Affected Files:**
  - `web/src/components/ui/Logo.js` (replace with Guiding Sutra SVG geometry adapting to theme).
  - `web/public/logo.svg` (replace with `logo-concept-3-guiding-sutra.svg`).
  - `web/src/app/icon0.svg` (replace with 20px-stroke `guiding-sutra-favicon.svg`).
  - `web/public/web-app-manifest-192x192.png`, `512x512.png`, `apple-icon.png`, `favicon.ico` (regenerate).
  - `web/src/app/manifest.json` (name: "VRITTA", theme_color: "#0F766E").
  - `web/src/app/layout.js` (metadata title: "VRITTA — Personal Routine Companion").
- **Dependencies:** Phase 1 complete.
- **Verification Commands:** `npm --prefix web run test` (57/57 pass); inspect browser tab at 16×16 and 32×32.
- **Acceptance Criteria:** Favicon renders clearly in browser tabs; PWA manifest loads without error.

#### Phase 3: UI/UX Component Polish (Mobile-First)
- **Objectives:** Apply semantic tokens and mobile touch ergonomics (>= 44px) across core views; remove uppercase eyebrow clutter.
- **Affected Files:**
  - `web/src/app/(protected)/dashboard/page.js`: Clean grouping (Flexible, Afternoon Movement, Before Bed Reading); replace hardcoded gradients; eliminate excessive uppercase eyebrows.
  - `web/src/components/habits/WorkbookCard.js`: Dual-session buttons with tactile `:active` state.
  - `web/src/components/habits/MovementCard.js`: Weekday-adaptive card and Sunday rest banner using slate/juniper tokens.
  - `web/src/components/habits/OshoCard.js`, `ReadingCard.js`, `SpeakingCard.js`, `DiaryCard.js`: Semantic surface/text styling.
  - `web/src/components/habits/StreakCounter.js`: Warm Amber rhythm styling.
  - `web/src/components/ui/BottomNav.js`: 44px touch targets; normalized 2.0px stroke icons.
  - `web/src/app/(protected)/habits/page.js`: Routine Manager list and modal styling.
  - `web/src/app/(protected)/analytics/page.js`: 30-day heatmap with Restorative Juniper activity tokens.
- **Dependencies:** Phases 1–2 complete.
- **Verification Commands:** `npm --prefix web run lint` (exit 0); `npm --prefix web run test` (57/57 pass).
- **Acceptance Criteria:** Zero horizontal overflow across mobile viewports; touch targets >= 44×44px; tactile active states.

#### Phase 4: Login & Authentication Page Redesign
- **Objectives:** Replace the animated AI glowing blob with a calm, dignified authentication experience.
- **Affected Files:**
  - `web/src/app/(auth)/login/page.js`: Remove `animate-pulse blur-2xl` glow; render Guiding Sutra mark in porcelain/obsidian card; style 4 pillars with Restorative Juniper badges; tactile Google button.
- **Dependencies:** Phases 1–3 complete.
- **Verification Commands:** `npm --prefix web run test` (57/57 pass).
- **Acceptance Criteria:** Zero animated glow blobs; Google Sign-In functions in Light and Dark modes.

#### Phase 5: Browser Verification & Accessibility Audit
- **Objectives:** Comprehensive visual and functional audit across viewports.
- **Dependencies:** Phases 1–4 complete.
- **Verification Commands:**
  - `npm --prefix web run test` (57/57 pass).
  - `npm --prefix web run build` (Next.js build in `--webpack` mode compiles with 0 errors).
  - Execute viewport matrix audit (375px, 390px, 412px, 768px, 1280px).
- **Acceptance Criteria:** Zero element overflow (`scrollWidth === innerWidth`); contrast ratios verified; focus outlines clear.

#### Recovery Checkpoint
- Perform clean working-tree check: `git status` must show only planned local changes.
- Ensure all 57 tests pass and build succeeds.

#### Phase 6: Fresh Firebase Project Setup & Staging Validation
- **Objectives:** Provision fresh Firebase project, deploy security rules and indexes, configure Admin SDK credentials, and validate in Preview.
- **Dependencies:** Phase 5 verified; user decision on Option A vs Option B confirmed.
- **Tasks:**
  1. Create Firebase project in Firebase Console.
  2. Enable Google Authentication; add authorized domains (`localhost`, `127.0.0.1`, Vercel domains).
  3. Provision Firestore Database in confirmed location (`asia-south1` or `nam5`).
  4. Deploy rules: `firebase deploy --only firestore:rules --project <new-id>`.
  5. Deploy indexes: `firebase deploy --only firestore:indexes --project <new-id>`.
  6. Generate Admin SDK service account key; store in `%USERPROFILE%\.credentials\`.
  7. Update `web/.firebaserc` and `web/.env.local`. Remove hardcoded fallbacks in `firebase-admin.js`.
  8. Execute data strategy (Option A: seed routines via `npm run schedule:fetch-personal`; Option B: execute migration script).
  9. Deploy to Vercel Preview environment and validate end-to-end.
- **Acceptance Criteria:** Sign-in and habit tracking verified on local dev server and Vercel Preview.

#### Phase 7: GitHub Repository Renaming & Git Remote Update
- **Objectives:** Rename GitHub repository and update local Git remotes safely.
- **Dependencies:** Phase 6 complete.
- **Tasks:**
  1. Go to GitHub repo settings: Rename repository from `Regimen` to `Vritta`.
  2. Update local Git remote: `git remote set-url origin https://github.com/manishborikar92/Vritta.git`.
  3. Verify with `git remote -v` and `git fetch origin`.
  4. Check Vercel Project Settings > Git to confirm repository link is active.
- **Acceptance Criteria:** `git remote -v` reflects `Vritta.git`; fetch succeeds.

#### Phase 8: Local Folder Renaming
- **Objectives:** Safely rename local workspace directory on Windows.
- **Dependencies:** Phase 7 complete.
- **Tasks:**
  1. Terminate all Node.js and terminal processes running in `C:\Users\manis\Projects\Regimen`.
  2. Open an external PowerShell window at `C:\Users\manis\Projects`.
  3. Execute: `Rename-Item -Path "C:\Users\manis\Projects\Regimen" -NewName "Vritta"`.
  4. Reopen project at `C:\Users\manis\Projects\Vritta` and verify `git status`.
- **Acceptance Criteria:** Directory is `Vritta`; git working tree is intact.

#### Phase 9: Vercel Project Renaming & Production Cutover
- **Objectives:** Rename Vercel project, configure production domain, update Sensitive env vars, and cut over Production.
- **Dependencies:** Phases 6–8 complete.
- **Tasks:**
  1. In Vercel Dashboard, update Project Name to `vritta-app` (provisional).
  2. Add production domain in Vercel Domains.
  3. Add production domain to Firebase Auth Authorized Domains.
  4. Update Production environment variables in Vercel (`FIREBASE_SERVICE_ACCOUNT_KEY` Sensitive, `NEXT_PUBLIC_FIREBASE_*`).
  5. Trigger production redeployment.
- **Acceptance Criteria:** Production deployment succeeds; Google Sign-In authenticates on live domain; routines load.

#### Phase 10: Documentation Archival, Cleanup & Final Handover
- **Objectives:** Execute documentation cleanup matrix; archive superseded documents to `docs/archive/`; deliver handover sign-off.
- **Dependencies:** Phase 9 live and verified.
- **Acceptance Criteria:** All documentation updated; temporary debug files removed; obsolete plans safely archived.

---

## 6. Comprehensive Testing Coverage Matrix

The 57 automated unit tests are a logic baseline, not proof of complete UI correctness. Full verification requires testing all application routes and states:

| Route / Component | Interaction / State Tested | Testing Method | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **`/login` (Auth Page)** | Initial load (Light & Dark) | Visual / Playwright | Guiding Sutra mark crisp; zero AI glow; cards readable |
| **`/login` (Auth Page)** | Google Sign-In click | Manual Browser | Popup opens, authenticates, redirects to `/dashboard` |
| **`/dashboard` (Today)** | Groups rendering | Visual / Playwright | Routines grouped into Flexible, Afternoon, Before Bed |
| **`WorkbookCard`** | Session 1 & 2 increments | Interaction / Manual | Progress updates; complete only when review is checked |
| **`MovementCard`** | Weekday-adaptive display | Unit test & Browser | Displays Mon/Wed/Fri workout, Tue/Thu/Sat walk, Sun rest |
| **`OshoCard`** | Discourse catalog modal | Interaction / Manual | Modal opens, shows 30 talks across 6 groups, saves progress |
| **`ReadingCard`** | 30-min bedtime timer | Interaction / Manual | Timer starts, pauses, updates duration progress |
| **`SpeakingCard`** | ChatGPT practice toggle | Interaction / Manual | Opens practice notes, toggles binary completion |
| **`DiaryCard`** | Private reflection modal | Interaction / Manual | Opens 5 reflection prompts; saves privately to account |
| **`StreakCounter`** | Consistency rhythm display| Unit test & Visual | Amber accent renders; rest days excluded from streak |
| **`TopNav`** | 3-state Theme Switcher | Interaction / Manual | Toggles Light, Dark, System; zero flash on reload |
| **`TopNav`** | Profile menu & Sign out | Interaction / Manual | Menu opens, confirmation dialog prompts, signs out clean |
| **`BottomNav`** | Navigation tabs (Today, Routine, Insights)| Interaction / Manual | Active tab highlighted; touch targets >= 44×44px |
| **`/habits` (Manager)** | Add / Edit Habit modal | Interaction / Manual | Saves custom habit; displays `Personal` vs `Foundation` badge |
| **`/habits` (Manager)** | Delete habit | Interaction / Manual | ConfirmDialog warns; habit removed; past logs preserved |
| **`/analytics` (Insights)**| 30-day calendar heatmap | Interaction / Visual | Sunday rest excluded from denominator; heatmap colored |
| **Loading States** | Page navigation loading | Visual / Playwright | `LoadingSpinner` centers cleanly with semantic accent |
| **Empty States** | No habits scheduled | Visual / Playwright | Helpful empty state with link to Routine Manager |
| **Responsive Viewports**| 375px, 390px, 412px, 768px, 1280px | Playwright / DevTools | Zero horizontal scrollbar (`scrollWidth === clientWidth`) |

### Recommended Browser Automation Tooling
- **Recommendation:** Install **Playwright** (`@playwright/test`) as a devDependency in `web/` during Phase 5.
- **Justification:** Playwright natively supports viewport emulation (iPhone SE 375px, iPhone 14 390px, Pixel 7 412px), dark mode emulation (`colorScheme: 'dark'`), full-page screenshot capture, and automated assertion of `scrollWidth === clientWidth`.
- **Evidence Storage:** Automated and manual screenshots will be stored in `docs/test-evidence/`.

---

## 7. Documentation & Artifact Inventory

| Exact File Path | Proposed Action | Justification |
| :--- | :--- | :--- |
| `docs/branding-exploration/01-project-analysis-and-audit.md` | **Maintain** | Permanent baseline audit and anti-slop guidelines. |
| `docs/branding-exploration/02-name-proposals.md` | **Archive** | Move to `docs/archive/branding/02-name-proposals.md` as historical research record. |
| `docs/branding-exploration/03-logo-concepts/logo-concept-3-guiding-sutra.svg` | **Maintain** | Authoritative approved logo vector mark. |
| `docs/branding-exploration/03-logo-concepts/guiding-sutra-*.svg` | **Maintain** | Master, light, dark, and favicon derived vector assets. |
| `docs/branding-exploration/03-logo-concepts/logo-concept-[1245]*.svg` | **Archive** | Move to `docs/archive/branding/` as historical discarded concepts. |
| `docs/branding-exploration/03-logo-concepts/logo-design-rationale.md` | **Maintain** | Technical geometry documentation for Guiding Sutra mark. |
| `docs/branding-exploration/04-color-palette-and-tokens.md` | **Maintain** | Comprehensive color palette research and token reference. |
| `docs/branding-exploration/05-ui-ux-mockups/palette-comparison-sheet.svg` | **Maintain** | Visual design system component sheet. |
| `docs/branding-exploration/05-ui-ux-mockups/mockup-*.svg` | **Maintain** | High-fidelity UI mockups used for visual regression verification. |
| `docs/branding-exploration/06-phased-implementation-plan.md` | **Maintain** | **Canonical Implementation Plan** (this document). |
| `docs/branding-exploration/interactive-preview.html` | **Maintain** | Interactive browser preview tool for theme testing. |
| `docs/regimen_project_brief.md` | **Maintain** | Authoritative product brief defining Manish's 6 daily practices. |
| `docs/Architecture.md` | **Update** | Update architecture to VRITTA, Restorative Juniper tokens, and ThemeContext. |
| `docs/firebase-setup.md` | **Update** | Remove obsolete `/api/schedule/personal` references; document new Firebase project. |
| `docs/UserFlow.md` | **Update** | Document theme switching and updated user journeys. |
| `docs/Workflow.md` | **Update** | Update repository URLs, Node test commands, and CLI sync instructions. |
| `README.md` (root) | **Update** | Rewrite to feature VRITTA branding, Guiding Sutra logo, and setup instructions. |
| `web/README.md` | **Update** | Update package scripts and environment variable documentation. |
| `web/.env.local.example` | **Update** | Update placeholders for fresh Firebase project. |
| `docs/schedule-isolation-and-firebase-plan.md` | **Archive** | Move to `docs/archive/` (superseded Phase 5 plan). |
| `docs/rebuild-plan.md` | **Archive** | Move to `docs/archive/` (superseded initial rebuild plan). |
| `docs/BODY-RESTORATION-PROTOCOL.md` | **Archive** | Move to `docs/archive/` (superseded pre-rebuild schedule). |
| `web/firebase-debug.log` | **Delete** | Temporary CLI debug log from past execution. |
| `docs/migration-and-renaming-runbook.md` | **Create** | Dedicated operational runbook for renaming and migration execution. |
| `docs/mobile-testing-and-release-checklist.md` | **Create** | Dedicated mobile QA protocol, screenshot log, and sign-off checklist. |

---

## 8. Authoritative Research References

1. **Next.js 16 App Router Layouts & Scripts:**  
   [https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates)  
   *Relevance:* Authoritative guide on `suppressHydrationWarning` and synchronous blocking script execution to prevent theme flashes.
2. **React 19 Client Component Guidelines:**  
   [https://react.dev/reference/rsc/use-client](https://react.dev/reference/rsc/use-client)  
   *Relevance:* Standards for client boundaries, mounted state checks, and hydration safety.
3. **Tailwind CSS v4 Dark Mode & `@custom-variant`:**  
   [https://tailwindcss.com/docs/v4-beta#dark-mode](https://tailwindcss.com/docs/v4-beta#dark-mode)  
   *Relevance:* Official CSS-first syntax for declaring `@custom-variant dark (&:where(.dark, .dark *));`.
4. **Firebase Authentication Authorized Domains:**  
   [https://firebase.google.com/docs/auth/web/google-signin](https://firebase.google.com/docs/auth/web/google-signin)  
   *Relevance:* Requirements for registering deployment domains to avoid `auth/unauthorized-domain` errors.
5. **Cloud Firestore Security Rules v2:**  
   [https://firebase.google.com/docs/firestore/security/get-started](https://firebase.google.com/docs/firestore/security/get-started)  
   *Relevance:* Specification for granular request validation, ownership enforcement, and subcollection scoping.
6. **Firebase Admin SDK Initialization:**  
   [https://firebase.google.com/docs/admin/setup](https://firebase.google.com/docs/admin/setup)  
   *Relevance:* Official guidelines for server-only credential initialization via Service Account keys and environment variables.
7. **Vercel Project Renaming & Domain Routing:**  
   [https://vercel.com/docs/projects/overview](https://vercel.com/docs/projects/overview) & [https://vercel.com/docs/projects/domains](https://vercel.com/docs/projects/domains)  
   *Relevance:* Documentation on project slug updates, default `.vercel.app` domain aliasing, and 308 redirects.
8. **GitHub Repository Renaming:**  
   [https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)  
   *Relevance:* Official steps for updating repository names and configuring local `git remote set-url`.
9. **W3C Web Content Accessibility Guidelines (WCAG) 2.2:**  
   [https://www.w3.org/TR/WCAG22/](https://www.w3.org/TR/WCAG22/)  
   *Relevance:* Contrast thresholds (SC 1.4.3 Level AA / SC 1.4.6 Level AAA), Target Size Minimum (SC 2.5.8 Level AA 24px) vs Target Size Enhanced (SC 2.5.5 Level AAA 44px), and Focus Appearance (SC 2.4.11 Level AA).

---

## 9. Decisions Requiring User Input & Remaining Uncertainties

### Decisions Requiring User Input:
1. **Firebase Data-Preservation Strategy:**
   - **Option A (Fresh Start):** Provision fresh project `vritta-app`, sign in once with Google to create the account, and seed the 6 personalized routines cleanly via `npm run schedule:fetch-personal`. *(Historical daily logs and streaks in `regimen-e32a8` are not carried over).*
   - **Option B (Preserve Required Data):** Develop and execute an Admin SDK migration script to read from `regimen-e32a8`, translate document IDs from the old UID to the new UID, and batch-write historical logs and custom habits into the new project.
2. **Cloud Firestore Location Selection:**
   - **`asia-south1` (Mumbai, India):** Lowest latency for client browser queries in India; single-region (99.99% SLA).
   - **`nam5` (US Central multi-region):** Existing location of `regimen-e32a8`; multi-region redundancy (99.999% SLA); higher latency to India.
   - *Note: Database location cannot be changed after creation.*
3. **Approval to Proceed with Phase 1:**
   - Confirmation to begin implementation strictly with **Phase 1: Design Tokens & Zero-Flash Theme Engine**.

### Remaining Uncertainties (to be verified in service dashboards during execution):
1. **Vercel Current Project Name:** Whether the project is currently registered in Vercel as `Regimen` or `regimen-web` can only be inspected inside Manish's Vercel Dashboard.
2. **Vercel Subdomain Claim:** Whether `myvritta.vercel.app` is truly available to be claimed by Manish's account can only be confirmed upon project creation or domain assignment in the Vercel Dashboard.
3. **GitHub Target Name Availability:** Confirmed that `Vritta` will be entered in GitHub settings under `manishborikar92`.
