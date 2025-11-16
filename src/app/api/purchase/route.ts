
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const INTERMEDIARY_API_URL = 'https://studio--studio-953389996-b1a64.us-central1.hosted.app/api/purchase';
const YOUR_DOMAIN = process.env.NEXT_PUBLIC_BASE_URL;

const PurchasePayloadSchema = z.object({
  orderId: z.string(),
  priceInCents: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const validation = PurchasePayloadSchema.safeParse(payload);
    
    if (!validation.success) {
      console.error("Invalid payload for /api/purchase:", validation.error.flatten());
      return NextResponse.json({ error: 'Datos de pedido inválidos.' }, { status: 400 });
    }
    
    const { orderId, priceInCents } = validation.data;

    if (!YOUR_DOMAIN) {
      throw new Error("La URL base del sitio no está configurada en el servidor. Asegúrate de que NEXT_PUBLIC_BASE_URL esté en tu archivo .env.");
    }
    
    // The intermediary needs a specific set of data
    const detailsForIntermediary = {
      priceInCents,
      orderId,
      successUrl: `${YOUR_DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${YOUR_DOMAIN}/checkout`,
    };
    
    const intermediaryResponse = await fetch(INTERMEDIARY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(detailsForIntermediary),
    });

    const responseData = await intermediaryResponse.json();

    if (!intermediaryResponse.ok) {
      throw new Error(responseData.error || 'Error al comunicarse con el servicio de pago.');
    }

    return NextResponse.json({ checkoutUrl: responseData.checkoutUrl });

  } catch (error: any) {
    console.error('Error en /api/purchase:', error);
    return NextResponse.json({ error: `Hubo un error interno al procesar el pago. Por favor, verifica los parámetros enviados.` }, { status: 500 });
  }
}

