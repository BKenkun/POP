'use server';

import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import {
  projectId,
  areAdminCredentialsAvailable,
  isAdminCredentialError,
  runWithAdminAuth,
  runWithAdminFirestore,
  toFirestoreRestValue,
  fromFirestoreRestValue,
} from '@/lib/firebase-admin';
import { isAdminEmail } from '@/lib/admin';
import type { Order, Customer } from '@/lib/types';

export interface CouponRecord {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minPurchase?: number;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  onePerUser?: boolean;
}

export type CouponMutationInput = Omit<CouponRecord, 'id' | 'usageCount'>;

// Fallback en memoria únicamente para entornos de previsualización sin credenciales Admin activas
const memoryCoupons = new Map<string, CouponRecord>();

function serializeFirestoreValue(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (val instanceof Date) return val.toISOString();
  if (typeof (val as { toDate?: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  if (Array.isArray(val)) return val.map(serializeFirestoreValue);
  if (typeof val === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      out[k] = serializeFirestoreValue(v);
    }
    return out;
  }
  return val;
}

function normalizeCouponDoc(id: string, raw: Record<string, any>): CouponRecord {
  const startRaw = raw.startDate ? serializeFirestoreValue(raw.startDate) : null;
  const endRaw = raw.endDate ? serializeFirestoreValue(raw.endDate) : null;
  return {
    id,
    code: String(raw.code || '').trim().toUpperCase(),
    description: String(raw.description || '').trim(),
    discountType:
      raw.discountType === 'fixed' || raw.discountType === 'free_shipping'
        ? raw.discountType
        : 'percentage',
    discountValue: Number(raw.discountValue) || 0,
    minPurchase: Number(raw.minPurchase) || 0,
    startDate: typeof startRaw === 'string' ? startRaw : null,
    endDate: typeof endRaw === 'string' ? endRaw : null,
    isActive: raw.isActive !== false,
    usageLimit: Number(raw.usageLimit) || 0,
    usageCount: Number(raw.usageCount) || 0,
    onePerUser: Boolean(raw.onePerUser),
  };
}

async function verifyAdminIdToken(idToken: string): Promise<{ uid: string; email: string }> {
  if (!idToken) {
    throw new Error('Debes iniciar sesión como administrador.');
  }
  const decoded = await runWithAdminAuth((a) => a.verifyIdToken(idToken), 'verifyAdminIdToken');
  if (!decoded.email || !isAdminEmail(decoded.email)) {
    throw new Error('No tienes permisos de administrador para realizar esta acción.');
  }
  return { uid: decoded.uid, email: decoded.email };
}

/**
 * Obtiene todos los cupones desde el servidor para el panel de administración.
 */
export async function listAdminCoupons(idToken: string): Promise<CouponRecord[]> {
  await verifyAdminIdToken(idToken);

  if (areAdminCredentialsAvailable()) {
    try {
      const coupons = await runWithAdminFirestore(async (db) => {
        const snap = await db.collection('coupons').get();
        return snap.docs.map((d) => normalizeCouponDoc(d.id, d.data()));
      }, 'listAdminCoupons');

      coupons.forEach((c) => memoryCoupons.set(c.id, c));
      return coupons.sort((a, b) => a.code.localeCompare(b.code));
    } catch (error) {
      if (!isAdminCredentialError(error)) {
        throw new Error('No se pudieron cargar los cupones.');
      }
    }
  }

  // Fallback REST con el token del usuario si las reglas de Firestore lo permiten
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      projectId
    )}/databases/(default)/documents/coupons`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${idToken}` },
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      const docs: any[] = json.documents || [];
      const parsed = docs.map((docItem) => {
        const docId = String(docItem.name || '').split('/').pop() || '';
        const plain = fromFirestoreRestValue({ mapValue: { fields: docItem.fields || {} } }) as Record<
          string,
          any
        >;
        return normalizeCouponDoc(docId, plain || {});
      });
      parsed.forEach((c) => memoryCoupons.set(c.id, c));
      return parsed.sort((a, b) => a.code.localeCompare(b.code));
    }
  } catch {
    // Usar caché en memoria
  }

  return Array.from(memoryCoupons.values()).sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * Obtiene un cupón individual por ID para edición en el panel de administración.
 */
export async function getAdminCouponById(
  couponId: string,
  idToken: string
): Promise<CouponRecord | null> {
  await verifyAdminIdToken(idToken);
  if (!couponId) return null;

  if (areAdminCredentialsAvailable()) {
    try {
      return await runWithAdminFirestore(async (db) => {
        const snap = await db.collection('coupons').doc(couponId).get();
        if (!snap.exists) return null;
        const normalized = normalizeCouponDoc(snap.id, snap.data() || {});
        memoryCoupons.set(normalized.id, normalized);
        return normalized;
      }, 'getAdminCouponById');
    } catch (error) {
      if (!isAdminCredentialError(error)) {
        throw new Error('No se pudo cargar el cupón.');
      }
    }
  }

  return memoryCoupons.get(couponId) || null;
}

/**
 * Crea un nuevo cupón desde el servidor (evita bloqueos de reglas cliente para cualquier admin autorizado).
 */
export async function createAdminCoupon(
  input: CouponMutationInput,
  idToken: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    await verifyAdminIdToken(idToken);

    const code = String(input.code || '').trim().toUpperCase();
    const description = String(input.description || '').trim();

    if (code.length < 3) {
      return { success: false, error: 'El código debe tener al menos 3 caracteres.' };
    }
    if (!/^[A-Z0-9_-]+$/.test(code)) {
      return {
        success: false,
        error: 'El código solo puede contener letras, números, guiones o guiones bajos (sin espacios).',
      };
    }
    if (description.length < 3) {
      return { success: false, error: 'La descripción debe tener al menos 3 caracteres.' };
    }

    const discountType: CouponRecord['discountType'] =
      input.discountType === 'fixed' || input.discountType === 'free_shipping'
        ? input.discountType
        : 'percentage';

    const rawDiscount = Number(input.discountValue) || 0;
    if (discountType === 'percentage' && (rawDiscount <= 0 || rawDiscount > 100)) {
      return { success: false, error: 'El porcentaje debe estar entre 1 y 100.' };
    }
    if (discountType === 'fixed' && rawDiscount <= 0) {
      return { success: false, error: 'El descuento fijo debe ser mayor que 0 céntimos.' };
    }

    const payload: Omit<CouponRecord, 'id'> = {
      code,
      description,
      discountType,
      discountValue: discountType === 'free_shipping' ? 0 : rawDiscount,
      minPurchase: Math.max(0, Number(input.minPurchase) || 0),
      startDate: input.startDate || null,
      endDate: input.endDate || null,
      isActive: input.isActive !== false,
      usageLimit: Math.max(0, Number(input.usageLimit) || 0),
      onePerUser: Boolean(input.onePerUser),
      usageCount: 0,
    };

    if (areAdminCredentialsAvailable()) {
      try {
        const createdId = await runWithAdminFirestore(async (db) => {
          const existing = await db.collection('coupons').where('code', '==', code).limit(1).get();
          if (!existing.empty) {
            throw new Error(`Ya existe un cupón con el código "${code}".`);
          }
          const ref = await db.collection('coupons').add({
            ...payload,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          return ref.id;
        }, 'createAdminCoupon');

        memoryCoupons.set(createdId, { id: createdId, ...payload });
        return { success: true, id: createdId };
      } catch (error) {
        if (!isAdminCredentialError(error)) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'No se pudo crear el cupón.',
          };
        }
      }
    }

    // Fallback REST con token del admin si Admin SDK no está disponible en preview local
    const fallbackId = `cpn_${Date.now()}`;
    try {
      const docFields: Record<string, unknown> = {};
      for (const [k, v] of Object.entries({ ...payload, createdAt: new Date(), updatedAt: new Date() })) {
        docFields[k] = toFirestoreRestValue(v);
      }
      const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
        projectId
      )}/databases/(default)/documents/coupons/${encodeURIComponent(fallbackId)}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: docFields }),
        cache: 'no-store',
      });
      if (res.ok) {
        memoryCoupons.set(fallbackId, { id: fallbackId, ...payload });
        return { success: true, id: fallbackId };
      }
    } catch {
      // Continuar a memoria local en entorno preview
    }

    memoryCoupons.set(fallbackId, { id: fallbackId, ...payload });
    return { success: true, id: fallbackId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al guardar el cupón.',
    };
  }
}

/**
 * Actualiza un cupón existente (edición completa o cambio de estado activo/inactivo).
 */
export async function updateAdminCoupon(
  couponId: string,
  updates: Partial<CouponMutationInput>,
  idToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAdminIdToken(idToken);
    if (!couponId) {
      return { success: false, error: 'ID de cupón inválido.' };
    }

    const sanitized: Record<string, unknown> = {};
    if (updates.code !== undefined) {
      const code = String(updates.code).trim().toUpperCase();
      if (code.length < 3 || !/^[A-Z0-9_-]+$/.test(code)) {
        return {
          success: false,
          error: 'El código debe tener al menos 3 caracteres sin espacios.',
        };
      }
      sanitized.code = code;
    }
    if (updates.description !== undefined) {
      sanitized.description = String(updates.description).trim();
    }
    if (updates.discountType !== undefined) {
      sanitized.discountType = updates.discountType;
    }
    if (updates.discountValue !== undefined) {
      sanitized.discountValue =
        updates.discountType === 'free_shipping' ? 0 : Math.max(0, Number(updates.discountValue) || 0);
    }
    if (updates.minPurchase !== undefined) {
      sanitized.minPurchase = Math.max(0, Number(updates.minPurchase) || 0);
    }
    if (updates.startDate !== undefined) {
      sanitized.startDate = updates.startDate || null;
    }
    if (updates.endDate !== undefined) {
      sanitized.endDate = updates.endDate || null;
    }
    if (updates.isActive !== undefined) {
      sanitized.isActive = Boolean(updates.isActive);
    }
    if (updates.usageLimit !== undefined) {
      sanitized.usageLimit = Math.max(0, Number(updates.usageLimit) || 0);
    }
    if (updates.onePerUser !== undefined) {
      sanitized.onePerUser = Boolean(updates.onePerUser);
    }

    if (areAdminCredentialsAvailable()) {
      try {
        await runWithAdminFirestore(async (db) => {
          await db
            .collection('coupons')
            .doc(couponId)
            .update({
              ...sanitized,
              updatedAt: FieldValue.serverTimestamp(),
            });
        }, 'updateAdminCoupon');

        const prev = memoryCoupons.get(couponId);
        if (prev) {
          memoryCoupons.set(couponId, { ...prev, ...(sanitized as Partial<CouponRecord>) });
        }
        return { success: true };
      } catch (error) {
        if (!isAdminCredentialError(error)) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'No se pudo actualizar el cupón.',
          };
        }
      }
    }

    const prev = memoryCoupons.get(couponId);
    if (prev) {
      memoryCoupons.set(couponId, { ...prev, ...(sanitized as Partial<CouponRecord>) });
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'No se pudo actualizar el cupón.',
    };
  }
}

/**
 * Elimina un cupón permanentemente desde el servidor.
 */
export async function deleteAdminCoupon(
  couponId: string,
  idToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAdminIdToken(idToken);
    if (!couponId) return { success: false, error: 'ID de cupón inválido.' };

    if (areAdminCredentialsAvailable()) {
      try {
        await runWithAdminFirestore(async (db) => {
          await db.collection('coupons').doc(couponId).delete();
        }, 'deleteAdminCoupon');
        memoryCoupons.delete(couponId);
        return { success: true };
      } catch (error) {
        if (!isAdminCredentialError(error)) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'No se pudo eliminar el cupón.',
          };
        }
      }
    }

    memoryCoupons.delete(couponId);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'No se pudo eliminar el cupón.',
    };
  }
}

/**
 * Valida un cupón en el Checkout (funciona tanto para invitados como para usuarios registrados).
 */
export async function validateCheckoutCoupon(params: {
  code: string;
  cartTotal: number;
  idToken?: string | null;
}): Promise<{
  success: boolean;
  coupon?: CouponRecord;
  discountAmount?: number;
  error?: string;
}> {
  const cleanCode = String(params.code || '').trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: 'Please enter a coupon code.' };
  }

  let matchedCoupon: CouponRecord | null = null;
  let userUid: string | null = null;

  if (params.idToken) {
    try {
      const decoded = await runWithAdminAuth(
        (a) => a.verifyIdToken(params.idToken!),
        'validateCheckoutCoupon auth'
      );
      userUid = decoded.uid;
    } catch {
      userUid = null;
    }
  }

  if (areAdminCredentialsAvailable()) {
    try {
      matchedCoupon = await runWithAdminFirestore(async (db) => {
        const snap = await db
          .collection('coupons')
          .where('code', '==', cleanCode)
          .limit(1)
          .get();
        if (snap.empty) return null;
        return normalizeCouponDoc(snap.docs[0].id, snap.docs[0].data());
      }, 'validateCheckoutCoupon query');
    } catch (error) {
      if (!isAdminCredentialError(error)) {
        return { success: false, error: 'Could not verify coupon right now. Please try again.' };
      }
    }
  }

  if (!matchedCoupon) {
    // Buscar en fallback de memoria si estamos en entorno preview sin credenciales
    for (const c of memoryCoupons.values()) {
      if (c.code === cleanCode) {
        matchedCoupon = c;
        break;
      }
    }
  }

  if (!matchedCoupon) {
    return { success: false, error: 'Code is not valid.' };
  }

  if (!matchedCoupon.isActive) {
    return { success: false, error: 'This coupon is not currently active.' };
  }

  if (matchedCoupon.startDate && new Date(matchedCoupon.startDate) > new Date()) {
    return { success: false, error: 'This coupon is not available yet.' };
  }

  if (matchedCoupon.endDate && new Date(matchedCoupon.endDate) < new Date()) {
    return { success: false, error: 'This coupon has expired.' };
  }

  if (
    matchedCoupon.usageLimit &&
    matchedCoupon.usageLimit > 0 &&
    (matchedCoupon.usageCount || 0) >= matchedCoupon.usageLimit
  ) {
    return {
      success: false,
      error:
        matchedCoupon.usageLimit === 1
          ? 'This single-use coupon has already been redeemed.'
          : `This coupon has reached the maximum limit of ${matchedCoupon.usageLimit} uses.`,
    };
  }

  if (
    matchedCoupon.minPurchase &&
    matchedCoupon.minPurchase > 0 &&
    params.cartTotal < matchedCoupon.minPurchase
  ) {
    const euros = (matchedCoupon.minPurchase / 100).toFixed(2);
    return {
      success: false,
      error: `This coupon requires a minimum purchase of ${euros} €.`,
    };
  }

  if (matchedCoupon.onePerUser) {
    if (!userUid) {
      return {
        success: false,
        error:
          'This exclusive coupon (1 use per customer) requires you to log in or create an account.',
      };
    }

    if (areAdminCredentialsAvailable()) {
      try {
        const alreadyUsed = await runWithAdminFirestore(async (db) => {
          const prevSnap = await db
            .collection('users')
            .doc(userUid!)
            .collection('orders')
            .where('coupon.code', '==', matchedCoupon!.code)
            .limit(1)
            .get();
          return !prevSnap.empty;
        }, 'validateCheckoutCoupon onePerUser');

        if (alreadyUsed) {
          return {
            success: false,
            error:
              'You have already used this coupon on a previous order. Only 1 use per customer is allowed.',
          };
        }
      } catch {
        // Ignorar si Admin SDK no está disponible en local
      }
    }
  }

  const discountAmount =
    matchedCoupon.discountType === 'free_shipping'
      ? 0
      : matchedCoupon.discountType === 'percentage'
      ? Math.round((params.cartTotal * matchedCoupon.discountValue) / 100)
      : matchedCoupon.discountValue;

  return {
    success: true,
    coupon: matchedCoupon,
    discountAmount,
  };
}

function parseRestDocumentFields(docObj: Record<string, any>): {
  id: string;
  path: string;
  data: Record<string, any>;
} {
  const fullName = String(docObj.name || '');
  const marker = '/documents/';
  const idx = fullName.indexOf(marker);
  const relativePath = idx >= 0 ? fullName.slice(idx + marker.length) : fullName;
  const segments = relativePath.split('/');
  const id = segments[segments.length - 1] || '';
  const data: Record<string, any> = {};
  const fields = docObj.fields || {};
  for (const [k, v] of Object.entries(fields)) {
    data[k] = fromFirestoreRestValue(v as Record<string, any>);
  }
  return { id, path: relativePath, data };
}

/**
 * Fallback seguro de servidor para cargar pedidos y clientes en el panel Admin
 * cuando las reglas cliente de Firestore aún no han sido republicadas o la clave Admin SDK está pendiente de rotar.
 */
export async function getAdminOrdersAndUsersServer(idToken: string): Promise<{
  orders: (Omit<Order, 'createdAt'> & { createdAt: string; path: string })[];
  customers: Customer[];
}> {
  const adminUser = await verifyAdminIdToken(idToken);

  if (areAdminCredentialsAvailable()) {
    try {
      return await runWithAdminFirestore(async (db) => {
        const [ordersSnap, usersSnap] = await Promise.all([
          db.collectionGroup('orders').get(),
          db.collection('users').get(),
        ]);

        const orders = ordersSnap.docs
          .map((d) => {
            const raw = serializeFirestoreValue(d.data()) as Record<string, any>;
            const createdAtStr =
              typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString();
            return {
              ...(raw as Omit<Order, 'createdAt'>),
              id: d.id,
              path: d.ref.path,
              createdAt: createdAtStr,
            };
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const customers: Customer[] = usersSnap.docs.map((d) => {
          const raw = serializeFirestoreValue(d.data()) as Record<string, any>;
          return {
            uid: d.id,
            email: raw.email || '',
            displayName: raw.displayName || '',
            photoURL: raw.photoURL || undefined,
            disabled: Boolean(raw.disabled),
            creationTime:
              typeof raw.creationTime === 'string' ? raw.creationTime : new Date().toISOString(),
          };
        });

        return { orders, customers };
      }, 'getAdminOrdersAndUsersServer');
    } catch {
      // Continuar a fallback REST autenticado con el idToken del administrador
    }
  }

  // Fallback REST con el token del administrador:
  // 1) Intenta collectionGroup('orders') si las reglas ya incluyen su email
  // 2) Si aún no se publicaron las reglas en consola, carga al menos sus propios pedidos (users/{adminUid}/orders)
  const baseDocsUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/databases/(default)/documents`;
  const headers = {
    Authorization: `Bearer ${idToken}`,
    'Content-Type': 'application/json',
  };

  let orders: (Omit<Order, 'createdAt'> & { createdAt: string; path: string })[] = [];
  const customers: Customer[] = [];

  try {
    const queryRes = await fetch(`${baseDocsUrl}:runQuery`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'orders', allDescendants: true }],
        },
      }),
      cache: 'no-store',
    });

    if (queryRes.ok) {
      const rows = (await queryRes.json()) as Array<{ document?: Record<string, any> }>;
      orders = rows
        .filter((r) => r.document)
        .map((r) => {
          const parsed = parseRestDocumentFields(r.document!);
          const createdAtStr =
            typeof parsed.data.createdAt === 'string'
              ? parsed.data.createdAt
              : new Date().toISOString();
          return {
            ...(parsed.data as Omit<Order, 'createdAt'>),
            id: parsed.id,
            path: parsed.path,
            createdAt: createdAtStr,
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      const ownRes = await fetch(
        `${baseDocsUrl}/users/${encodeURIComponent(adminUser.uid)}/orders`,
        { headers, cache: 'no-store' }
      );
      if (ownRes.ok) {
        const ownBody = (await ownRes.json()) as { documents?: Array<Record<string, any>> };
        orders = (ownBody.documents || [])
          .map((docObj) => {
            const parsed = parseRestDocumentFields(docObj);
            const createdAtStr =
              typeof parsed.data.createdAt === 'string'
                ? parsed.data.createdAt
                : new Date().toISOString();
            return {
              ...(parsed.data as Omit<Order, 'createdAt'>),
              id: parsed.id,
              path: parsed.path,
              createdAt: createdAtStr,
            };
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }
  } catch {
    // Ignorar fallos de red secundarios
  }

  return { orders, customers };
}
