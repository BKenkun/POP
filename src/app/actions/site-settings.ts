'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  auth,
  projectId,
  areAdminCredentialsAvailable,
  isAdminCredentialError,
  runWithAdminFirestore,
} from '@/lib/firebase-admin';
import { isAdminEmail } from '@/lib/admin';

export interface SiteSettings {
  underConstruction: boolean;
  showSubscriptionFeature: boolean;
  showCountdown: boolean;
  launchDate: string | null;
}

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  underConstruction: false,
  showSubscriptionFeature: true,
  showCountdown: false,
  launchDate: null,
};

const CACHE_TTL_MS = 60 * 1000;
let cachedSiteSettings: SiteSettings | null = null;
let cachedAt = 0;

function normalizeSiteSettings(data?: Partial<SiteSettings> | null): SiteSettings {
  return {
    underConstruction: Boolean(data?.underConstruction ?? DEFAULT_SITE_SETTINGS.underConstruction),
    showSubscriptionFeature: Boolean(
      data?.showSubscriptionFeature ?? DEFAULT_SITE_SETTINGS.showSubscriptionFeature
    ),
    showCountdown: Boolean(data?.showCountdown ?? DEFAULT_SITE_SETTINGS.showCountdown),
    launchDate: typeof data?.launchDate === 'string' ? data.launchDate : null,
  };
}

async function verifyAdminCaller(idToken?: string): Promise<{ email: string; bearerToken?: string }> {
  if (idToken) {
    const decoded = await auth.verifyIdToken(idToken);
    if (!isAdminEmail(decoded.email)) {
      throw new Error('No tienes permisos de administrador.');
    }
    return { email: decoded.email!.trim().toLowerCase(), bearerToken: idToken };
  }

  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  if (sessionCookie) {
    const decoded = await auth.verifySessionCookie(sessionCookie);
    if (!isAdminEmail(decoded.email)) {
      throw new Error('No tienes permisos de administrador.');
    }
    return { email: decoded.email!.trim().toLowerCase() };
  }

  const fallbackToken = cookieStore.get('session_id_token')?.value;
  if (fallbackToken) {
    const decoded = await auth.verifyIdToken(fallbackToken);
    if (!isAdminEmail(decoded.email)) {
      throw new Error('No tienes permisos de administrador.');
    }
    return { email: decoded.email!.trim().toLowerCase(), bearerToken: fallbackToken };
  }

  throw new Error('Autenticación de administrador requerida.');
}

async function writeSiteSettingsViaRest(
  settings: SiteSettings,
  adminEmail: string,
  bearerToken: string
): Promise<boolean> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      projectId
    )}/databases/(default)/documents/appSettings/site`;

    const fields: Record<string, unknown> = {
      underConstruction: { booleanValue: settings.underConstruction },
      showSubscriptionFeature: { booleanValue: settings.showSubscriptionFeature },
      showCountdown: { booleanValue: settings.showCountdown },
      launchDate: settings.launchDate
        ? { stringValue: settings.launchDate }
        : { nullValue: null },
      updatedAt: { timestampValue: new Date().toISOString() },
      updatedBy: { stringValue: adminEmail },
    };

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
      cache: 'no-store',
    });

    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Lee la configuración global del sitio desde Firestore (`appSettings/site`)
 * con caché en memoria y respaldo seguro sin lanzar errores si las credenciales
 * de servicio aún no están activas en vista previa.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (cachedSiteSettings && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedSiteSettings;
  }

  if (!areAdminCredentialsAvailable()) {
    return cachedSiteSettings ?? DEFAULT_SITE_SETTINGS;
  }

  try {
    const docSnap = await runWithAdminFirestore(
      (db) => db.collection('appSettings').doc('site').get(),
      'site-settings'
    );
    const resolved = docSnap.exists
      ? normalizeSiteSettings(docSnap.data() as Partial<SiteSettings>)
      : DEFAULT_SITE_SETTINGS;

    cachedSiteSettings = resolved;
    cachedAt = Date.now();
    return resolved;
  } catch (error) {
    if (!isAdminCredentialError(error)) {
      const msg = error instanceof Error ? error.message : String(error);
      console.info(`[site-settings] Using default site settings (${msg})`);
    }
    return cachedSiteSettings ?? DEFAULT_SITE_SETTINGS;
  }
}

/**
 * Guarda la configuración global del sitio verificando rol de administrador.
 */
export async function updateSiteSettings(
  newSettings: SiteSettings,
  idToken?: string
): Promise<void> {
  const { email: adminEmail, bearerToken } = await verifyAdminCaller(idToken);
  const sanitized = normalizeSiteSettings(newSettings);

  cachedSiteSettings = sanitized;
  cachedAt = Date.now();

  let persisted = false;

  if (areAdminCredentialsAvailable()) {
    try {
      await runWithAdminFirestore(
        (db) =>
          db
            .collection('appSettings')
            .doc('site')
            .set(
              {
                ...sanitized,
                updatedAt: new Date(),
                updatedBy: adminEmail,
              },
              { merge: true }
            ),
        'site-settings write'
      );
      persisted = true;
    } catch (error) {
      if (!isAdminCredentialError(error)) {
        const msg = error instanceof Error ? error.message : String(error);
        console.info(`[site-settings] Admin SDK write failed (${msg})`);
      }
    }
  }

  if (!persisted && bearerToken) {
    await writeSiteSettingsViaRest(sanitized, adminEmail, bearerToken);
  }

  revalidatePath('/', 'layout');
}
