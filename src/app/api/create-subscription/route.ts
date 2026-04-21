import { NextRequest, NextResponse } from 'next/server';
import { firestore as adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Endpoint para iniciar el flujo de suscripción en Hilow con pre-registro en Firestore.
 * 1. Crea un pedido con estado 'pending_payment' en la DB local.
 * 2. Genera el ADN del ID para Hilow.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId: clientProvidedId, successUrl, cancelUrl } = body;

    if (!clientProvidedId || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Faltan campos obligatorios en la petición' }, { status: 400 });
    }

    const HILOW_API_KEY = process.env.HILOW_API_KEY;
    const HILOW_STORE_ID = process.env.HILOW_STORE_ID || 'comprarpopperonline.com';
    const HILOW_API_ENDPOINT = 'https://hilowglobal.com/api/orders';

    if (!HILOW_API_KEY) {
      console.error('[SUBSCRIPTION] Error: HILOW_API_KEY no configurada.');
      return NextResponse.json({ error: 'Configuración de servidor incompleta (HILOW_API_KEY)' }, { status: 500 });
    }

    // El clientProvidedId viene como SUB_uid_timestamp
    const parts = clientProvidedId.split('_');
    const userId = parts[1] || 'unknown';
    
    // 1. OBTENER DATOS DEL USUARIO
    const userRef = adminFirestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : null;

    if (!userData) {
        throw new Error('Usuario no encontrado en la base de datos.');
    }

    // 2. PRE-REGISTRO DEL PEDIDO (BOX)
    const uniqueOrderId = `BOX-${Date.now()}`;
    const orderRef = userRef.collection('orders').doc(uniqueOrderId);

    const pendingOrderData = {
        id: uniqueOrderId,
        userId: userId,
        status: 'pending_payment',
        total: 4400, // Precio fijo suscripción
        paymentMethod: 'hilow',
        createdAt: FieldValue.serverTimestamp(),
        isSubscription: true,
        customerEmail: userData.email || 'member@comprarpopperonline.com',
        customerName: userData.displayName || 'Miembro del Club',
        items: [{
            productId: 'subscription_club',
            name: 'Club Dosis Mensual',
            price: 4400,
            quantity: 1,
            imageUrl: 'https://picsum.photos/seed/sub/200/200'
        }]
    };

    await orderRef.set(pendingOrderData);
    console.log(`[SUBSCRIPTION] Pedido pendiente creado: ${uniqueOrderId} para usuario: ${userId}`);

    // 3. ADN FINAL PARA HILOW: SUB_<userId>_<uniqueOrderId>_<timestamp>
    const structuredInternalOrderId = `SUB_${userId}_${uniqueOrderId}_${Date.now()}`;

    const payload = {
      storeId: HILOW_STORE_ID,
      internalOrderId: structuredInternalOrderId,
      amountInCents: 4400,
      productName: "Club Dosis Mensual",
      isSubscription: true,
      successUrl: successUrl,
      cancelUrl: cancelUrl,
    };

    const apiResponse = await fetch(HILOW_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HILOW_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await apiResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json({ error: 'Respuesta inválida del servidor de pagos' }, { status: 502 });
    }

    if (!apiResponse.ok) {
      return NextResponse.json({ error: data.message || 'Error en la API de Hilow' }, { status: apiResponse.status });
    }

    if (data.hilowOrderId) {
      const checkoutUrl = `https://hilowglobal.com/pay/${data.hilowOrderId}`;
      return NextResponse.json({ checkoutUrl });
    } else {
      return NextResponse.json({ error: 'No se generó el ID de pago correctamente' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[API FATAL ERROR]:', error.message);
    return NextResponse.json({ error: error.message || 'Error interno al procesar la suscripción' }, { status: 500 });
  }
}
