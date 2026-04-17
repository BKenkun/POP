import { NextRequest, NextResponse } from 'next/server';

const HILOW_API_URL = 'https://hilowglobal.com/api/create-subscription';

/**
 * Endpoint para iniciar una sesión de suscripción con Hilow.
 * Se ha añadido el storeId necesario para que Hilow reconozca el portal.
 */
export async function POST(req: NextRequest) {
  try {
    const { orderId, successUrl, cancelUrl } = await req.json();

    if (!orderId || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const HILOW_API_KEY = process.env.HILOW_API_KEY;
    const HILOW_STORE_ID = process.env.HILOW_STORE_ID || 'comprarpopperonline.com';

    if (!HILOW_API_KEY) {
      console.error('[SUBSCRIPTION] Error: HILOW_API_KEY not configured.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const payload = {
      storeId: HILOW_STORE_ID, // CRÍTICO: Hilow necesita el ID del portal
      subscriptionDetails: {
        amountInCents: 4400,
        interval: 'month',
        productName: 'Club mensual',
      },
      orderId, // Prefijo SUB_
      successUrl,
      cancelUrl,
    };

    console.log(`[API] Iniciando suscripción para: ${HILOW_STORE_ID}, Pedido: ${orderId}`);

    const apiResponse = await fetch(HILOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HILOW_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    // Leemos el texto primero para evitar errores si no es JSON (ej. errores 403 de red)
    const responseText = await apiResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[API] La respuesta no es un JSON válido:', responseText);
      throw new Error(`Hilow returned non-JSON response: ${apiResponse.status}`);
    }

    if (!apiResponse.ok) {
      console.error('[API] Error de Hilow:', data);
      return NextResponse.json({ error: data.error || data.message || 'Failed to create subscription' }, { status: apiResponse.status });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('API Route Error:', error.message || error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}
