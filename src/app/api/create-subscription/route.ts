import { NextRequest, NextResponse } from 'next/server';

const HILOW_API_URL = 'https://hilowglobal.com/api/create-subscription';

/**
 * Endpoint para iniciar una sesión de suscripción con Hilow.
 * Se han añadido cabeceras de autenticación y validación de API Key.
 */
export async function POST(req: NextRequest) {
  try {
    const { orderId, successUrl, cancelUrl } = await req.json();

    if (!orderId || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Missing required fields: orderId, successUrl, cancelUrl' }, { status: 400 });
    }

    const HILOW_API_KEY = process.env.HILOW_API_KEY;
    if (!HILOW_API_KEY) {
      console.error('HILOW_API_KEY no está configurada en las variables de entorno.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const payload = {
      subscriptionDetails: {
        amountInCents: 4400,
        interval: 'month',
        productName: 'Club mensual',
      },
      orderId, // Formato esperado: SUB_uid_timestamp
      successUrl,
      cancelUrl,
    };

    console.log(`[API] Iniciando suscripción para pedido: ${orderId}`);

    const apiResponse = await fetch(HILOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HILOW_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('[API] Error de Hilow:', data);
      return NextResponse.json({ error: data.error || 'Failed to create subscription session' }, { status: apiResponse.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
