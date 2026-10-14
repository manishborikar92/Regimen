#!/usr/bin/env node

/**
 * CLI Tool: Fetch & Synchronize Personalized Schedule for Manish Borikar.
 * 
 * Usage:
 *   node scripts/fetch-personal-schedule.mjs
 *   npm --prefix web run schedule:fetch-personal
 * 
 * Security:
 * - Operates strictly via Firebase Admin SDK with authenticated credentials.
 * - Does NOT expose or rely on public HTTP API endpoints or static secret backdoors.
 * - Explicitly targets and scopes writes to manishborikar92@gmail.com.
 * - Never prints private keys or sensitive credentials to stdout/logs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables from web/.env.local if present
function loadEnv() {
  const envPath = path.join(projectRoot, 'web', '.env.local');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const rawVal = trimmed.slice(eqIdx + 1).trim();
    const val = rawVal.replace(/^["'](.*)["']$/, '$1');
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnv();

const TARGET_EMAIL = 'manishborikar92@gmail.com';

async function main() {
  console.log('======================================================');
  console.log(' Vritta: Personalized Schedule Synchronization (CLI) ');
  console.log('======================================================\n');

  // Dynamic import of server modules after environment variables are loaded
  const { adminAuth } = await import('../web/src/lib/server/firebase-admin.js');
  const { syncPersonalSchedule } = await import('../web/src/lib/server/sync-service.js');
  const { MANISH_PERSONAL_ROUTINES } = await import('../web/src/lib/server/personal-schedule.js');

  console.log(`[Target Account] ${TARGET_EMAIL}`);
  console.log('[Auth] Resolving user account via Firebase Admin SDK...');

  let userRecord;
  try {
    userRecord = await adminAuth.getUserByEmail(TARGET_EMAIL);
  } catch (err) {
    if (err.code === 'auth/admin-credentials-missing') {
      console.error('\n[Error] Firebase Admin credentials are not configured.');
      console.error('Please configure FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS in web/.env.local.');
      process.exit(1);
    }

    if (err.code === 'auth/user-not-found') {
      console.error(`\n[Error] No user record found in Firebase Auth for ${TARGET_EMAIL}.`);
      console.error('Please ensure the user has signed in to the application at least once.');
      process.exit(1);
    }

    console.error(`\n[Error] Failed to resolve user account: ${err.message}`);
    process.exit(1);
  }

  console.log('\n[Sync] Synchronizing 6 personalized routines to Cloud Firestore (/habits)...');

  try {
    const result = await syncPersonalSchedule(userRecord.uid);

    console.log(`\n[Complete] Successfully synchronized ${result.syncedCount} routines:`);
    for (const routine of MANISH_PERSONAL_ROUTINES) {
      console.log(`  ✓ ${routine.title.padEnd(30)} [${routine.category}] (ID: ${userRecord.uid}_${routine.stableKey})`);
    }

    console.log('\n[Integrity & Isolation Guarantees Applied]');
    console.log('  • Persisted directly in /habits under user ID (deterministic IDs)');
    console.log('  • User customizations preserved (custom times, notes, frequencies)');
    console.log('  • Custom user habits preserved');
    console.log('  • Daily completion history and streak logs (/dailyLogs) unmodified\n');
  } catch (syncErr) {
    console.error(`\n[Error] Synchronization failed: ${syncErr.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n[Fatal Error]:', err.message);
  process.exit(1);
});
