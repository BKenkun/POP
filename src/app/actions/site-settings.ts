'use server';

import fs from 'fs/promises';
import path from 'path';

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
        const fileContent = await fs.readFile(settingsFilePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Error reading site settings, returning defaults:", error);
        // Devuelve los valores por defecto si el archivo no existe o hay un error.
        return {
            underConstruction: false,
            showSubscriptionFeature: true,
            showCountdown: false,
            launchDate: null,
        };
    }
}

// Actualiza la configuración.
export async function updateSiteSettings(newSettings: SiteSettings): Promise<void> {
    try {
        await fs.writeFile(settingsFilePath, JSON.stringify(newSettings, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error writing site settings:", error);
        throw new Error("No se pudo actualizar la configuración del sitio.");
    }
}
