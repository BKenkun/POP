import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { firebaseConfig } from './firebase-config';

export const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  firebaseConfig.projectId ||
  'purorush';

const ADMIN_AUTH_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
let adminCredentialsDisabledUntil = 0;
let hasLoggedCredentialNotice = false;
let hasExplicitCredential = false;
let preferAdcFallback = false;

/**
 * Detects gRPC / OAuth2 authentication failures caused by missing ADC or a
 * revoked/expired service account key (e.g. code 16 UNAUTHENTICATED / invalid_grant).
 */
export function isAdminCredentialError(error: unknown): boolean {
  if (!error) return false;
  const err = error as { code?: unknown; message?: unknown; details?: unknown };
  if (
    err.code === 16 ||
    err.code === '16' ||
    err.code === 7 ||
    err.code === '7' ||
    err.code === 'app/invalid-credential'
  ) {
    return true;
  }
  const msg = String(err.message || err.details || error);
  return (
    msg.includes('UNAUTHENTICATED') ||
    msg.includes('PERMISSION_DENIED') ||
    msg.includes('Missing or insufficient permissions') ||
    msg.includes('invalid authentication credentials') ||
    msg.includes('invalid_grant') ||
    msg.includes('Invalid JWT Signature') ||
    msg.includes('Could not load the default credentials')
  );
}

export function areAdminCredentialsAvailable(): boolean {
  return Date.now() >= adminCredentialsDisabledUntil;
}

export function markAdminCredentialsUnavailable(context?: string): void {
  adminCredentialsDisabledUntil = Date.now() + ADMIN_AUTH_COOLDOWN_MS;
  if (!hasLoggedCredentialNotice) {
    hasLoggedCredentialNotice = true;
    console.info(
      `[firebase-admin] Service account credentials unavailable or revoked${
        context ? ` (${context})` : ''
      }; using safe fallbacks.`
    );
  }
}

function initAdminApp(): App {
  if (getApps().length > 0) {
    const existingDefault = getApps().find((a) => a.name === '[DEFAULT]');
    if (existingDefault) return existingDefault;
  }

  // 1. Try FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_KEY from .env.local / env
  const saKey =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (saKey && saKey.trim().length > 0) {
    try {
      const sa = JSON.parse(saKey);
      if (typeof sa.private_key === 'string') {
        sa.private_key = sa.private_key.replace(/\\n/g, '\n');
      }
      hasExplicitCredential = true;
      return initializeApp({
        credential: cert(sa),
        projectId: sa.project_id || projectId,
      });
    } catch {
      console.info('[firebase-admin] Could not parse FIREBASE_SERVICE_ACCOUNT_JSON; falling back to default credentials.');
    }
  }

  // 2. Try individual service account env vars
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      hasExplicitCredential = true;
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        projectId,
      });
    } catch {
      console.info('[firebase-admin] Could not initialize from FIREBASE_CLIENT_EMAIL/PRIVATE_KEY; falling back to default credentials.');
    }
  }

  // 3. Fallback to Application Default Credentials (e.g. Firebase App Hosting / Cloud Run)
  hasExplicitCredential = false;
  return initializeApp({
    projectId,
  });
}

function initFirestoreForApp(targetApp: App): Firestore {
  const db = getFirestore(targetApp);
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // Settings already initialized
  }
  return db;
}

function getAdcFallbackApp(): App {
  const existing = getApps().find((a) => a.name === 'adc-fallback');
  if (existing) return existing;
  return initializeApp({ projectId }, 'adc-fallback');
}

const app: App = initAdminApp();
const firestore: Firestore = initFirestoreForApp(app);
const auth: Auth = getAuth(app);
const adminDb = firestore;
const adminAuth = auth;

/**
 * Executes a Firestore Admin operation. If an explicit service account key is revoked or
 * invalid, automatically retries using Application Default Credentials (App Hosting / Cloud Run).
 */
export async function runWithAdminFirestore<T>(
  operation: (db: Firestore) => Promise<T>,
  context?: string
): Promise<T> {
  if (preferAdcFallback) {
    const adcDb = initFirestoreForApp(getAdcFallbackApp());
    try {
      return await operation(adcDb);
    } catch (adcError) {
      if (isAdminCredentialError(adcError)) {
        markAdminCredentialsUnavailable(context);
      }
      throw adcError;
    }
  }

  try {
    return await operation(firestore);
  } catch (error) {
    if (hasExplicitCredential && isAdminCredentialError(error)) {
      const adcDb = initFirestoreForApp(getAdcFallbackApp());
      try {
        const result = await operation(adcDb);
        preferAdcFallback = true;
        console.info('[firebase-admin] Switched to Application Default Credentials fallback.');
        return result;
      } catch (adcError) {
        if (isAdminCredentialError(adcError)) {
          markAdminCredentialsUnavailable(context);
        }
        throw adcError;
      }
    }
    if (isAdminCredentialError(error)) {
      markAdminCredentialsUnavailable(context);
    }
    throw error;
  }
}

/**
 * Executes an Auth Admin operation with the same ADC fallback protection.
 */
export async function runWithAdminAuth<T>(
  operation: (a: Auth) => Promise<T>,
  context?: string
): Promise<T> {
  if (preferAdcFallback) {
    const adcAuth = getAuth(getAdcFallbackApp());
    try {
      return await operation(adcAuth);
    } catch (adcError) {
      if (isAdminCredentialError(adcError)) {
        markAdminCredentialsUnavailable(context);
      }
      throw adcError;
    }
  }

  try {
    return await operation(auth);
  } catch (error) {
    if (hasExplicitCredential && isAdminCredentialError(error)) {
      const adcAuth = getAuth(getAdcFallbackApp());
      try {
        const result = await operation(adcAuth);
        preferAdcFallback = true;
        return result;
      } catch (adcError) {
        if (isAdminCredentialError(adcError)) {
          markAdminCredentialsUnavailable(context);
        }
        throw adcError;
      }
    }
    if (isAdminCredentialError(error)) {
      markAdminCredentialsUnavailable(context);
    }
    throw error;
  }
}

/**
 * Converts a plain JS value to Firestore REST API Value format.
 */
export function toFirestoreRestValue(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === 'string') return { stringValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((item) => toFirestoreRestValue(item)),
      },
    };
  }
  if (typeof value === 'object') {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        fields[k] = toFirestoreRestValue(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

export function fromFirestoreRestValue(val: Record<string, any> | undefined): unknown {
  if (!val) return undefined;
  if ('nullValue' in val) return null;
  if ('booleanValue' in val) return Boolean(val.booleanValue);
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('stringValue' in val) return String(val.stringValue);
  if ('timestampValue' in val) return String(val.timestampValue);
  if ('arrayValue' in val) {
    const arr = val.arrayValue?.values || [];
    return arr.map((item: Record<string, any>) => fromFirestoreRestValue(item));
  }
  if ('mapValue' in val) {
    const out: Record<string, unknown> = {};
    const fields = val.mapValue?.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = fromFirestoreRestValue(v as Record<string, any>);
    }
    return out;
  }
  return undefined;
}

export function getActiveFirestore(): Firestore {
  return preferAdcFallback ? initFirestoreForApp(getAdcFallbackApp()) : firestore;
}

export { app, firestore, auth, adminDb, adminAuth };
export default app;
