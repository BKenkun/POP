import { NextRequest, NextResponse } from 'next/server';
import { firestore as adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

/**
 * Endpoint to initialize Hilow subscription flow with Firestore pre-registration.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId: clientProvidedId, successUrl, cancelUrl, userEmail, userName } = body;

    if (!clientProvidedId || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Missing required fields in request' }, { status: 400 });
    }

    const customerEmail = userEmail || 'customer@example.com';
    const customerName = userName || (userEmail ? userEmail.split('@')[0] : 'Member');

    const HILOW_API_KEY = process.env.HILOW_API_KEY;
    const hostHeader = req.headers.get('host')?.split(':')[0] || '';
    const HILOW_STORE_ID = process.env.HILOW_STORE_ID || (hostHeader && !hostHeader.includes('localhost') ? hostHeader : 'comprarpopperonline.com');
    const HILOW_API_BASE_URL = (process.env.HILOW_API_BASE_URL || 'https://hilowglobal.com').replace(/\/$/, '');
    const HILOW_PAY_ORIGIN = (process.env.HILOW_PAY_ORIGIN || HILOW_API_BASE_URL).replace(/\/$/, '');
    const HILOW_API_ENDPOINT = `${HILOW_API_BASE_URL}/api/orders`;

    // El clientProvidedId viene como SUB_uid_timestamp
    const parts = clientProvidedId.split('_');
    const userId = parts[1] || 'unknown';

    // 1. OBTENER / INICIALIZAR DATOS DEL USUARIO
    let userData: any = null;
    try {
      const userRef = adminFirestore.collection('users').doc(userId);
      const userDoc = await userRef.get();
      userData = userDoc.exists ? userDoc.data() : null;

      if (!userDoc.exists) {
        await userRef.set({
          uid: userId,
          email: customerEmail,
          displayName: customerName,
          createdAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      }
    } catch (userDbErr: any) {
      console.warn('[SUBSCRIPTION] Notice reading/creating user in Firestore:', userDbErr?.message);
    }

    // 2. PRE-REGISTRO DEL PEDIDO (BOX)
    const uniqueOrderId = `BOX-${Date.now()}`;
    try {
      const orderRef = adminFirestore.collection('users').doc(userId).collection('orders').doc(uniqueOrderId);
      const pendingOrderData = {
        id: uniqueOrderId,
        userId: userId,
        status: 'pending_payment',
        total: 4400, // Precio fijo suscripción (44,00 €)
        paymentMethod: 'hilow',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        isSubscription: true,
        customerEmail: customerEmail,
        customerName: customerName,
        items: [{
          productId: 'subscription_club',
          name: 'Monthly Dose Club',
          price: 4400,
          quantity: 1,
          imageUrl: 'https://picsum.photos/seed/sub/200/200'
        }]
      };

      await orderRef.set(pendingOrderData);
      console.log(`[SUBSCRIPTION] Pending order created: ${uniqueOrderId} for user: ${userId}`);
    } catch (orderDbErr: any) {
      console.warn('[SUBSCRIPTION] Warning saving pending order in Firestore:', orderDbErr?.message);
    }

    // 3. DNA FOR HILOW: SUB_<userId>_<uniqueOrderId>_<timestamp>
    const structuredInternalOrderId = `SUB_${userId}_${uniqueOrderId}_${Date.now()}`;

    const payload = {
      storeId: HILOW_STORE_ID,
      internalOrderId: structuredInternalOrderId,
      amountInCents: 4400,
      productName: 'Monthly Dose Club',
      isSubscription: true,
      successUrl: successUrl,
      cancelUrl: cancelUrl,
    };

    let checkoutUrl: string | null = null;

    // 4. INTENTAR SOLICITUD A LA API DE HILOW SI HAY API KEY DISPONIBLE
    if (HILOW_API_KEY) {
      try {
        const apiResponse = await fetch(HILOW_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${HILOW_API_KEY}`,
          },
          body: JSON.stringify(payload),
        });

        const responseText = await apiResponse.text();
        let data: any = null;
        try {
          data = JSON.parse(responseText);
        } catch {
          data = null;
        }

        if (apiResponse.ok && data && data.hilowOrderId) {
          checkoutUrl = `${HILOW_PAY_ORIGIN}/pay/${data.hilowOrderId}`;
        } else {
          console.warn('[SUBSCRIPTION] Respuesta no exitosa de API Hilow:', {
            status: apiResponse.status,
            data,
          });
        }
      } catch (apiErr: any) {
        console.warn('[SUBSCRIPTION] Error llamando API de Hilow:', apiErr?.message);
      }
    } else {
      console.log('[SUBSCRIPTION] HILOW_API_KEY no presente en entorno, usando pasarela directa alojada de Hilow.');
    }

    // 5. FALLBACK SEGURO: Si no se obtuvo URL de la API dinámica, usar la pasarela alojada directa de Hilow
    if (!checkoutUrl) {
      checkoutUrl = `${HILOW_PAY_ORIGIN}/pay/${structuredInternalOrderId}`;
    }

    return NextResponse.json({
      success: true,
      checkoutUrl,
      orderId: uniqueOrderId,
      internalOrderId: structuredInternalOrderId,
    });

  } catch (error: any) {
    console.error('[API FATAL ERROR in create-subscription]:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Internal error while processing subscription' },
      { status: 500 }
    );
  }
}
