// Modificado por: Webmaster Freddy Poleo
'use server';

import { readPacklinkSettings } from '@/lib/packlink-config';
import { enforceServerActionRateLimit } from '@/lib/server-rate-limit';

const API_BASE = 'https://api.packlink.com/v1';

export type PacklinkQuote = {
  serviceId: string;
  serviceName: string;
  carrierName: string;
  price: number; // EUR
  currency: string;
};

function normalizeCountryCode(value: unknown): string {
  const text = String(value || '').trim().toUpperCase();
  if (text.length === 2) return text;
  const aliases: Record<string, string> = {
    SPAIN: 'ES', ESPAÑA: 'ES', PORTUGAL: 'PT', FRANCE: 'FR', FRANCIA: 'FR',
    GERMANY: 'DE', ALEMANIA: 'DE', ITALY: 'IT', ITALIA: 'IT', BELGIUM: 'BE',
    BELGICA: 'BE', BELGIQUE: 'BE', NETHERLANDS: 'NL', HOLANDA: 'NL',
    IRELAND: 'IE', IRLANDA: 'IE', 'UNITED KINGDOM': 'GB', 'REINO UNIDO': 'GB',
  };
  return aliases[text] || text;
}

function packlinkConfig() {
  const apiKey = process.env.PACKLINK_API_KEY;
  if (!apiKey) throw new Error('Falta configurar PACKLINK_API_KEY en Firebase Secret Manager.');
  return { apiKey };
}

async function packlinkRequest(path: string, init: RequestInit = {}) {
  const { apiKey } = packlinkConfig();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: apiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    console.error('[PACKLINK] API error', { path, status: response.status });
    throw new Error(response.status === 401
      ? 'Packlink PRO rechazó la clave API. Revisa PACKLINK_API_KEY.'
      : 'Packlink PRO no pudo completar la operación. Revisa la configuración y los logs.');
  }
  return body;
}

/** Consulta las tarifas reales de Packlink PRO; se limita la frecuencia por IP. */
export async function getPacklinkShippingQuotes(input: {
  postalCode: string;
  country: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}): Promise<{ success: boolean; quotes?: PacklinkQuote[]; message?: string }> {
  try {
    await enforceServerActionRateLimit('packlink-quotes', 15, 60 * 1000);
    const { postalCode: fromPostalCode, country: fromCountry, weightKg, lengthCm, widthCm, heightCm } = await readPacklinkSettings();
    const postalCode = String(input.postalCode || '').trim();
    const country = normalizeCountryCode(input.country);
    if (postalCode.length < 3 || country.length !== 2) {
      return { success: false, message: 'Introduce un código postal y país válidos para calcular el envío.' };
    }

    const params = new URLSearchParams({
      'from[country]': fromCountry,
      'from[zip]': fromPostalCode,
      'to[country]': country,
      'to[zip]': postalCode,
      'packages[0][height]': String(Math.ceil(input.heightCm || heightCm)),
      'packages[0][width]': String(Math.ceil(input.widthCm || widthCm)),
      'packages[0][length]': String(Math.ceil(input.lengthCm || lengthCm)),
      'packages[0][weight]': String(input.weightKg || weightKg),
    });
    const body = await packlinkRequest(`/services?${params.toString()}`, { method: 'GET' });
    const rows = Array.isArray(body) ? body : Array.isArray(body?.services) ? body.services : [];
    const quotes = rows.map((row: any) => ({
      serviceId: String(row.service_id ?? row.serviceId ?? row.id ?? ''),
      serviceName: String(row.service_name ?? row.serviceName ?? row.name ?? 'Envío estándar'),
      carrierName: String(row.carrier_name ?? row.carrierName ?? row.carrier ?? 'Transportista'),
      price: Number(row.price?.total_price ?? row.total_price ?? row.price?.base_price ?? row.base_price ?? row.price),
      currency: String(row.currency ?? 'EUR'),
    })).filter((q: PacklinkQuote) => q.serviceId && Number.isFinite(q.price) && q.price >= 0)
      .sort((a: PacklinkQuote, b: PacklinkQuote) => a.price - b.price);

    if (!quotes.length) return { success: false, message: 'Packlink no devolvió tarifas válidas para ese destino.' };
    return { success: true, quotes };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'No se pudieron consultar tarifas de Packlink PRO.' };
  }
}

