# Vritta Project Roadmap & Outstanding Actions

**Document Role:** Project Planning & Reference (Diátaxis)  
**Current Milestone:** Phase 11 & 12 Complete; Phase 13 Preflight Audit Complete  
**Scope:** Genuinely Outstanding Actions & Sequencing  

---

## 1. Current Project Status

All core development, branding redesign, mobile component polish, theme toggle simplification, and security boundary implementations have been completed, verified, and committed locally to `dev`.

| Milestone / Phase | Status | Verification Summary |
| :--- | :---: | :--- |
| **Phase 1–5: Core UI, Theme & Architecture** | **COMPLETED** | Verified via 98 automated unit tests and multi-viewport CDP browser testing. |
| **Phase 6: Firebase Project Setup** | **COMPLETED** | Connected to live `vritta-app` project; rules, indexes, and user accounts verified. |
| **Phase 11: Brand Renaming to Vritta** | **COMPLETED** | Repository-wide brand audit completed; 0 active references to legacy name in code. |
| **Phase 12: Two-State Theme Toggle** | **COMPLETED** | Icon-only Light/Dark toggle (`ThemeToggle`), zero `matchMedia`, Level AAA touch target. |
| **Phase 13: Preflight Audit & Verification** | **COMPLETED** | Git state, quality checks, test evidence visual inspection, and Vercel parity audited. |
| **Phase 13: Production Release Execution** | **PENDING** | Awaiting user authorization to merge `dev` into `main` and deploy to Vercel. |
| **Phase 8: Local Workspace Directory Rename** | **DEFERRED** | Preserved as the final operational step to prevent open-file handle locks. |

---

## 2. Outstanding Action 1: Phase 13 Production Release Execution

**Objective:** Synchronize the remote GitHub repository and live Vercel production deployment (`myvritta.vercel.app`) with the verified local codebase on `dev`.

### Prerequisites & Approvals
- Quality gates verified: 98 unit tests passing, clean ESLint, Next.js webpack production build succeeded.
- Explicit user review and authorization received.

### Execution Steps
1. Push local development commits to GitHub:
   ```bash
   git push origin dev
   ```
2. Open a Pull Request from `dev` into `main` on GitHub.
3. Review and merge the Pull Request into `main`.
4. Monitor the Vercel production build for project **vritta**.
5. Execute the post-deployment verification checklist (verify HTTP 200, canonical page title, single manifest tag, and live theme toggle behavior at `https://myvritta.vercel.app`).

---

## 3. Outstanding Action 2: Phase 8 Local Workspace Directory Rename

**Objective:** Rename the local project directory from `Regimen` to `Vritta` (`c:\Users\manis\Projects\Regimen` -> `c:\Users\manis\Projects\Vritta`) to achieve complete brand alignment across all local paths.

> [!IMPORTANT]
> This operation is intentionally deferred as the **final action** after all code changes and deployments are complete. Renaming an active workspace directory while editors or terminal sessions hold open file locks can cause file descriptor corruption.

### Prerequisites
- All Git commits pushed to remote repository.
- Local working tree clean with zero uncommitted changes.
- All running terminal processes, dev servers, and test runners stopped.

### Step-by-Step Procedure
1. Close all open editor windows (VS Code / IDE) and terminal shells targeting `c:\Users\manis\Projects\Regimen`.
2. Open a clean PowerShell window outside the project directory (e.g., at `C:\Users\manis\Projects`).
3. Execute the directory rename command:
   ```powershell
   Rename-Item -Path "C:\Users\manis\Projects\Regimen" -NewName "Vritta"
   ```
4. Navigate into the renamed directory:
   ```powershell
   cd C:\Users\manis\Projects\Vritta
   ```
5. Verify Git status and remote tracking:
   ```powershell
   git status
   git remote -v
   ```
6. Re-run local verification commands to confirm operational integrity at the new path:
   ```powershell
   npm --prefix web run test
   npm --prefix web run build
   ```
7. Reopen IDE workspace pointing to `C:\Users\manis\Projects\Vritta`.
