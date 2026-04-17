import { NextRequest, NextResponse } from 'next/server';

const HILOW_API_URL = 'https://hilowglobal.com/api/create-subscription';

/**
 * Endpoint para iniciar una sesión de suscripción con Hilow.
 * Se ha mejorado la robustez para evitar errores 500 al recibir respuestas no válidas.
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

    if (!HILOW_API_KEY) {
      console.error('[SUBSCRIPTION] Error: HILOW_API_KEY no configurada en el servidor.');
      return NextResponse.json({ error: 'Configuración de servidor incompleta (HILOW_API_KEY)' }, { status: 500 });
    }

    const payload = {
      storeId: HILOW_STORE_ID,
      subscriptionDetails: {
        amountInCents: 4400,
        interval: 'month',
        productName: 'Club Mensual Dosis Mensual',
      },
      orderId,
      successUrl,
      cancelUrl,
    };

    console.log(`[API] Llamando a Hilow para suscripción. Store: ${HILOW_STORE_ID}, Order: ${orderId}`);

    const apiResponse = await fetch(HILOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HILOW_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    // PASO CRÍTICO: Leemos primero como texto plano
    const responseText = await apiResponse.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[API] Hilow no devolvió un JSON. Respuesta recibida:', responseText);
      return NextResponse.json({ 
        error: 'Hilow devolvió una respuesta no válida (no es JSON)', 
        details: responseText.substring(0, 200), // Mostramos el principio del error (puede ser HTML)
        status: apiResponse.status 
      }, { status: 502 }); // Bad Gateway
    }

    if (!apiResponse.ok) {
      console.error('[API] Hilow respondió con error:', data);
      return NextResponse.json({ 
        error: data.error || data.message || 'Error en la API de Hilow',
        status: apiResponse.status 
      }, { status: apiResponse.status });
    }

    // Buscamos el link de pago en los formatos conocidos
    const checkoutUrl = data.checkoutUrl || data.url || (data.hilowOrderId ? `https://hilowglobal.com/pay/${data.hilowOrderId}` : null);

    if (!checkoutUrl) {
      console.error('[API] No se encontró URL de pago en la respuesta:', data);
      return NextResponse.json({ 
        error: 'No se recibió un enlace de pago válido de Hilow', 
        rawResponse: data 
      }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl });

  } catch (error: any) {
    console.error('[API FATAL ERROR]:', error.message || error);
    return NextResponse.json({ 
      error: 'Error interno al procesar la suscripción', 
      details: error.message 
    }, { status: 500 });
  }
}
