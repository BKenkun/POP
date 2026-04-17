import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint actualizado según la guía oficial de Hilow Global.
 * Usa el endpoint inteligente único para todo tipo de órdenes.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, successUrl, cancelUrl } = body;

    if (!orderId || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Faltan campos obligatorios en la petición' }, { status: 400 });
    }

    const HILOW_API_KEY = process.env.HILOW_API_KEY;
    const HILOW_STORE_ID = process.env.HILOW_STORE_ID || 'comprarpopperonline.com';
    const HILOW_API_ENDPOINT = 'https://hilowglobal.com/api/orders';

    if (!HILOW_API_KEY) {
      console.error('[SUBSCRIPTION] Error: HILOW_API_KEY no configurada.');
      return NextResponse.json({ error: 'Configuración de servidor incompleta (HILOW_API_KEY)' }, { status: 500 });
    }

    // Esquema exacto solicitado por Hilow para suscripciones
    const payload = {
      storeId: HILOW_STORE_ID,
      internalOrderId: orderId, // Ej: SUB_uid_timestamp
      amountInCents: 4400, // Precio fijo de la Dosis Mensual
      productName: "Club Dosis Mensual (Suscripción)",
      isSubscription: true, // Flag crítico para activar Stripe Billing
      successUrl: successUrl,
      cancelUrl: cancelUrl,
    };

    console.log(`[API] Iniciando suscripción en Hilow. Order: ${orderId}`);

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
      console.error('[API] Respuesta no JSON de Hilow:', responseText);
      return NextResponse.json({ 
        error: 'Respuesta inválida del servidor de pagos', 
        details: responseText.substring(0, 100) 
      }, { status: 502 });
    }

    if (!apiResponse.ok) {
      console.error('[API] Hilow denegó la petición:', data);
      return NextResponse.json({ error: data.message || 'Error en la API de Hilow' }, { status: apiResponse.status });
    }

    // Hilow devuelve hilowOrderId, nosotros construimos la URL de redirección
    if (data.hilowOrderId) {
      const checkoutUrl = `https://hilowglobal.com/pay/${data.hilowOrderId}`;
      return NextResponse.json({ checkoutUrl });
    } else {
      console.error('[API] No se recibió hilowOrderId:', data);
      return NextResponse.json({ error: 'No se generó el ID de pago correctamente' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[API FATAL ERROR]:', error.message);
    return NextResponse.json({ error: 'Error interno al procesar la suscripción' }, { status: 500 });
  }
}
