// Modificado por: Webmaster Freddy Poleo
import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import { enforceServerActionRateLimit } from '@/lib/server-rate-limit';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stockNotificationSchema = z.object({
  email: z.string().trim().email().max(254),
  productId: z.string().trim().regex(/^[A-Za-z0-9_-]{1,128}$/),
});

export async function POST(req: NextRequest) {
  try {
    await enforceServerActionRateLimit('stock-notification', 5, 60 * 60 * 1000);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, message: 'Solicitud no válida.' }, { status: 400 });
    }

    const validation = stockNotificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: 'Introduce un email y producto válidos.' }, { status: 400 });
    }

    const email = validation.data.email.toLowerCase();
    const productId = validation.data.productId;
    const apiKey = process.env.KLAVIYO_API_KEY;
    if (!apiKey) {
      console.error('[STOCK NOTIFICATION] Falta KLAVIYO_API_KEY.');
      return NextResponse.json({ success: false, message: 'El servicio de notificaciones no está disponible.' }, { status: 503 });
    }

    const productSnapshot = await firestore.collection('products').doc(productId).get();
    if (!productSnapshot.exists || productSnapshot.data()?.active === false) {
      return NextResponse.json({ success: false, message: 'El producto ya no está disponible.' }, { status: 404 });
    }

    const variantId = '$custom:::$default:::' + productId;
    const response = await fetch('https://a.klaviyo.com/api/back-in-stock-subscriptions/', {
      method: 'POST',
      headers: {
        Authorization: 'Klaviyo-API-Key ' + apiKey,
        accept: 'application/json',
        'content-type': 'application/json',
        revision: '2024-02-15',
      },
      body: JSON.stringify({
        data: {
          type: 'back-in-stock-subscription',
          attributes: { profile: { email } },
          relationships: {
            variant: { data: { type: 'catalog-variant', id: variantId } },
          },
        },
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 202) return NextResponse.json({ success: true });

    const text = await response.text();
    let detail = '';
    try {
      detail = String(JSON.parse(text)?.errors?.[0]?.detail || '');
    } catch {
      detail = '';
    }
    console.error('[STOCK NOTIFICATION] Klaviyo rechazó el registro:', { status: response.status });
    return NextResponse.json({
      success: false,
      message: detail.slice(0, 200) || 'No se pudo registrar la notificación.',
    }, { status: response.status >= 500 ? 502 : 400 });
  } catch (error) {
    if (error instanceof Error && error.message === 'RATE_LIMITED') {
      return NextResponse.json({ success: false, message: 'Has realizado demasiadas solicitudes. Prueba más tarde.' }, { status: 429 });
    }
    console.error('[STOCK NOTIFICATION] Error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ success: false, message: 'No se pudo registrar la notificación.' }, { status: 500 });
  }
}
