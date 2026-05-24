'use server';

import path from 'path';
import { firestore } from '@/firebase/admin'
import { assertAdmin } from '@/lib/assert-admin';

const DEFAULT_SETTINGS: SiteSettings = {
    underConstruction: false,
    showSubscriptionFeature: true,
    showCountdown: false,
    launchDate: null,
};
 
const SETTINGS_DOC_PATH = 'config/siteSettings';

export interface SiteSettings {
    underConstruction: boolean;
    showSubscriptionFeature: boolean;
    showCountdown: boolean;
    launchDate: string | null;
}

const settingsFilePath = path.join(process.cwd(), 'src', 'lib', 'site-settings.json');

// Lee la configuración actual.
export async function getSiteSettings(): Promise<SiteSettings> {
    try {
        const db = firestore();
        const snap = await db.doc(SETTINGS_DOC_PATH).get();
 
        if (!snap.exists) {
            return DEFAULT_SETTINGS;
        }
 
        const data = snap.data()!;
        return {
            underConstruction: data.underConstruction ?? DEFAULT_SETTINGS.underConstruction,
            showSubscriptionFeature: data.showSubscriptionFeature ?? DEFAULT_SETTINGS.showSubscriptionFeature,
            showCountdown: data.showCountdown ?? DEFAULT_SETTINGS.showCountdown,
            launchDate: data.launchDate ?? DEFAULT_SETTINGS.launchDate,
        };
    } catch (error) {
        console.error("Error reading site settings from Firestore, returning defaults:", error);
        return DEFAULT_SETTINGS;
    }
}

// Actualiza la configuración.
export async function updateSiteSettings(newSettings: SiteSettings): Promise<void> {
    await assertAdmin();
    try {
        const db = firestore();
        await db.doc(SETTINGS_DOC_PATH).set(newSettings, { merge: true });
    } catch (error) {
        console.error("Error writing site settings to Firestore:", error);
        throw new Error("No se pudo actualizar la configuración del sitio.");
    }
}