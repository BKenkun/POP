// Modificado por: Webmaster Freddy Poleo

import {
  areAdminCredentialsAvailable,
  isAdminCredentialError,
  runWithAdminFirestore,
} from '@/lib/firebase-admin';
import type { PacklinkAdminSettings } from '@/app/actions/packlink-settings';

let memoryPacklinkSettings: Partial<PacklinkAdminSettings> | null = null;

export function setMemoryPacklinkSettings(settings: PacklinkAdminSettings): void {
  memoryPacklinkSettings = { ...settings };
}

export function getDefaultPacklinkSettings(): PacklinkAdminSettings {
  return {
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
}

export async function readPacklinkSettings(): Promise<PacklinkAdminSettings> {
  const defaults = getDefaultPacklinkSettings();

  if (!areAdminCredentialsAvailable()) {
    return { ...defaults, ...(memoryPacklinkSettings || {}) };
  }

  try {
    const snapshot = await runWithAdminFirestore(
      (db) => db.collection('appSettings').doc('packlink').get(),
      'packlink-config'
    );
    if (snapshot.exists) {
      const remote = snapshot.data() as Partial<PacklinkAdminSettings>;
      memoryPacklinkSettings = remote;
      return { ...defaults, ...remote };
    }
    return { ...defaults, ...(memoryPacklinkSettings || {}) };
  } catch (error) {
    if (!isAdminCredentialError(error)) {
      const msg = error instanceof Error ? error.message : String(error);
      console.info(`[packlink-config] Using default sender settings (${msg})`);
    }
    return { ...defaults, ...(memoryPacklinkSettings || {}) };
  }
}
