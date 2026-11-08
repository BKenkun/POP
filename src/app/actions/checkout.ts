'use server';

import crypto from 'crypto';
import admin from 'firebase-admin';
import { firestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getPacklinkShippingQuotes } from '@/app/actions/packlink';
import { enforceServerActionRateLimit } from '@/lib/server-rate-limit';

export interface CheckoutOrderItem {
  productId: string;
  quantity: number;
  // Client-supplied name, price and image are deliberately not trusted.
  name?: string;
  price?: number;
  imageUrl?: string;
}

export interface CheckoutOrderData {
  orderId?: string;
  userId?: string;
  items: CheckoutOrderItem[];
  total?: number;
  shippingCost?: number;
  shippingFree?: boolean;
  packlink?: {
    serviceId?: string;
    serviceName?: string;
    carrierName?: string;
    quotedPrice?: number;
    currency?: string;
    status?: string;
  };
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
  };
  status?: string;
  paymentMethod: string;
  coupon?: {
    code: string;
    discount?: number;
    discountType?: string;
  };
  isGuest?: boolean;
}

type CouponRecord = {
  code?: string;
  isActive?: boolean;
  discountType?: 'percentage' | 'fixed' | 'free_shipping';
  discountValue?: number;
  minPurchase?: number;
  startDate?: string | Date | { toDate?: () => Date };
  endDate?: string | Date | { toDate?: () => Date };
  usageLimit?: number;
  usageCount?: number;
  onePerUser?: boolean;
};

function asDate(value: CouponRecord['startDate']): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && typeof value.toDate === 'function') return value.toDate();
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getVolumeDiscount(subtotal: number, quantity: number): number {
  let percent = 0;
  if (quantity >= 200) percent = 0.29;
  else if (quantity >= 180) percent = 0.26;
  else if (quantity >= 144) percent = 0.21;
  else if (quantity >= 72) percent = 0.15;
  else if (quantity >= 36) percent = 0.12;
  else if (quantity >= 19) percent = 0.09;
  else if (quantity >= 12) percent = 0.06;
  else if (quantity >= 6) percent = 0.03;
  else if (quantity >= 3) percent = 0.02;
  return Math.round(subtotal * percent);
}

function validateCoupon(coupon: CouponRecord, code: string, subtotal: number): number {
  const now = new Date();
  const start = asDate(coupon.startDate);
  const end = asDate(coupon.endDate);

  if (coupon.isActive !== true || String(coupon.code || '').toUpperCase() !== code) {
    throw new Error('El cupón no está activo o no es válido.');
  }
  if (start && start.getTime() > now.getTime()) throw new Error('El cupón todavía no está disponible.');
  if (end && end.getTime() < now.getTime()) throw new Error('El cupón ha caducado.');

  const limit = Number(coupon.usageLimit || 0);
  const used = Number(coupon.usageCount || 0);
  if (limit > 0 && used >= limit) throw new Error('El cupón ha alcanzado su límite de usos.');

  const minPurchase = Number(coupon.minPurchase || 0);
  if (minPurchase > 0 && subtotal < minPurchase) {
    throw new Error('El pedido no alcanza el importe mínimo del cupón.');
  }

  const value = Number(coupon.discountValue || 0);
  if (coupon.discountType === 'percentage') {
    if (!Number.isFinite(value) || value <= 0 || value > 100) throw new Error('El descuento del cupón no es válido.');
    return Math.round(subtotal * value / 100);
  }
  if (coupon.discountType === 'fixed') {
    if (!Number.isFinite(value) || value < 0) throw new Error('El descuento del cupón no es válido.');
    return Math.min(subtotal, Math.round(value));
  }
  if (coupon.discountType === 'free_shipping') return 0;
  throw new Error('Tipo de cupón no válido.');
}

/**
 * Creates a pending order using server-verified products, discounts and Packlink quote.
 * Authenticated users must send a valid Firebase ID token. Guest checkout receives
 * a random access token used only to authorize the subsequent payment/status actions.
 */
export async function createCheckoutOrder(
  data: CheckoutOrderData,
  idToken?: string,
): Promise<{
  success: boolean;
  orderId?: string;
  guestAccessToken?: string;
  total?: number;
  shippingCost?: number;
  error?: string;
}> {
  try {
    await enforceServerActionRateLimit('checkout-create', 8, 60 * 1000);
    if (!data || !Array.isArray(data.items) || data.items.length === 0 || data.items.length > 30) {
      return { success: false, error: 'El carrito no es válido.' };
    }

    const paymentMethod = String(data.paymentMethod || '');
    if (!['hilow', 'nowpayments'].includes(paymentMethod)) {
      return { success: false, error: 'Método de pago no permitido.' };
    }

    let userId = 'guest';
    let authenticatedEmail = '';
    if (idToken) {
      const decoded = await admin.auth().verifyIdToken(idToken, true);
      userId = decoded.uid;
      authenticatedEmail = String(decoded.email || '');
    } else if (data.userId && data.userId !== 'guest') {
      return { success: false, error: 'Inicia sesión para completar este pedido.' };
    }

    const customerName = String(data.customerName || '').trim();
    const suppliedEmail = String(data.customerEmail || '').trim().toLowerCase();
    const customerEmail = (authenticatedEmail || suppliedEmail).trim().toLowerCase();
    const address = data.shippingAddress || {};
    const shippingAddress = {
      line1: String(address.line1 || '').trim(),
      line2: String(address.line2 || '').trim(),
      city: String(address.city || '').trim(),
      state: String(address.state || '').trim(),
      postal_code: String(address.postal_code || '').trim(),
      country: String(address.country || '').trim(),
      phone: String(address.phone || '').trim(),
    };

    if (customerName.length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return { success: false, error: 'Revisa el nombre y el correo electrónico del cliente.' };
    }
    if (
      shippingAddress.line1.length < 5 ||
      shippingAddress.city.length < 2 ||
      shippingAddress.state.length < 2 ||
      shippingAddress.postal_code.length < 3 ||
      shippingAddress.country.length < 2 ||
      shippingAddress.phone.length < 9
    ) {
      return { success: false, error: 'La dirección de entrega está incompleta.' };
    }

    const normalizedItems = data.items.map((item) => ({
      productId: String(item?.productId || '').trim(),
      quantity: Number(item?.quantity),
    }));

    if (normalizedItems.some((item) =>
      !item.productId ||
      item.productId.length > 150 ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 100
    )) {
      return { success: false, error: 'Hay productos o cantidades no válidos en el carrito.' };
    }

    const mergedQuantities = new Map<string, number>();
    for (const item of normalizedItems) {
      mergedQuantities.set(item.productId, (mergedQuantities.get(item.productId) || 0) + item.quantity);
    }
    const itemsToLoad = Array.from(mergedQuantities.entries()).map(([productId, quantity]) => ({ productId, quantity }));
    const totalQuantity = itemsToLoad.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity > 200) return { success: false, error: 'La cantidad total del pedido supera el límite permitido.' };

    const productSnapshots = await Promise.all(
      itemsToLoad.map((item) => firestore.collection('products').doc(item.productId).get())
    );

    let subtotal = 0;
    const verifiedItems = productSnapshots.map((snapshot, index) => {
      const requested = itemsToLoad[index];
      if (!snapshot.exists) throw new Error('Uno de los productos ya no está disponible.');
      const product = snapshot.data()!;
      if (product.active === false) throw new Error('Uno de los productos ya no está disponible.');

      const price = Number(product.price);
      if (!Number.isSafeInteger(price) || price <= 0) throw new Error('El precio de un producto no es válido.');
      if (product.stock !== undefined && product.stock !== null && Number(product.stock) < requested.quantity) {
        throw new Error('No hay existencias suficientes de ' + String(product.name || 'uno de los productos') + '.');
      }

      subtotal += price * requested.quantity;
      if (!Number.isSafeInteger(subtotal)) throw new Error('El importe del pedido supera el límite permitido.');

      return {
        productId: snapshot.id,
        name: String(product.name || 'Producto'),
        price,
        quantity: requested.quantity,
        imageUrl: typeof product.imageUrl === 'string' ? product.imageUrl : '',
      };
    });

    const volumeDiscount = getVolumeDiscount(subtotal, totalQuantity);
    let couponRef: FirebaseFirestore.DocumentReference | null = null;
    let validatedCoupon: CouponRecord | null = null;
    let couponCode: string | null = null;
    let couponDiscount = 0;

    const requestedCouponCode = String(data.coupon?.code || '').trim().toUpperCase();
    if (requestedCouponCode) {
      const couponQuery = await firestore.collection('coupons')
        .where('code', '==', requestedCouponCode)
        .limit(1)
        .get();
      if (couponQuery.empty) throw new Error('El cupón no existe o no está disponible.');

      couponRef = couponQuery.docs[0].ref;
      validatedCoupon = couponQuery.docs[0].data() as CouponRecord;
      couponCode = requestedCouponCode;
      couponDiscount = validateCoupon(validatedCoupon, requestedCouponCode, subtotal);

      if (validatedCoupon.onePerUser) {
        if (userId === 'guest') {
          throw new Error('Este cupón requiere iniciar sesión y solo puede utilizarse una vez por cliente.');
        }
        const previousOrders = await firestore.collection('users').doc(userId).collection('orders')
          .where('coupon.code', '==', requestedCouponCode).limit(1).get();
        if (!previousOrders.empty) throw new Error('Ya has utilizado este cupón anteriormente.');
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - volumeDiscount - couponDiscount);
    const shippingFree = discountedSubtotal >= 4000 || validatedCoupon?.discountType === 'free_shipping';

    // Never trust the service or price sent by the browser: re-query Packlink on the server.
    const shippingResult = await getPacklinkShippingQuotes({
      postalCode: shippingAddress.postal_code,
      country: shippingAddress.country,
    });
    if (!shippingResult.success || !shippingResult.quotes?.length) {
      throw new Error(shippingResult.message || 'No se pudo validar la tarifa de envío.');
    }

    const selectedServiceId = String(data.packlink?.serviceId || '');
    const selectedQuote = shippingResult.quotes.find((quote) => quote.serviceId === selectedServiceId)
      || (shippingFree && !selectedServiceId ? shippingResult.quotes[0] : undefined);

    if (!selectedQuote || !Number.isFinite(selectedQuote.price) || selectedQuote.price < 0) {
      throw new Error('La tarifa de envío ha cambiado. Vuelve a calcular el envío antes de pagar.');
    }
    if (String(selectedQuote.currency || '').toUpperCase() !== 'EUR') {
      throw new Error('Packlink devolvió una tarifa en una moneda distinta de EUR.');
    }
    if (!shippingFree && selectedQuote.price <= 0) {
      throw new Error('Packlink no devolvió una tarifa de envío válida para este destino.');
    }

    const shippingCost = shippingFree ? 0 : Math.round(selectedQuote.price * 100);
    const total = discountedSubtotal + shippingCost;
    if (!Number.isSafeInteger(total) || total <= 0) {
      throw new Error('El importe final del pedido no es válido.');
    }

    // Detect stale checkout screens, but never use the browser total to create the order.
    if (data.total !== undefined && Math.abs(Math.round(Number(data.total)) - total) > 1) {
      throw new Error('El precio del pedido ha cambiado. Actualiza la página y vuelve a revisar el carrito.');
    }

    const timestamp = String(Date.now()) + String(crypto.randomInt(100, 1000));
    const orderId = 'CPO_' + userId + '_' + timestamp;
    const orderRef = firestore.collection('users').doc(userId).collection('orders').doc(orderId);
    const guestAccessToken = userId === 'guest' ? crypto.randomBytes(32).toString('hex') : undefined;

    const orderData: Record<string, unknown> = {
      id: orderId,
      userId,
      isGuest: userId === 'guest',
      items: verifiedItems,
      subtotal,
      volumeDiscount,
      total,
      shippingCost,
      shippingFree,
      packlink: {
        serviceId: selectedQuote.serviceId,
        serviceName: selectedQuote.serviceName,
        carrierName: selectedQuote.carrierName,
        quotedPrice: selectedQuote.price,
        currency: selectedQuote.currency || 'EUR',
        status: 'quoted',
      },
      customerName,
      customerEmail,
      shippingAddress,
      status: 'pending_payment',
      paymentMethod,
      ...(couponCode && validatedCoupon ? {
        coupon: {
          code: couponCode,
          couponId: couponRef?.id || null,
          discount: couponDiscount,
          discountType: validatedCoupon.discountType || null,
        },
      } : {}),
      ...(guestAccessToken ? {
        guestAccessTokenHash: crypto.createHash('sha256').update(guestAccessToken).digest('hex'),
      } : {}),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await firestore.runTransaction(async (transaction) => {
      if (couponRef && couponCode) {
        const currentCouponSnapshot = await transaction.get(couponRef);
        if (!currentCouponSnapshot.exists) throw new Error('El cupón ya no está disponible.');
        const currentCoupon = currentCouponSnapshot.data() as CouponRecord;
        validateCoupon(currentCoupon, couponCode, subtotal);

        if (currentCoupon.onePerUser && userId !== 'guest') {
          const previousOrdersQuery = firestore.collection('users').doc(userId).collection('orders')
            .where('coupon.code', '==', couponCode).limit(1);
          const previousOrdersSnapshot = await transaction.get(previousOrdersQuery);
          if (!previousOrdersSnapshot.empty) throw new Error('Ya has utilizado este cupón anteriormente.');
        }

        transaction.update(couponRef, {
          usageCount: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      transaction.create(orderRef, orderData);
    });

    return {
      success: true,
      orderId,
      guestAccessToken,
      total,
      shippingCost,
    };
  } catch (error) {
    console.error('[createCheckoutOrder] Pedido rechazado:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: error instanceof Error && error.message === 'RATE_LIMITED'
        ? 'Has realizado demasiados intentos. Espera un minuto e inténtalo de nuevo.'
        : error instanceof Error ? error.message : 'No se pudo crear el pedido.',
    };
  }
}

/**
 * Returns only the minimum order details needed by the success screen.
 * Both registered and guest customers must prove ownership.
 */
export async function getCheckoutOrderStatus(
  orderId: string,
  idToken?: string,
  guestAccessToken?: string,
): Promise<{
  exists: boolean;
  status?: string;
  total?: number;
  customerName?: string;
  customerEmail?: string;
  isGuest?: boolean;
}> {
  try {
    const { userId, order } = await import('@/lib/checkout-security')
      .then(({ getAuthorizedCheckoutOrder }) =>
        getAuthorizedCheckoutOrder(orderId, { idToken, guestAccessToken })
      );

    return {
      exists: true,
      status: String(order.status || ''),
      total: Number(order.total || 0),
      customerName: String(order.customerName || ''),
      customerEmail: String(order.customerEmail || ''),
      isGuest: userId === 'guest',
    };
  } catch {
    return { exists: false };
  }
}
