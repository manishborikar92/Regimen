/**
 * Protected Route Handler: Synchronize Personalized Routine Schedule.
 * 
 * Authorization:
 * - Requires Bearer Firebase Auth ID token in Authorization header.
 * - Verified cryptographically via Firebase Admin SDK with revocation checks (checkRevoked: true).
 * - Strictly restricted to verified account: manishborikar92@gmail.com.
 * - All writes execute on server side with strict scoping to the caller's UID.
 * - Headers configured with Cache-Control: private, no-store to prevent caching.
 */

import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/server/firebase-admin';
import { syncPersonalSchedule } from '@/lib/server/sync-service';

export const dynamic = 'force-dynamic';

const AUTHORIZED_EMAIL = 'manishborikar92@gmail.com';

const SECURITY_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function POST(request) {
  const authHeader = request.headers.get('authorization') || '';

  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing or invalid Authorization header.' },
      { status: 401, headers: SECURITY_HEADERS }
    );
  }

  const idToken = authHeader.replace('Bearer ', '').trim();

  if (!idToken) {
    return NextResponse.json(
      { error: 'Unauthorized: Empty token provided.' },
      { status: 401, headers: SECURITY_HEADERS }
    );
  }

  let decodedToken;
  try {
    // verifyIdToken with checkRevoked: true asserts validity, expiration, and user revocation status
    decodedToken = await adminAuth.verifyIdToken(idToken, true);
  } catch (err) {
    console.error('[API /api/schedule/personal] Token verification failed:', err.message);

    if (err.code === 'auth/id-token-revoked') {
      return NextResponse.json(
        { error: 'Unauthorized: Firebase ID token has been revoked. Please sign in again.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    if (err.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { error: 'Unauthorized: Firebase ID token has expired. Please refresh your session.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    if (err.code === 'auth/admin-credentials-missing') {
      return NextResponse.json(
        { error: 'Server configuration error: Firebase Admin credentials not configured.' },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { error: 'Unauthorized: Invalid authentication credentials.' },
      { status: 401, headers: SECURITY_HEADERS }
    );
  }

  // Account-level authorization check: strictly restricted to manishborikar92@gmail.com
  const email = (decodedToken.email || '').toLowerCase();
  const isVerified = decodedToken.email_verified === true;

  if (!isVerified || email !== AUTHORIZED_EMAIL) {
    console.warn(`[API /api/schedule/personal] Forbidden access attempt by ${email} (verified: ${isVerified})`);
    return NextResponse.json(
      { error: 'Forbidden: Personalized schedule data is restricted to authorized accounts.' },
      { status: 403, headers: SECURITY_HEADERS }
    );
  }

  try {
    // Execute privileged, customization-preserving sync scoped strictly to caller UID
    const result = await syncPersonalSchedule(decodedToken.uid);

    return NextResponse.json(
      {
        success: true,
        count: result.syncedCount,
        message: 'Personalized schedule synced successfully.',
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (syncErr) {
    console.error('[API /api/schedule/personal] Synchronization error:', syncErr);
    return NextResponse.json(
      { error: 'Failed to synchronize schedule: ' + syncErr.message },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed. Use POST with Bearer token to sync schedule.' },
    { status: 405, headers: { ...SECURITY_HEADERS, 'Allow': 'POST' } }
  );
}
