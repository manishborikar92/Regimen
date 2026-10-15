# Firebase Setup & Operations Runbook

**Target Repository**: `c:\Users\manis\Projects\Regimen`  
**Application Stack**: Next.js 16.1 (App Router), Firebase Admin SDK v14.5, Firebase Web Client SDK v12.7, Cloud Firestore  
**Primary Standards**: Webpack Serverless Bundle, Vercel Sensitive Environment Variables, Google Cloud IAM Least-Privilege  
**Last Researched & Verified**: October 2026  

---

## 1. Overview & Architecture Boundary

Regimen (Vritta) uses a dual Firebase architecture:

1. **Client-Side (Firebase Web SDK v12.7)**:
   - Configured in `web/src/lib/firebase/config.js` via public environment variables prefixed with `NEXT_PUBLIC_FIREBASE_*`.
   - Executes in the user's browser for Google Sign-In authentication, session persistence, and client-side Firestore reads and updates for public foundation routines.
   - Strictly governed by Cloud Firestore Security Rules (`firestore.rules`).

2. **Server-Side & Admin CLI (Firebase Admin SDK v14.5)**:
   - Configured in `web/src/lib/server/firebase-admin.js` via server-only credentials (`FIREBASE_SERVICE_ACCOUNT_KEY` or `GOOGLE_APPLICATION_CREDENTIALS`).
   - Executes in the standalone administrative Node.js CLI script (`scripts/fetch-personal-schedule.mjs`, run via `npm run schedule:fetch-personal`) to perform direct synchronization of personalized routines directly to the `/habits` collection in Cloud Firestore.
   - Bypasses client security rules to perform privileged operations, strictly scoped to `manishborikar92@gmail.com` (`f5qe4PMQoLYJcuT5ZA5eUdkj1Ue2`).

```mermaid
flowchart TD
    subgraph Client Browser
        WebClient["Firebase Web Client SDK v12.7<br/>(NEXT_PUBLIC_FIREBASE_*)"]
        AuthUser["Authenticated User Session<br/>(Google Sign-In)"]
    end

    subgraph Local Development & CLI Environment
        LocalDev["Next.js Dev Server (localhost:3000)<br/>Reads web/.env.local"]
        LocalCLI["CLI: npm run schedule:fetch-personal<br/>Explicitly loads web/.env.local"]
        ExtCred["External Credential Store<br/>%USERPROFILE%/.credentials/vritta-app-firebase-adminsdk.json"]
    end

    subgraph Google Cloud & Firebase Backend
        GCP_IAM["Google Cloud IAM Service Account"]
        FirebaseAuth["Firebase Authentication<br/>(User Records & UID Resolution)"]
        Firestore["Cloud Firestore<br/>(/habits Collection)"]
    end

    WebClient -->|Public Client Auth| FirebaseAuth
    AuthUser -->|Owner Read/Write via Rules| Firestore
    ExtCred -->|GOOGLE_APPLICATION_CREDENTIALS| LocalCLI
    LocalCLI -->|getUserByEmail| FirebaseAuth
    LocalCLI -->|Privileged Sync Scoped to UID| Firestore
    GCP_IAM -.->|Authorizes| LocalCLI
    GCP_IAM -.->|Authorizes| ExtCred
```

---

## 2. Credential Security Audit & Repository Hygiene

### Git Tracking & Storage Verification
- **Status**: Verified clean.
- `git ls-files` and `git log` show that service account key files have **never been tracked or committed** to this repository.
- **Root `.gitignore`** and **`web/.gitignore`** enforce wildcard exclusions:
  ```gitignore
  # Firebase Admin SDK Service Account Keys
  *firebase-adminsdk*.json
  *-adminsdk-*.json
  service-account*.json
  ```
- **Policy**: No private key or service-account JSON file must ever be placed inside the repository root or subfolders. Working credentials for local development are stored in a secure location external to the workspace.

---

## 3. Local Development Setup (Windows Step-by-Step)

### Step 3.1: Storing Credentials Outside the Repository
Store the Firebase service-account JSON file in your personal Windows user profile directory, outside all Git repositories:

1. Open PowerShell or File Explorer.
2. Create the external credentials directory if it does not already exist:
   ```powershell
   New-Item -ItemType Directory -Path "$HOME\.credentials" -Force
   ```
3. Move or place your Firebase Admin SDK service account key file there:
   ```
   C:\Users\<YourUsername>\.credentials\vritta-app-firebase-adminsdk.json
   ```
4. Verify file permissions: Ensure only your Windows user account has read access to this directory.

> [!CAUTION]
> Never place service-account JSON files inside `c:\Users\<YourUsername>\Projects\Regimen` or any subfolder.

---

### Step 3.2: Configuring `web/.env.local`
Next.js automatically loads `web/.env.local` for the local development server (`npm run dev`) and test scripts.

1. Open `web/.env.local` in an editor.
2. Ensure public Firebase Web configuration variables are present:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyB-Jl7nSWKkLq9TG1BrD_S8qLW8gcM4ARo"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="vritta-app.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="vritta-app"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="vritta-app.firebasestorage.app"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="19741273143"
   NEXT_PUBLIC_FIREBASE_APP_ID="1:19741273143:web:f239f511f41849f62123b2"
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-YVD3B80SB6"
   ```
3. Add the pointer to your external service-account file using **forward slashes**:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS="C:/Users/<YourUsername>/.credentials/vritta-app-firebase-adminsdk.json"
   ```
   *(Replace `<YourUsername>` with your Windows user name, e.g., `manis`)*.

> [!NOTE]
> Forward slashes (`/`) work natively across all Node.js and Windows runtimes and prevent backslash escape conflicts (such as `\U` or `\n`).

---

### Step 3.3: How Environment Variables Load in Next.js vs CLI

- **Next.js Development Server (`npm --prefix web run dev`)**:
  - Next.js automatically loads `.env.local` at startup.
  - Server-side modules like `web/src/lib/server/firebase-admin.js` receive `GOOGLE_APPLICATION_CREDENTIALS` through `process.env`.
- **Standalone CLI Script (`scripts/fetch-personal-schedule.mjs`)**:
  - Standalone Node.js scripts executed outside `next dev` do **not** have Next.js environment loading built-in.
  - The script explicitly implements `loadEnv()` at startup, parsing `web/.env.local` into `process.env` before dynamically importing Firebase modules:
    ```javascript
    function loadEnv() {
      const envPath = path.join(projectRoot, 'web', '.env.local');
      if (!fs.existsSync(envPath)) return;
      // Parses KEY=VALUE lines and populates process.env
    }
    ```
  - This ensures identical behavior whether invoked via `npm --prefix web run schedule:fetch-personal` or directly via `node scripts/fetch-personal-schedule.mjs`.

---

### Step 3.4: Running and Verifying Local Operations

#### 1. Verifying Local Administrative CLI Synchronization
Run the personal synchronization tool:
```powershell
npm --prefix web run schedule:fetch-personal
```

**Expected Successful Output**:
```
======================================================
 Vritta: Personalized Schedule Synchronization (CLI) 
======================================================

[Target Account] manishborikar92@gmail.com
[Auth] Resolving user account via Firebase Admin SDK...
[Success] Verified user: Manish Borikar (UID: mDCfGKWU2nWHHHZ84mYuhG1kiSp1)

[Sync] Synchronizing 6 personalized routines to Cloud Firestore...

[Complete] Successfully synchronized 6 routines:
  ✓ Practice English Workbook      [English Learning] (ID: mDCfGKWU2nWHHHZ84mYuhG1kiSp1_canonical_english_workbook)
  ✓ Exercise / Movement Plan       [Movement & Strength] (ID: mDCfGKWU2nWHHHZ84mYuhG1kiSp1_canonical_exercise_plan)
  ✓ Listen to Osho                 [Listening & Awareness] (ID: mDCfGKWU2nWHHHZ84mYuhG1kiSp1_canonical_listen_osho)
  ✓ Read Books                     [Reading] (ID: mDCfGKWU2nWHHHZ84mYuhG1kiSp1_canonical_read_books)
  ✓ Practice English Speaking      [Communication] (ID: mDCfGKWU2nWHHHZ84mYuhG1kiSp1_canonical_english_speaking)
  ✓ Maintain a Diary               [Reflection] (ID: mDCfGKWU2nWHHHZ84mYuhG1kiSp1_canonical_maintain_diary)

[Integrity Guarantees Applied]
  • User customizations preserved (custom times, notes, frequencies)
  • Routine stable keys isolated from generic foundation routines
  • Custom user habits preserved
  • Daily completion history and streak logs (/dailyLogs) unmodified
```

#### 2. Verifying Next.js Development Server
Start the local server:
```powershell
npm --prefix web run dev
```
Open `http://localhost:3000` and test Google Sign-In.

---

### Step 3.5: Local Troubleshooting

| Symptom / Error | Root Cause | Solution |
| :--- | :--- | :--- |
| `[Error] Firebase Admin credentials are not configured.` | Missing or mistyped `GOOGLE_APPLICATION_CREDENTIALS` in `web/.env.local`. | Verify path in `web/.env.local`. Ensure it points to the external JSON file with forward slashes. |
| `ENOENT: no such file or directory` | The credential file path does not exist on disk. | Verify that `C:/Users/<username>/.credentials/vritta-app-firebase-adminsdk.json` exists and is readable. |
| `[Error] No user record found in Firebase Auth for manishborikar92@gmail.com` | User has not logged into the project yet. | Sign in to the local or hosted application once with Google using `manishborikar92@gmail.com` to provision the auth record. |
| `auth/invalid-credential` or `Unexpected token in JSON` | The service-account JSON file is corrupted or incomplete. | Re-download the service account key from Google Cloud Console / Firebase Console. |

---

## 4. Vercel Production & Preview Setup

### Step 4.1: Why `FIREBASE_SERVICE_ACCOUNT_KEY` as a Sensitive Variable?
Vercel serverless functions run in ephemeral container environments where local file systems are ephemeral and unshared. Storing credentials as a **Sensitive Environment Variable** provides the strongest balance of security and reliability:

- **Encrypted at Rest**: Vercel encrypts Sensitive environment variables using industry-standard envelope encryption.
- **Redacted from Logs & UI**: Values are never displayed in the Vercel dashboard after saving and are automatically redacted from build logs and runtime logs.
- **Server-Only Isolation**: Because the variable name does **not** have the `NEXT_PUBLIC_` prefix, Next.js will **never** expose or bundle it into client-side JavaScript.
- **Zero Cold-Start Latency**: Avoids external federated token exchange hops (unlike OIDC STS federation), providing instant in-memory credential initialization.

> [!IMPORTANT]
> Vercel **Sensitive** environment variables are supported for **Production** and **Preview** environments. They are **not** supported for Development. Do not attempt to sync production secrets into Vercel Development variables; keep local development credentials in `web/.env.local` pointing to your local external file.

---

### Step 4.2: Step-by-Step Vercel Configuration

1. **Copy the Entire JSON Content**:
   - Open your external service-account key (`C:\Users\<username>\.credentials\vritta-app-firebase-adminsdk.json`) in a secure text editor.
   - Copy the entire JSON object string, including curly braces `{ ... }`.

2. **Navigate to Project Settings on Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com) > Select project **Regimen** (or `regimen-web`).
   - Click **Settings** > Select **Environment Variables** in the left sidebar.

3. **Add `FIREBASE_SERVICE_ACCOUNT_KEY`**:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value**: Paste the full JSON content.
   - **Type**: Select **Sensitive** (masks value permanently).
   - **Environments**: Check **Production** and **Preview** (uncheck Development).
   - Click **Save**.

4. **Add Client-Side Environment Variables (if not already set)**:
   Ensure the following public variables are configured for Production and Preview:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (`vritta-app`)
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

5. **Trigger a Redeployment**:
   - Environment variable changes take effect **only on newly built deployments**. Existing deployments run on their build-time configuration.
   - Go to **Deployments** > Select the latest deployment > Click the three-dots menu (`...`) > **Redeploy**.

---

### Step 4.3: Verifying Vercel Deployment Without Leaking Credentials

You can verify that the Route Handler is correctly initialized without inspecting server memory or printing private keys:

1. **Test Unauthorized Access (Expected: 401)**:
   ```bash
   curl -i -X POST https://your-project.vercel.app/api/schedule/personal
   ```
   **Response**: `401 Unauthorized` with body:
   ```json
   {"error":"Unauthorized: Missing or invalid Authorization header."}
   ```
   This confirms the Route Handler is online and enforcing authentication headers before touching credentials.

2. **Test Method Rejection (Expected: 405)**:
   ```bash
   curl -i -X GET https://your-project.vercel.app/api/schedule/personal
   ```
   **Response**: `405 Method Not Allowed`.

3. **Test In-App Authorized Sync (When Phase 4 UI is active)**:
   - Sign in as `manishborikar92@gmail.com`.
   - Click the personalized schedule sync button.
   - Check the network tab: `POST /api/schedule/personal` returns `200 OK` with `{ "success": true, "count": 6 }`.
   - Sign in as any other account: `POST /api/schedule/personal` returns `403 Forbidden`.

---

### Step 4.4: Vercel Troubleshooting

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| `500 Internal Server Error` during personal sync | Malformed JSON in `FIREBASE_SERVICE_ACCOUNT_KEY` or truncated copy-paste. | Re-copy the service-account JSON in full, ensuring opening `{` and closing `}` are included. Re-save in Vercel and redeploy. |
| `auth/admin-credentials-missing` | Variable name mistyped or omitted from the target environment. | Check Vercel Environment Variables: ensure the name is exactly `FIREBASE_SERVICE_ACCOUNT_KEY` and both **Production** and **Preview** checkboxes are active. |
| Symlink errors during build (`os error 1314`) | Webpack external package issue on Windows/Vercel. | Verify that `next.config.mjs` contains `serverExternalPackages: ['firebase-admin']` and `package.json` build command is `next build --webpack`. |

---

## 5. Google Cloud IAM Least-Privilege Architecture

### Distinguishing Service Agents vs Application Runtime Service Accounts

A common security anti-pattern is assigning broad administrative roles or confusing Google internal service agents with application runtime service accounts:

- **Firebase Service Agents (`...-adminsdk-fbsvc@...`)**:
  - The default service account created by Firebase Console has the `Firebase Admin SDK Administrator Service Agent` (`roles/firebase.sdkAdminServiceAgent`) role.
  - While functional, it has broad administrative capabilities across the Firebase project.
- **Production Runtime Best Practice (Principle of Least Privilege)**:
  - If a dedicated service account is provisioned for production runtime synchronization, it requires **only the exact permissions** needed for Regimen's runtime operations.

### Minimal Required IAM Roles for Regimen Runtime

| Firebase / GCP Service | Required Runtime Operations | Recommended IAM Role | Role Identifier |
| :--- | :--- | :--- | :--- |
| **Firebase Authentication** | `adminAuth.verifyIdToken()`<br/>`adminAuth.getUserByEmail()` | **Firebase Authentication Admin** | `roles/firebaseauth.admin` |
| **Cloud Firestore** | Read & Upsert `/habits/{userId}_*`<br/>Query habit documents | **Cloud Datastore User** | `roles/datastore.user` |

> [!TIP]
> `roles/datastore.user` grants read/write access to Cloud Firestore documents without granting permissions to delete databases, modify indexes, or alter project IAM settings. Never assign project-level `roles/owner` or `roles/editor` to application runtime credentials.

---

## 6. Maintenance & Change Management Runbook

### 6.1 Modifying Cloud Firestore Security Rules (`firestore.rules`)
When adding collections, updating field validations, or adjusting authorization logic:

1. **Edit `web/firestore.rules` locally**.
2. **Run test suite to verify rule conformance**:
   ```powershell
   npm --prefix web test
   ```
3. **Deploy security rules to Firebase**:
   ```powershell
   firebase deploy --only firestore:rules --project vritta-app
   ```
4. **Impact**: Security rule deployments take effect **immediately** across all clients without requiring an application rebuild or Vercel redeployment.

---

### 6.2 Adding or Modifying Firestore Indexes (`firestore.indexes.json`)
If a query requires a composite index:

1. **Update `web/firestore.indexes.json`**.
2. **Deploy indexes via Firebase CLI**:
   ```powershell
   firebase deploy --only firestore:indexes --project vritta-app
   ```
3. **Impact**: Firebase builds the index in the background (typically 2–5 minutes). Queries using the index will succeed once index status changes from `BUILDING` to `ENABLED`.

---

### 6.3 Rotating Firebase Service Account Keys
Service account keys should be rotated periodically (e.g., every 90 or 180 days) or immediately if a leak is suspected.

#### Zero-Downtime Rotation Procedure:
1. **Generate New Key in Google Cloud / Firebase Console**:
   - Go to [Firebase Console](https://console.firebase.google.com/) > Project Settings > **Service accounts**.
   - Click **Generate new private key** > Download new JSON file.
2. **Update External Local File**:
   - Place the new file in `C:\Users\<username>\.credentials\vritta-app-firebase-adminsdk.json`.
3. **Update Vercel Sensitive Environment Variable**:
   - Open Vercel Project Settings > Environment Variables > Edit `FIREBASE_SERVICE_ACCOUNT_KEY`.
   - Paste the new JSON content > Click **Save**.
   - Trigger a **Redeploy** on Vercel.
4. **Verify Local CLI & Deployed App**:
   - Run `npm --prefix web run schedule:fetch-personal` locally.
   - Verify Route Handler responses on Vercel.
5. **Delete Old Key**:
   - Go to Google Cloud Console > IAM & Admin > **Service Accounts**.
   - Select the service account > **Keys** tab.
   - Delete the old, retired key ID.

---

### 6.4 Introducing New Authentication Providers (e.g., GitHub, Apple, Email/Password)
If adding new auth providers in the future:

1. **Enable Provider in Firebase Console**:
   - Go to Firebase Console > **Authentication** > **Sign-in method** > Enable provider.
2. **Client-Side Integration**:
   - Update `web/src/lib/firebase/auth.js` to add the provider instance (e.g., `GithubAuthProvider`).
   - Add the trigger button to `web/src/app/(auth)/login/page.js`.
3. **Backend Authorization Invariance**:
   - The protected Route Handler (`/api/schedule/personal`) verifies the decoded ID token's `email` and `email_verified` claims regardless of provider. As long as the provider supplies a verified email matching `manishborikar92@gmail.com`, authorization succeeds seamlessly.
4. **Authorized Domains**:
   - Ensure Vercel production and preview domains (`*.vercel.app` or custom domains) are added to **Firebase Console** > **Authentication** > **Settings** > **Authorized domains**.

---

### 6.5 Multi-Project Environment Segregation (Staging vs Production)
If separating preview and production into distinct Firebase projects (e.g., `regimen-staging` vs `regimen-prod`):

| Environment | Firebase Project ID | Client Config (`NEXT_PUBLIC_FIREBASE_*`) | Vercel Environment Scope |
| :--- | :--- | :--- | :--- |
| **Local Dev** | `vritta-app` (or staging) | Defined in `web/.env.local` | Local only |
| **Preview Branches** | `regimen-staging` | Configured in Vercel Project Settings | Scoped to **Preview** |
| **Production** | `vritta-app` (prod) | Configured in Vercel Project Settings | Scoped to **Production** |

To switch environments in the Firebase CLI:
```powershell
firebase use <project-alias-or-id>
```

---

### 6.6 Routine Seeding Architecture, Permissions & Idempotency Rules

Regimen enforces strict segregation between public foundation routine loading and administrative personal schedule management:

#### 1. Foundation Routine Seeding (Client Web SDK)
- **Sole Entry Point**: The "Load Recommended Routines" action is available **exclusively on the Routine Manager page (`/habits`)**.
- **Strict Zero-Routine Guard**: The action is rendered **only when the authenticated account has zero routines or habits** (`habits.length === 0`).
- **Permanent Hiding**: Once any routine exists (generic foundation routine, CLI-seeded personal routine, or custom user-created habit), the button is completely removed from the DOM.
- **Other Pages Protected**: The Dashboard (`/dashboard`) and all other application pages contain zero seeding buttons or banners. When a user has zero habits on the Dashboard, an informative link (`Open Routine Manager`) directs them to `/habits`.
- **Loading State Flash Prevention**: Both Dashboard and Routine Manager pages return `<LoadingSpinner />` while the initial Firestore snapshot listener is in flight (`if (loading)`), preventing any momentary flash of the empty state or button.
- **UI Concurrency Protection**: Rapid double-clicking or concurrent triggers are blocked by an in-flight guard (`isSeedingRef = useRef(false)`), disabling the button and changing its label to `Loading Routines...`.
- **Firestore Service Idempotency**: In `web/src/lib/firebase/firestore.js`, `seedHabitsForUser(userId, seedData)` queries existing routines for the user and verifies `if (!existingSnap.empty) return existingSnap.docs.map(doc => doc.id);`. If routines already exist, the function exits immediately without writing or overwriting records. Deterministic document IDs (`${userId}_${stableKey}`) guarantee that even concurrent initial writes target the exact same Firestore paths without creating duplicate documents.
- **Failure Resilience**: If seeding fails (e.g., offline or network error), an error toast is presented, `isSeedingRef` is reset in the `finally` block, and the button remains active for the user to retry.

#### 2. Personalized Schedule Synchronization (Admin SDK CLI)
- **Admin Privilege**: Personalized routines (Word Power Made Easy, 12-Week Progressive Movement Plan, 30-Discourse Osho Library, etc.) are synchronized exclusively through the CLI script `scripts/fetch-personal-schedule.mjs` (`npm run schedule:fetch-personal`).
- **Direct Collection Target**: Upserts directly into `/habits` using Admin SDK credentials (`adminDb.collection('habits')`).
- **Customization Preservation**: The sync engine reconciles system metadata with deterministic IDs (`${userId}_${routine.stableKey}`) while preserving user customizations (time, timing type, preferred period, relative timing, custom frequencies, checklist additions, and metadata).
- **Zero Client UI Exposure**: No personalized schedule modals, buttons, or client sync APIs exist in the web application bundle.

---

## 7. Change Impact Matrix

| Operation | Tool / Location | Deployment Required? | Reversible? | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| Deploy Firestore Rules | `firebase deploy --only firestore:rules` | No (immediate live update) | Yes (redeploy previous file) | Medium (rules impact client queries) |
| Deploy Firestore Indexes | `firebase deploy --only firestore:indexes` | No (cloud builds index) | Yes (delete index) | Low (additive) |
| Update `FIREBASE_SERVICE_ACCOUNT_KEY` | Vercel Dashboard | **Yes (Redeploy required)** | Yes (re-enter previous key) | Low |
| Rotate Service Account Key | GCP Console + Vercel | **Yes (Redeploy required)** | Yes (if old key kept active during rollover) | Low |
| Add Authorized Domain | Firebase Console | No (immediate) | Yes | Low |
| Delete Service Account Key | GCP Console | No | **No (Irreversible)** | High (ensure new key is working first) |

---

## 8. Official Documentation References

- **Firebase Admin SDK Setup**: [https://firebase.google.com/docs/admin/setup](https://firebase.google.com/docs/admin/setup)
- **Firebase Auth Token Verification**: [https://firebase.google.com/docs/auth/admin/verify-id-tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- **Vercel: Using Firebase with Next.js**: [https://vercel.com/guides/how-to-use-firebase-admin-sdk-with-nextjs](https://vercel.com/guides/how-to-use-firebase-admin-sdk-with-nextjs)
- **Vercel Sensitive Environment Variables**: [https://vercel.com/docs/projects/environment-variables/sensitive-environment-variables](https://vercel.com/docs/projects/environment-variables/sensitive-environment-variables)
- **Google Cloud IAM Service Account Best Practices**: [https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys](https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys)
- **Cloud Firestore Security Rules Reference**: [https://firebase.google.com/docs/firestore/security/get-started](https://firebase.google.com/docs/firestore/security/get-started)
