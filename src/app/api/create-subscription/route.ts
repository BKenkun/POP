import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint para iniciar el flujo de suscripción en Hilow.
 * Genera un ID estructurado con "ADN de Pedido" para que el Webhook sea infalible.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId: clientProvidedId, successUrl, cancelUrl } = body;

    // Aunque el cliente envíe un orderId, nosotros construimos uno vitaminado
    // Formato: SUB_userId_uniqueOrderId_timestamp
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

    // Extraemos el UID (asumiendo que viene en el orderId del cliente como SUB_uid_...)
    // o lo obtenemos directamente.
    const parts = clientProvidedId.split('_');
    const userId = parts[1] || 'unknown';
    
    // Generamos un ID de pedido único para esta suscripción (ej: BOX-1741590000)
    const uniqueOrderId = `BOX-${Date.now()}`;
    
    // ADN Final: SUB_uid_orderId_timestamp
    const structuredInternalOrderId = `SUB_${userId}_${uniqueOrderId}_${Date.now()}`;

    const payload = {
      storeId: HILOW_STORE_ID,
      internalOrderId: structuredInternalOrderId,
      amountInCents: 4400, // Precio fijo de la Dosis Mensual
      productName: "Club Dosis Mensual",
      isSubscription: true, // Crítico para activar recurrencia
      successUrl: successUrl,
      cancelUrl: cancelUrl,
    };

    console.log(`[API] Creando pedido de suscripción estructurado: ${structuredInternalOrderId}`);

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

    if (data.hilowOrderId) {
      const checkoutUrl = `https://hilowglobal.com/pay/${data.hilowOrderId}`;
      return NextResponse.json({ checkoutUrl });
    } else {
      return NextResponse.json({ error: 'No se generó el ID de pago correctamente' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[API FATAL ERROR]:', error.message);
    return NextResponse.json({ error: 'Error interno al procesar la suscripción' }, { status: 500 });
  }
}
