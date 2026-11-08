'use server';

// Modificado por: Webmaster Freddy Poleo
import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase-admin';

export interface SiteSettings {
  underConstruction: boolean;
  showSubscriptionFeature: boolean;
  showCountdown: boolean;
  launchDate: string | null;
}

const ADMIN_EMAILS = new Set(['maryandpopper@gmail.com', 'enriqueespincosme@gmail.com']);
const settingsFilePath = path.join(process.cwd(), 'src', 'lib', 'site-settings.json');

async function requireAdmin(): Promise<void> {
  const session = cookies().get('session')?.value;
  if (!session) throw new Error('Inicia sesión como administrador para cambiar la configuración.');
  const decoded = await auth.verifySessionCookie(session, true);
  const email = String(decoded.email || '').trim().toLowerCase();
  if (!ADMIN_EMAILS.has(email)) throw new Error('No tienes permisos para modificar la configuración del sitio.');
}

function normalizeSettings(input: SiteSettings): SiteSettings {
  if (!input || typeof input !== 'object') throw new Error('Configuración no válida.');
  if (typeof input.underConstruction !== 'boolean' ||
      typeof input.showSubscriptionFeature !== 'boolean' ||
      typeof input.showCountdown !== 'boolean') {
    throw new Error('Las opciones de configuración deben ser valores booleanos.');
  }
  let launchDate: string | null = null;
  if (input.launchDate !== null && input.launchDate !== '') {
    const parsed = new Date(input.launchDate);
    if (!Number.isFinite(parsed.getTime())) throw new Error('La fecha de lanzamiento no es válida.');
    launchDate = parsed.toISOString();
  }
  return {
    underConstruction: input.underConstruction,
    showSubscriptionFeature: input.showSubscriptionFeature,
    showCountdown: input.showCountdown,
    launchDate,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const fileContent = await fs.readFile(settingsFilePath, 'utf-8');
    const parsed = JSON.parse(fileContent);
    return normalizeSettings(parsed);
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

export async function updateSiteSettings(newSettings: SiteSettings): Promise<void> {
  await requireAdmin();
  const safeSettings = normalizeSettings(newSettings);
  try {
    await fs.writeFile(settingsFilePath, JSON.stringify(safeSettings, null, 2), 'utf-8');
  } catch (error) {
    console.error('[SITE SETTINGS] Error escribiendo configuración:', error);
    throw new Error('No se pudo actualizar la configuración del sitio.');
  }
}
