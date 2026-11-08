import 'server-only';
import crypto from 'crypto';
import { headers } from 'next/headers';
import { firestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Lightweight Firestore-backed limiter for public server actions.
 * The caller's IP is obtained from the hosting proxy headers, never from client input.
 */
export async function enforceServerActionRateLimit(
  scope: string,
  maxRequests: number,
  windowMs: number,
): Promise<void> {
  const requestHeaders = headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0].trim() ||
    requestHeaders.get('x-real-ip') ||
    'unknown';

  const digest = crypto.createHash('sha256').update(scope + ':' + ip).digest('hex').slice(0, 48);
  const ref = firestore.collection('securityRateLimits').doc('action_' + digest);
  const now = Date.now();

  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.exists ? snapshot.data()! : {};
    const start = Number(data.windowStartMs || 0);
    const count = Number(data.count || 0);
    const expired = !start || now - start >= windowMs;

    if (!expired && count >= maxRequests) {
      throw new Error('RATE_LIMITED');
    }

    transaction.set(ref, {
      windowStartMs: expired ? now : start,
      count: expired ? 1 : count + 1,
      updatedAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(now + Math.max(windowMs * 2, 60 * 60 * 1000)),
    });
  });
}
