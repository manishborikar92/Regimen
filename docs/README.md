# Vritta Documentation Index

Welcome to the documentation for **Vritta** (वृत्त), a modern, mobile-first Progressive Web Application designed for mindful daily routine tracking, physical conditioning, language learning, and reflection.

This documentation is organized according to the **Diátaxis** framework, separating concepts, tasks, references, and planning into clear, maintainable guides.

---

## Documentation Map

```
docs/
├── README.md           # Documentation index & navigation (You are here)
├── architecture.md     # System design, data flow, theme engine & security
├── development.md      # Local workstation setup, scripts & testing guide
├── firebase-setup.md   # Cloud Firestore rules, Admin SDK & credential runbook
├── deployment.md       # Vercel hosting, branch workflow & release verification
└── roadmap.md          # Outstanding project actions & execution procedures
```

---

## Maintained Guides & Runbooks

### 1. [Architecture & System Design](architecture.md)
*Understanding & Explanation*
- High-level system architecture and client-cloud boundary.
- Modular directory structure and package responsibilities.
- Authoritative brand identity (The Guiding Sutra mark, Deep Obsidian, Luminous Teal, Warm Amber).
- Two-state theme engine (Light/Dark, zero-flash pre-paint script, Level AAA touch targets).
- Routine architecture and schedule isolation (foundation routines vs. quarantined personal routines).
- Cloud Firestore collection schemas and owner-scoped security rules.

### 2. [Local Development Guide](development.md)
*How-To & Developer Reference*
- Prerequisites (Node.js 20+, npm, Git).
- Step-by-step local setup from a fresh clone.
- Complete environment variables reference table (client and server scopes).
- Package scripts reference (`dev`, `build`, `start`, `lint`, `test`, `schedule:fetch-personal`).
- Automated testing architecture (98 unit and integration tests across 31 suites in `web/tests/`).
- Pre-commit quality gates and troubleshooting common development issues.

### 3. [Firebase Setup & Operations Runbook](firebase-setup.md)
*How-To & Operations Runbook*
- Dual architecture: Client Web SDK (auth, rules-governed reads) vs. Admin SDK (server CLI synchronization).
- Credential security and external local file storage (`~/.credentials/`).
- Setting up Vercel Sensitive Environment Variables (`FIREBASE_SERVICE_ACCOUNT_KEY`).
- Deploying Cloud Firestore security rules (`web/firestore.rules`) and composite indexes (`web/firestore.indexes.json`).
- Zero-downtime service account key rotation procedure.

### 4. [Deployment & Release Guide](deployment.md)
*Operations & Workflow Guide*
- Vercel production hosting architecture (`myvritta.vercel.app`, project `vritta`).
- Environment variable configuration in Vercel.
- Git branching and release workflow (`m/dev` development branch -> PR / merge to `main` -> automated Vercel build).
- Pre-release local verification checklist.
- Post-deployment verification checklist and instant rollback protocol.

### 5. [Project Roadmap & Outstanding Actions](roadmap.md)
*Planning & Reference*
- Verified milestone completion summary (Phases 1–7, 11, and 12 complete).
- Outstanding Action 1: Phase 13 production release execution procedure.
- Outstanding Action 2: Phase 8 local workspace directory rename procedure (`Regimen` -> `Vritta`).
