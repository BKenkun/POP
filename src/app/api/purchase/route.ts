
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const INTERMEDIARY_API_URL = 'https://studio--studio-953389996-b1a64.us-central1.hosted.app/api/purchase';
const YOUR_DOMAIN = process.env.NEXT_PUBLIC_BASE_URL;

// This schema validates the complete payload we now expect from the client
const PurchasePayloadSchema = z.object({
  orderId: z.string(),
  cartItems: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    imageUrl: z.string().url(),
  })),
  total: z.number(),
  priceInCents: z.number(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  shippingAddress: z.object({
    line1: z.string(),
    line2: z.string().nullable(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
    phone: z.string(),
  }),
  billingDetails: z.any().nullable(),
  coupon: z.any().nullable(),
  userId: z.string(),
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
    
    // The intermediary needs a specific set of data.
    // We pass the entire original payload in metadata for the webhook to use later.
    const detailsForIntermediary = {
      priceInCents,
      orderId,
      successUrl: `${YOUR_DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${YOUR_DOMAIN}/checkout`,
      metadata: { 
        originalPayload: JSON.stringify(validation.data) 
      }
    };
    
    // Llama al servicio intermediario
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

    return NextResponse.json({ checkoutUrl: responseData.checkoutUrl });

  } catch (error: any) {
    console.error('Error en /api/purchase:', error);
    // Refined error message to avoid confusion
    return NextResponse.json({ error: `Hubo un error interno al procesar el pago. Por favor, verifica los parámetros enviados.` }, { status: 500 });
  }
}
