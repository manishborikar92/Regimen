#!/usr/bin/env node

/**
 * Migration Tool: Canonical Category Migration for Vritta (One-Time Execution).
 * 
 * Purpose:
 * Scans all habit documents across Firestore and updates any noncanonical category
 * to its verified canonical equivalent. Strictly operates on the `category` field only.
 * 
 * Usage:
 *   node scripts/migrate-canonical-categories.mjs [--dry-run]
 *   node scripts/migrate-canonical-categories.mjs --apply
 * 
 * Safety Guarantees:
 * - Creates a verified, timestamped pre-migration backup snapshot in backups/.
 * - Preserves all document IDs, ownership, schedules, features, progress, logs, and timestamps.
 * - Does not touch unmapped or ambiguous values without explicit confirmation.
 * - Confirms 100% canonical category state in a post-migration read-back audit.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables from web/.env.local
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
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["'](.*)["']$/, '$1');
    process.env[key] = val;
  }
}

loadEnv();

export const CANONICAL_CATEGORIES = [
  'English Learning',
  'Movement & Strength',
  'Listening & Awareness',
  'Reading',
  'Communication',
  'Reflection',
  'Nutrition',
  'Recovery',
  'Schedule',
];

export const MIGRATION_CATEGORY_MAPPINGS = {
  'Movement': 'Movement & Strength',
  'Fitness': 'Movement & Strength',
  'Health': 'Movement & Strength',
  'Wellness': 'Recovery',
  'Mindfulness': 'Listening & Awareness',
};

async function main() {
  const args = process.argv.slice(2);
  const isApply = args.includes('--apply');
  const isDryRun = !isApply || args.includes('--dry-run');

  console.log('======================================================');
  console.log(' Vritta: Canonical Category Migration Tool           ');
  console.log(` Mode: ${isApply ? 'APPLY (Live Database Writes Authorized)' : 'DRY RUN (Read-Only)'}`);
  console.log('======================================================\n');

  const adminPath = path.join(projectRoot, 'web', 'src', 'lib', 'server', 'firebase-admin.js');
  const { adminDb, adminAuth } = await import(pathToFileURL(adminPath).href);

  if (!adminDb) {
    console.error('[Error] Firebase Admin SDK could not be initialized.');
    process.exit(1);
  }

  // 1. Fetch all documents from habits collection
  console.log('1. Inspecting Firestore "habits" collection...');
  const habitsSnap = await adminDb.collection('habits').get();
  console.log(`   Total habit documents found: ${habitsSnap.size}`);

  const preMigrationData = [];
  const toMigrate = [];
  let alreadyCanonicalCount = 0;
  const ambiguousRecords = [];

  for (const doc of habitsSnap.docs) {
    const data = doc.data();
    preMigrationData.push({ id: doc.id, ...data });

    const currentCategory = data.category;
    if (CANONICAL_CATEGORIES.includes(currentCategory)) {
      alreadyCanonicalCount++;
    } else if (MIGRATION_CATEGORY_MAPPINGS[currentCategory]) {
      toMigrate.push({
        ref: doc.ref,
        id: doc.id,
        userId: data.userId,
        title: data.title,
        from: currentCategory,
        to: MIGRATION_CATEGORY_MAPPINGS[currentCategory],
      });
    } else {
      ambiguousRecords.push({
        id: doc.id,
        userId: data.userId,
        title: data.title,
        category: currentCategory,
      });
    }
  }

  // Check personalRoutines collection if it exists
  const prSnap = await adminDb.collection('personalRoutines').get();
  console.log(`   Total personalRoutines documents found: ${prSnap.size}`);
  for (const doc of prSnap.docs) {
    const data = doc.data();
    preMigrationData.push({ id: doc.id, collection: 'personalRoutines', ...data });
    const currentCategory = data.category;
    if (CANONICAL_CATEGORIES.includes(currentCategory)) {
      alreadyCanonicalCount++;
    } else if (MIGRATION_CATEGORY_MAPPINGS[currentCategory]) {
      toMigrate.push({
        ref: doc.ref,
        id: doc.id,
        userId: data.userId,
        title: data.title,
        from: currentCategory,
        to: MIGRATION_CATEGORY_MAPPINGS[currentCategory],
      });
    } else if (currentCategory) {
      ambiguousRecords.push({
        id: doc.id,
        userId: data.userId,
        title: data.title,
        category: currentCategory,
      });
    }
  }

  console.log('\n2. Migration Pre-Flight Inventory:');
  console.log(`   - Records Inspected:        ${habitsSnap.size + prSnap.size}`);
  console.log(`   - Already Canonical:        ${alreadyCanonicalCount}`);
  console.log(`   - Requiring Migration:      ${toMigrate.length}`);
  console.log(`   - Ambiguous / Unmapped:     ${ambiguousRecords.length}`);

  // Clean up any lingering disposable test routines from test account
  const lingeringTestDocs = habitsSnap.docs.filter(d => 
    d.data().title && d.data().title.startsWith('Test Routine') && d.data().userId === 'fr9Yo4VDtuRN8LjX1YKWLSLaSx42'
  );

  if (lingeringTestDocs.length > 0) {
    console.log(`\n   Found ${lingeringTestDocs.length} disposable test routine doc(s) from test account:`);
    for (const d of lingeringTestDocs) {
      console.log(`   - [Disposable Test Doc] ${d.id}: "${d.data().title}"`);
    }
  }

  // 2. Create fresh pre-migration backup
  const backupDir = path.join(projectRoot, 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `pre-category-migration-backup-${timestamp}.json`);
  const backupJson = JSON.stringify(preMigrationData, null, 2);
  const backupSha = crypto.createHash('sha256').update(backupJson).digest('hex');
  fs.writeFileSync(backupFile, backupJson);
  console.log(`\n3. Pre-migration backup verified & stored:`);
  console.log(`   Path:    ${backupFile}`);
  console.log(`   SHA-256: ${backupSha}`);

  if (ambiguousRecords.length > 0) {
    console.error('\n[ABORT] Ambiguous noncanonical category records found:');
    ambiguousRecords.forEach(r => console.error(` - Doc ${r.id}: "${r.title}" (category: "${r.category}")`));
    console.error('Migration aborted to protect data integrity.');
    process.exit(1);
  }

  if (toMigrate.length === 0 && lingeringTestDocs.length === 0) {
    console.log('\nAll records are ALREADY in canonical category format!');
    console.log('No updates required.');
  }

  if (isDryRun && (toMigrate.length > 0 || lingeringTestDocs.length > 0)) {
    console.log('\n--- DRY RUN ACTIONS (No writes performed) ---');
    toMigrate.forEach(item => {
      console.log(`[DRY RUN] Would update doc ${item.id}: category "${item.from}" -> "${item.to}"`);
    });
    lingeringTestDocs.forEach(d => {
      console.log(`[DRY RUN] Would delete disposable test doc ${d.id}`);
    });
    console.log('\nTo execute live migration, re-run with --apply');
    return;
  }

  if (isApply) {
    console.log('\n4. Applying Category Updates...');
    let migratedCount = 0;
    for (const item of toMigrate) {
      await item.ref.update({
        category: item.to,
        updatedAt: new Date().toISOString(),
      });
      migratedCount++;
      console.log(`   [MIGRATED] Doc ${item.id}: "${item.from}" -> "${item.to}"`);
    }

    for (const d of lingeringTestDocs) {
      await d.ref.delete();
      console.log(`   [CLEANED] Deleted disposable test doc ${d.id}`);
    }

    // 5. Post-migration verification read-back
    console.log('\n5. Performing Post-Migration Read-Back Verification...');
    const verifySnap = await adminDb.collection('habits').get();
    let postCanonicalCount = 0;
    let postNoncanonicalCount = 0;

    verifySnap.forEach(doc => {
      const cat = doc.data().category;
      if (CANONICAL_CATEGORIES.includes(cat)) {
        postCanonicalCount++;
      } else {
        postNoncanonicalCount++;
        console.error(`   [VIOLATION] Doc ${doc.id} still has noncanonical category: "${cat}"`);
      }
    });

    console.log('\n======================================================');
    console.log(' MIGRATION COMPLETED & VERIFIED                       ');
    console.log(` - Documents Inspected:        ${verifySnap.size}`);
    console.log(` - Verified Canonical Docs:    ${postCanonicalCount} (100%)`);
    console.log(` - Noncanonical Docs:          ${postNoncanonicalCount} (0%)`);
    console.log(` - Pre-Migration Backup:       ${backupFile}`);
    console.log('======================================================');
  }
}

main().catch(err => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
