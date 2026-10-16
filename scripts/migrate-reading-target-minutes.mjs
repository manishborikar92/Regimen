#!/usr/bin/env node

/**
 * CLI Tool: Scoped Migration to Normalize Reading Duration (`targetMinutes`)
 *
 * Canonical Data Contract:
 * - `habit.targetMinutes` (root level integer) is the single canonical writable field.
 * - `metadata.targetMinutes` is deleted; all other metadata (e.g. `context`) is strictly preserved.
 * - Missing or invalid durations resolve to safe default (30 minutes).
 *
 * Safety & Safeguards:
 * - Runs in DRY-RUN mode by default.
 * - Requires explicit `--apply` flag to execute writes.
 * - Automatically saves a pre-migration JSON backup of every affected document before applying mutations.
 * - Operates idempotently; running multiple times produces zero further modifications.
 *
 * Usage:
 *   node scripts/migrate-reading-target-minutes.mjs             # Dry-run inspection
 *   node scripts/migrate-reading-target-minutes.mjs --apply     # Execute with backup
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

const isApply = process.argv.includes('--apply');
const defaultBackupDir = 'C:/Users/manis/.gemini/antigravity/brain/fdaf825c-19de-4151-b155-be79abec2c5e/scratch/backups';

async function main() {
  console.log('===============================================================');
  console.log(' Vritta: Scoped Reading Duration (targetMinutes) Migration    ');
  console.log(` Mode: ${isApply ? 'APPLY (Mutations Enabled)' : 'DRY-RUN (Read-Only Inspection)'}`);
  console.log('===============================================================\n');

  const { createRequire } = await import('node:module');
  const require = createRequire(path.join(projectRoot, 'web', 'package.json'));
  const { FieldValue } = require('firebase-admin/firestore');
  const { adminDb } = await import('../web/src/lib/server/firebase-admin.js');

  console.log('[1/4] Querying Firestore habits collection...');
  const snapshot = await adminDb.collection('habits').get();
  console.log(`Found ${snapshot.size} total habit documents in Firestore.`);

  const affectedDocs = [];
  const unchangedDocs = [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const isReading =
      data.stableKey === 'canonical_read_books' ||
      data.completionMethod === 'reading_duration' ||
      data.category === 'Reading' ||
      data.title?.toLowerCase().includes('read');

    if (!isReading) return;

    const currentRoot = data.targetMinutes;
    const currentNested = data.metadata?.targetMinutes;

    // Resolve canonical value: existing valid root -> valid legacy nested -> 30 default
    let canonicalMinutes = 30;
    if (typeof currentRoot === 'number' && Number.isFinite(currentRoot) && currentRoot > 0) {
      canonicalMinutes = Math.round(currentRoot);
    } else if (typeof currentNested === 'number' && Number.isFinite(currentNested) && currentNested > 0) {
      canonicalMinutes = Math.round(currentNested);
    }

    const needsRootUpdate = currentRoot !== canonicalMinutes;
    const needsNestedCleanup = currentNested !== undefined;

    const docSummary = {
      docId: docSnap.id,
      userId: data.userId,
      title: data.title,
      stableKey: data.stableKey || null,
      completionMethod: data.completionMethod,
      current: {
        targetMinutes: currentRoot !== undefined ? currentRoot : null,
        metadata: data.metadata || null,
      },
      proposed: {
        targetMinutes: canonicalMinutes,
        unrelatedMetadata: data.metadata
          ? Object.fromEntries(Object.entries(data.metadata).filter(([k]) => k !== 'targetMinutes'))
          : {},
      },
      rawData: data,
      needsMigration: needsRootUpdate || needsNestedCleanup,
    };

    if (needsRootUpdate || needsNestedCleanup) {
      affectedDocs.push(docSummary);
    } else {
      unchangedDocs.push(docSummary);
    }
  });

  console.log(`\n[2/4] Audit & Scope Inspection:`);
  console.log(`- Reading habits inspected: ${affectedDocs.length + unchangedDocs.length}`);
  console.log(`- Already canonical (no change needed): ${unchangedDocs.length}`);
  console.log(`- Needing migration: ${affectedDocs.length}\n`);

  if (affectedDocs.length === 0) {
    console.log('All reading documents are already in canonical state! No migration needed.');
    return;
  }

  console.log('--- PROPOSED MUTATION PLAN ---');
  affectedDocs.forEach((item, idx) => {
    console.log(`\n[Document ${idx + 1}/${affectedDocs.length}]: ${item.docId}`);
    console.log(`  Title:            "${item.title}"`);
    console.log(`  Stable Key:       ${item.stableKey || 'none'}`);
    console.log(`  User ID:          ${item.userId}`);
    console.log(`  Current Root:     ${JSON.stringify(item.current.targetMinutes)}`);
    console.log(`  Current Metadata: ${JSON.stringify(item.current.metadata)}`);
    console.log(`  --> Proposed Root targetMinutes: ${item.proposed.targetMinutes}`);
    console.log(`  --> Preserved Metadata:          ${JSON.stringify(item.proposed.unrelatedMetadata)}`);
  });
  console.log('------------------------------\n');

  if (!isApply) {
    console.log('[DRY-RUN COMPLETE] Zero changes were written to Firestore.');
    console.log('To apply these changes and save a pre-migration backup, run:');
    console.log('  node scripts/migrate-reading-target-minutes.mjs --apply\n');
    return;
  }

  // APPLY MODE: 1. Save local backup
  console.log('[3/4] Creating pre-migration local backup...');
  if (!fs.existsSync(defaultBackupDir)) {
    fs.mkdirSync(defaultBackupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(defaultBackupDir, `backup-reading-habits-${timestamp}.json`);

  const backupData = {
    createdAt: new Date().toISOString(),
    affectedCount: affectedDocs.length,
    documents: affectedDocs.map(d => ({
      docId: d.docId,
      data: d.rawData,
    })),
  };

  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`Pre-migration backup safely written to: ${backupFilePath}`);

  // APPLY MODE: 2. Execute updates atomically per document
  console.log('\n[4/4] Applying canonical migrations...');
  for (const item of affectedDocs) {
    const docRef = adminDb.collection('habits').doc(item.docId);

    const updateFields = {
      targetMinutes: item.proposed.targetMinutes,
      updatedAt: new Date().toISOString(),
    };

    // If metadata contains targetMinutes, delete only that nested key
    if (item.current.metadata && item.current.metadata.targetMinutes !== undefined) {
      updateFields['metadata.targetMinutes'] = FieldValue.delete();
    }

    await docRef.update(updateFields);
    console.log(`✔ Successfully migrated ${item.docId}`);
  }

  console.log('\n[VERIFICATION] Re-reading updated documents from Firestore...');
  for (const item of affectedDocs) {
    const verifiedSnap = await adminDb.collection('habits').doc(item.docId).get();
    const verifiedData = verifiedSnap.data();

    console.log(`Document: ${item.docId}`);
    console.log(`  targetMinutes:          ${verifiedData.targetMinutes} (Expected: ${item.proposed.targetMinutes})`);
    console.log(`  metadata.targetMinutes: ${verifiedData.metadata?.targetMinutes} (Expected: undefined)`);
    console.log(`  unrelated metadata:     ${JSON.stringify(verifiedData.metadata || {})}`);

    if (
      verifiedData.targetMinutes !== item.proposed.targetMinutes ||
      verifiedData.metadata?.targetMinutes !== undefined
    ) {
      throw new Error(`Verification failed for document ${item.docId}`);
    }
  }

  console.log('\n===============================================================');
  console.log(' All reading documents successfully normalized to canonical schema! ');
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('\n[FATAL] Migration failed:', err);
  process.exit(1);
});
