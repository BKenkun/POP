'use server';

// Modificado por: Webmaster Freddy Poleo

import { auth, firestore } from '@/lib/firebase-admin';

export type PacklinkAdminSettings = {
  senderName: string; street: string; city: string; postalCode: string; country: string;
  phone: string; email: string; weightKg: number; lengthCm: number; widthCm: number; heightCm: number;
};

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

export async function getPacklinkSettings(): Promise<PacklinkAdminSettings> {
  const snapshot = await firestore.collection('appSettings').doc('packlink').get();
  return { ...defaults, ...(snapshot.exists ? snapshot.data() as Partial<PacklinkAdminSettings> : {}) };
}

export async function savePacklinkSettings(input: PacklinkAdminSettings, idToken: string): Promise<{ success: true }> {
  if (!idToken) throw new Error('Inicia sesión como administrador para guardar la configuración.');
  const decoded = await auth.verifyIdToken(idToken);
  if (decoded.email !== 'maryandpopper@gmail.com') throw new Error('No tienes permiso para modificar la configuración de Packlink.');
  const settings: PacklinkAdminSettings = {
    senderName: String(input.senderName || '').trim(), street: String(input.street || '').trim(),
    city: String(input.city || '').trim(), postalCode: String(input.postalCode || '').trim(),
    country: String(input.country || '').trim().toUpperCase(), phone: String(input.phone || '').trim(),
    email: String(input.email || '').trim(), weightKg: Number(input.weightKg), lengthCm: Number(input.lengthCm),
    widthCm: Number(input.widthCm), heightCm: Number(input.heightCm),
  };
  if (!settings.senderName || !settings.street || !settings.city || !settings.postalCode || !settings.phone || !settings.email) {
    throw new Error('Completa todos los datos del remitente antes de guardar.');
  }
  if (!/^[A-Z]{2}$/.test(settings.country) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
    throw new Error('Revisa el país o el correo electrónico del remitente.');
  }
  if (![settings.weightKg, settings.lengthCm, settings.widthCm, settings.heightCm].every(n => Number.isFinite(n) && n > 0)) {
    throw new Error('El peso y todas las dimensiones deben ser mayores que cero.');
  }
  await firestore.collection('appSettings').doc('packlink').set({ ...settings, updatedAt: new Date(), updatedBy: decoded.email }, { merge: true });
  return { success: true };
}
