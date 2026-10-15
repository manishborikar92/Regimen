# Vritta Web Application Package (`vritta-web`)

This directory contains the Next.js 16 Progressive Web Application for **Vritta**.

For the complete project overview, architecture diagrams, and design tokens, see the [Root README](../README.md) and the [Documentation Suite](../docs/README.md).

---

## Available Package Scripts

Run these scripts from within the `web/` directory:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with hot-reloading on [http://localhost:3000](http://localhost:3000). |
| `npm run build` | Compiles the production build, runs TypeScript checks, and exports static routes. |
| `npm run start` | Serves the compiled production build locally for verification. |
| `npm run lint` | Runs ESLint using the Next.js 16 flat configuration. |
| `npm run test` | Executes all 98 unit and integration tests across 31 suites in `tests/`. |
| `npm run schedule:fetch-personal` | Executes the administrative CLI to synchronize personalized routines to Cloud Firestore. |

---

## Configuration Files

- **`next.config.mjs`:** Next.js application configuration (server external packages).
- **`postcss.config.mjs`:** PostCSS configuration for Tailwind CSS v4.
- **`eslint.config.mjs`:** ESLint flat configuration extending `next/core-web-vitals`.
- **`firestore.rules`:** Cloud Firestore security rules version 2 (owner-scoped access).
- **`firestore.indexes.json`:** Composite index definitions for Firestore collections.
- **`.firebaserc`:** Firebase CLI project alias linking.
- **`.env.local.example`:** Template for local environment variable configuration.

---

## Further Reading

- 💻 [Local Development & Setup Guide](../docs/development.md)
- 🏛️ [Architecture & System Design](../docs/architecture.md)
- 🔥 [Firebase Setup & Operations Runbook](../docs/firebase-setup.md)
- 🚀 [Deployment & Release Guide](../docs/deployment.md)
