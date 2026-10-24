// Modificado por: Webmaster Freddy Poleo

import { firestore } from '@/lib/firebase-admin';
import type { PacklinkAdminSettings } from '@/app/actions/packlink-settings';

export async function readPacklinkSettings(): Promise<PacklinkAdminSettings> {
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
  const snapshot = await firestore.collection('appSettings').doc('packlink').get();
  return { ...defaults, ...(snapshot.exists ? snapshot.data() as Partial<PacklinkAdminSettings> : {}) };
}
