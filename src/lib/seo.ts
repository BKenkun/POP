import type { Metadata } from 'next';
import {
  areAdminCredentialsAvailable,
  fromFirestoreRestValue,
  isAdminCredentialError,
  projectId,
  runWithAdminFirestore,
} from '@/lib/firebase-admin';
import { products as fallbackProducts } from '@/lib/products';
import type { Product } from '@/lib/types';

export const SITE_NAME = 'PuroRush';
export const DEFAULT_SITE_URL = 'https://comprarpopperonline.com';

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, '');
}

export interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  keywords?: string[];
  images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
  type?: 'website' | 'article';
}

export function buildPageMetadata({
  title,
  description,
  path,
  noIndex = false,
  keywords,
  images,
  type = 'website',
}: PageMetadataOptions): Metadata {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${getSiteUrl()}${normalizedPath === '/' ? '' : normalizedPath}` || getSiteUrl();

  return {
    title,
    description,
    ...(keywords && keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: normalizedPath,
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {
          robots: {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              'max-image-preview': 'large',
              'max-snippet': -1,
            },
          },
        }),
    openGraph: {
      type,
      siteName: SITE_NAME,
      title,
      description,
      url: canonicalUrl,
      ...(images && images.length > 0 ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(images && images.length > 0 ? { images: images.map((img) => img.url) } : {}),
    },
  };
}

function serializePlainValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof (record as { toDate?: unknown }).toDate === 'function') {
      try {
        return (record as { toDate: () => Date }).toDate().toISOString();
      } catch {
        return null;
      }
    }
    if ('_seconds' in record && '_nanoseconds' in record) {
      const ms = Number(record._seconds) * 1000;
      return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
    }
    if (Array.isArray(value)) {
      return value.map(serializePlainValue);
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(record)) {
      if (v !== undefined) {
        out[k] = serializePlainValue(v);
      }
    }
    return out;
  }
  return value;
}

function normalizeProduct(id: string, rawData: Record<string, unknown>): Product {
  const plain = serializePlainValue(rawData) as Record<string, unknown>;
  return {
    ...(plain as Omit<Product, 'id'>),
    id,
    name: typeof plain.name === 'string' ? plain.name : 'Product',
    price: typeof plain.price === 'number' ? plain.price : Number(plain.price) || 0,
    imageUrl:
      typeof plain.imageUrl === 'string' && plain.imageUrl.trim().length > 0
        ? plain.imageUrl
        : 'https://picsum.photos/400/400',
  };
}

async function fetchActiveProductsViaRest(): Promise<Product[] | null> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      projectId
    )}/databases/(default)/documents/products?pageSize=300`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      documents?: Array<{ name?: string; fields?: Record<string, unknown> }>;
    };
    const docs = json.documents || [];
    const parsed: Product[] = [];

    for (const docItem of docs) {
      const fullName = docItem.name || '';
      const id = fullName.split('/').pop() || '';
      if (!id) continue;

      const data: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(docItem.fields || {})) {
        data[k] = fromFirestoreRestValue(v as Record<string, unknown>);
      }
      const product = normalizeProduct(id, data);
      if (product.active !== false) {
        parsed.push(product);
      }
    }

    return parsed;
  } catch {
    return null;
  }
}

async function fetchProductByIdViaRest(
  id: string
): Promise<{ status: 'found'; product: Product } | { status: 'not_found' } | { status: 'error' }> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      projectId
    )}/databases/(default)/documents/products/${encodeURIComponent(id)}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (res.status === 404) {
      return { status: 'not_found' };
    }
    if (!res.ok) {
      return { status: 'error' };
    }
    const docItem = (await res.json()) as { fields?: Record<string, unknown> };
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(docItem.fields || {})) {
      data[k] = fromFirestoreRestValue(v as Record<string, unknown>);
    }
    return { status: 'found', product: normalizeProduct(id, data) };
  } catch {
    return { status: 'error' };
  }
}

export async function getActiveProductsServer(): Promise<Product[]> {
  if (areAdminCredentialsAvailable()) {
    try {
      const snapshot = await runWithAdminFirestore(
        (db) => db.collection('products').get(),
        'seo-active-products'
      );
      if (!snapshot.empty) {
        return snapshot.docs
          .map((d) => normalizeProduct(d.id, d.data() as Record<string, unknown>))
          .filter((p) => p.active !== false);
      }
    } catch (error) {
      if (!isAdminCredentialError(error)) {
        console.info('[seo] Admin product fetch failed, falling back to public REST.');
      }
    }
  }

  const restProducts = await fetchActiveProductsViaRest();
  if (restProducts && restProducts.length > 0) {
    return restProducts;
  }

  return fallbackProducts;
}

export async function getProductByIdServer(id: string): Promise<Product | null> {
  if (!id) return null;

  if (areAdminCredentialsAvailable()) {
    try {
      const docSnap = await runWithAdminFirestore(
        (db) => db.collection('products').doc(id).get(),
        'seo-product-by-id'
      );
      if (!docSnap.exists) {
        return fallbackProducts.find((p) => p.id === id) ?? null;
      }
      return normalizeProduct(docSnap.id, docSnap.data() as Record<string, unknown>);
    } catch (error) {
      if (!isAdminCredentialError(error)) {
        console.info('[seo] Admin single product fetch failed, falling back to public REST.');
      }
    }
  }

  const restResult = await fetchProductByIdViaRest(id);
  if (restResult.status === 'found') {
    return restResult.product;
  }
  if (restResult.status === 'not_found') {
    return fallbackProducts.find((p) => p.id === id) ?? null;
  }

  return fallbackProducts.find((p) => p.id === id) ?? null;
}
