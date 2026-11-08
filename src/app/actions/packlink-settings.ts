'use server';

// Modificado por: Webmaster Freddy Poleo
import { cookies } from 'next/headers';
import { auth, firestore } from '@/lib/firebase-admin';

export type PacklinkAdminSettings = {
  senderName: string; street: string; city: string; postalCode: string; country: string;
  phone: string; email: string; weightKg: number; lengthCm: number; widthCm: number; heightCm: number;
};

const ADMIN_EMAILS = new Set(['maryandpopper@gmail.com', 'enriqueespincosme@gmail.com']);

const defaults: PacklinkAdminSettings = {
  senderName: process.env.PACKLINK_FROM_NAME || 'enrique espin cosme',
  street: process.env.PACKLINK_FROM_STREET || 'biologo konrad lorenz, 6 3d',
  city: process.env.PACKLINK_FROM_CITY || 'Alicante',
  postalCode: process.env.PACKLINK_FROM_POSTAL_CODE || '03015',
  country: process.env.PACKLINK_FROM_COUNTRY || 'ES',
  phone: process.env.PACKLINK_FROM_PHONE || '+34 686 35 15 72',
  email: process.env.PACKLINK_FROM_EMAIL || 'info@comprarpopperonline.com',
  weightKg: Number(process.env.PACKLINK_PACKAGE_WEIGHT_KG || 1),
  lengthCm: Number(process.env.PACKLINK_PACKAGE_LENGTH_CM || 15),
  widthCm: Number(process.env.PACKLINK_PACKAGE_WIDTH_CM || 8),
  heightCm: Number(process.env.PACKLINK_PACKAGE_HEIGHT_CM || 6),
};

async function requirePacklinkAdmin() {
  const session = cookies().get('session')?.value;
  if (!session) throw new Error('Inicia sesión como administrador para gestionar Packlink.');
  const decoded = await auth.verifySessionCookie(session, true);
  const email = String(decoded.email || '').trim().toLowerCase();
  if (!ADMIN_EMAILS.has(email)) throw new Error('No tienes permisos para gestionar Packlink.');
  return email;
}

export async function getPacklinkSettings(): Promise<PacklinkAdminSettings> {
  await requirePacklinkAdmin();
  const snapshot = await firestore.collection('appSettings').doc('packlink').get();
  return { ...defaults, ...(snapshot.exists ? snapshot.data() as Partial<PacklinkAdminSettings> : {}) };
}

export async function savePacklinkSettings(input: PacklinkAdminSettings): Promise<{ success: true }> {
  const adminEmail = await requirePacklinkAdmin();
  if (!input || typeof input !== 'object') throw new Error('Configuración no válida.');

  const settings: PacklinkAdminSettings = {
    senderName: String(input.senderName || '').trim().slice(0, 120),
    street: String(input.street || '').trim().slice(0, 180),
    city: String(input.city || '').trim().slice(0, 100),
    postalCode: String(input.postalCode || '').trim().slice(0, 20),
    country: String(input.country || '').trim().toUpperCase().slice(0, 2),
    phone: String(input.phone || '').trim().slice(0, 30),
    email: String(input.email || '').trim().toLowerCase().slice(0, 254),
    weightKg: Number(input.weightKg),
    lengthCm: Number(input.lengthCm),
    widthCm: Number(input.widthCm),
    heightCm: Number(input.heightCm),
  };

  if (!settings.senderName || !settings.street || !settings.city || !settings.postalCode ||
      !settings.phone || !settings.email) {
    throw new Error('Completa todos los datos del remitente antes de guardar.');
  }
  if (!/^[A-Z]{2}$/.test(settings.country) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
    throw new Error('Revisa el país o el correo electrónico del remitente.');
  }
  if (![settings.weightKg, settings.lengthCm, settings.widthCm, settings.heightCm]
      .every(Number.isFinite)) {
    throw new Error('El peso y las dimensiones deben ser valores numéricos.');
  }
  if (settings.weightKg < 0.05 || settings.weightKg > 100 ||
      [settings.lengthCm, settings.widthCm, settings.heightCm].some(value => value < 1 || value > 200)) {
    throw new Error('El paquete debe pesar entre 0,05 y 100 kg y medir entre 1 y 200 cm por lado.');
  }

  await firestore.collection('appSettings').doc('packlink').set({
    ...settings,
    updatedAt: new Date(),
    updatedBy: adminEmail,
  }, { merge: true });
  return { success: true };
}
