'use server';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const INTERMEDIARY_API_URL = 'https://studio--studio-953389996-b1a64.us-central1.hosted.app/api/purchase';

// This schema now exactly matches what the intermediary expects.
const PurchasePayloadSchema = z.object({
  priceInCents: z.number(),
  orderId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  metadata: z.record(z.any()), // We expect a metadata object, not a string
});

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const validation = PurchasePayloadSchema.safeParse(payload);
    
    if (!validation.success) {
      console.error("Invalid payload for /api/purchase:", validation.error.flatten());
      return NextResponse.json({ error: 'Datos de pedido inválidos enviados desde el cliente.' }, { status: 400 });
    }
    
    // The payload is already in the correct format for the intermediary
    const detailsForIntermediary = validation.data;
    
    const intermediaryResponse = await fetch(INTERMEDIARY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(detailsForIntermediary),
    });

    const responseData = await intermediaryResponse.json();

    if (!intermediaryResponse.ok) {
      // Forward the error from the intermediary
      throw new Error(responseData.error || 'Error al comunicarse con el servicio de pago.');
    }

    // Forward the checkoutUrl to the client
    return NextResponse.json({ checkoutUrl: responseData.checkoutUrl });

  } catch (error: any) {
    console.error('Error en /api/purchase:', error);
    return NextResponse.json({ error: `Hubo un error interno al procesar el pago. Por favor, verifica los parámetros enviados.` }, { status: 500 });
  }
}
