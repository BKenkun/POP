'use server';

// Modificado por: Webmaster Freddy Poleo
import { cookies } from 'next/headers';
import legacySiteSettings from '@/lib/site-settings.json';
import { auth, firestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface SiteSettings {
  underConstruction: boolean;
  showSubscriptionFeature: boolean;
  showCountdown: boolean;
  launchDate: string | null;
}

const ADMIN_EMAILS = new Set(['maryandpopper@gmail.com', 'enriqueespincosme@gmail.com']);
const SETTINGS_REF = firestore.collection('appSettings').doc('site');

async function requireAdmin(): Promise<string> {
  const session = cookies().get('session')?.value;
  if (!session) throw new Error('Inicia sesión como administrador para cambiar la configuración.');
  const decoded = await auth.verifySessionCookie(session, true);
  const email = String(decoded.email || '').trim().toLowerCase();
  if (!ADMIN_EMAILS.has(email)) throw new Error('No tienes permisos para modificar la configuración del sitio.');
  return email;
}

function normalizeSettings(input: Partial<SiteSettings> | null | undefined): SiteSettings {
  const source = input || {};
  return {
    underConstruction: source.underConstruction === true,
    showSubscriptionFeature: source.showSubscriptionFeature !== false,
    showCountdown: source.showCountdown === true,
    launchDate: (() => {
      if (source.launchDate === null || source.launchDate === undefined || source.launchDate === '') return null;
      const parsed = new Date(source.launchDate);
      return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
    })(),
  };
}

// Las opciones que devuelve esta acción son públicas; los secretos nunca se guardan aquí.
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snapshot = await SETTINGS_REF.get();
    if (snapshot.exists) {
      return normalizeSettings(snapshot.data() as Partial<SiteSettings>);
    }

    // Preserve the existing production settings on the first deployment after this migration.
    // Static JSON import ensures the legacy settings are bundled in App Hosting.
    return normalizeSettings(legacySiteSettings as Partial<SiteSettings>);
  } catch (error) {
    console.error('[SITE SETTINGS] Error leyendo configuración; se usan valores predeterminados:', error);
    return {
      underConstruction: false,
      showSubscriptionFeature: true,
      showCountdown: false,
      launchDate: null,
    };
  }
}

// La configuración se guarda en Firestore (persistente en App Hosting) y solo puede cambiarla un administrador.
export async function updateSiteSettings(newSettings: SiteSettings): Promise<void> {
  const adminEmail = await requireAdmin();
  if (!newSettings || typeof newSettings !== 'object' ||
      typeof newSettings.underConstruction !== 'boolean' ||
      typeof newSettings.showSubscriptionFeature !== 'boolean' ||
      typeof newSettings.showCountdown !== 'boolean') {
    throw new Error('Configuración no válida.');
  }

  let launchDate: string | null = null;
  if (newSettings.launchDate !== null && newSettings.launchDate !== '') {
    const parsed = new Date(newSettings.launchDate);
    if (!Number.isFinite(parsed.getTime())) throw new Error('La fecha de lanzamiento no es válida.');
    launchDate = parsed.toISOString();
  }

  await SETTINGS_REF.set({
    underConstruction: newSettings.underConstruction,
    showSubscriptionFeature: newSettings.showSubscriptionFeature,
    showCountdown: newSettings.showCountdown,
    launchDate,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: adminEmail,
  }, { merge: true });
}
