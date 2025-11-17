
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const INTERMEDIARY_API_URL = 'https://studio--studio-953389996-b1a64.us-central1.hosted.app/api/purchase';

const PurchasePayloadSchema = z.object({
  storeId: z.string(),
  priceInCents: z.number().int().positive(),
  orderId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  metadata: z.record(z.any()),
});

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const validation = PurchasePayloadSchema.safeParse(payload);
    
    if (!validation.success) {
      console.error("Invalid payload for /api/purchase:", validation.error.flatten());
      return NextResponse.json({ error: 'Datos de pedido inválidos enviados desde el cliente.', details: validation.error.flatten() }, { status: 400 });
    }
    
    const detailsForIntermediary = validation.data;
    
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
