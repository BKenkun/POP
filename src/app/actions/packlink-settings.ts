'use server';

// Modificado por: Webmaster Freddy Poleo

import {
  auth,
  areAdminCredentialsAvailable,
  isAdminCredentialError,
  runWithAdminFirestore,
} from '@/lib/firebase-admin';
import { isAdminEmail } from '@/lib/admin';
import { readPacklinkSettings, setMemoryPacklinkSettings } from '@/lib/packlink-config';

export type PacklinkAdminSettings = {
  senderName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

export async function getPacklinkSettings(idToken: string): Promise<PacklinkAdminSettings> {
  if (!idToken) throw new Error('Inicia sesión como administrador para ver la configuración.');
  const decoded = await auth.verifyIdToken(idToken);
  if (!isAdminEmail(decoded.email)) {
    throw new Error('No tienes permiso para ver la configuración de Packlink.');
  }
  return readPacklinkSettings();
}

export async function savePacklinkSettings(
  input: PacklinkAdminSettings,
  idToken: string
): Promise<{ success: true }> {
  if (!idToken) throw new Error('Inicia sesión como administrador para guardar la configuración.');
  const decoded = await auth.verifyIdToken(idToken);
  if (!isAdminEmail(decoded.email)) {
    throw new Error('No tienes permiso para modificar la configuración de Packlink.');
  }

  const settings: PacklinkAdminSettings = {
    senderName: String(input.senderName || '').trim(),
    street: String(input.street || '').trim(),
    city: String(input.city || '').trim(),
    postalCode: String(input.postalCode || '').trim(),
    country: String(input.country || '').trim().toUpperCase(),
    phone: String(input.phone || '').trim(),
    email: String(input.email || '').trim(),
    weightKg: Number(input.weightKg),
    lengthCm: Number(input.lengthCm),
    widthCm: Number(input.widthCm),
    heightCm: Number(input.heightCm),
  };

  if (
    !settings.senderName ||
    !settings.street ||
    !settings.city ||
    !settings.postalCode ||
    !settings.phone ||
    !settings.email
  ) {
    throw new Error('Completa todos los datos del remitente antes de guardar.');
  }
  if (!/^[A-Z]{2}$/.test(settings.country) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
    throw new Error('Revisa el país o el correo electrónico del remitente.');
  }
  if (
    ![settings.weightKg, settings.lengthCm, settings.widthCm, settings.heightCm].every(
      (n) => Number.isFinite(n) && n > 0
    )
  ) {
    throw new Error('El peso y todas las dimensiones deben ser mayores que cero.');
  }

  setMemoryPacklinkSettings(settings);

  if (areAdminCredentialsAvailable()) {
    try {
      await runWithAdminFirestore(
        (db) =>
          db
            .collection('appSettings')
            .doc('packlink')
            .set({ ...settings, updatedAt: new Date(), updatedBy: decoded.email }, { merge: true }),
        'packlink-settings write'
      );
    } catch (error) {
      if (!isAdminCredentialError(error)) {
        throw error;
      }
    }
  }

  return { success: true };
}
