
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const stockNotificationSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  // Changed from priceId to productId
  productId: z.string().min(1, { message: 'El ID del producto es requerido.' }),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validation = stockNotificationSchema.safeParse(body);

  if (!validation.success) {
    const firstError = validation.error.errors[0]?.message || 'Datos inválidos.';
    return NextResponse.json({ success: false, message: firstError }, { status: 400 });
  }

  const { email, productId } = validation.data;

  const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
  if (!KLAVIYO_API_KEY) {
    console.warn("Klaviyo API Key is not set. Cannot subscribe to back in stock.");
    // Simulate success in dev environment if key is missing
    if (process.env.NODE_ENV === 'development') {
        console.log(`[SIMULATION] Subscribed ${email} to back-in-stock for product ${productId}.`);
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, message: 'La configuración del servicio de notificaciones no está disponible.' }, { status: 500 });
  }

  // Klaviyo requires a specific variant ID format.
  // We are creating a mock variant ID based on the product ID.
  // In a real multi-variant system, you'd fetch the actual variant ID.
  const variantId = `$custom:::$default:::${productId}`;

  const payload = {
    data: {
      type: 'back-in-stock-subscription',
      attributes: {
        profile: {
          email: email
        }
      },
      relationships: {
        variant: {
          data: {
            type: 'catalog-variant',
            id: variantId,
          }
        }
      }
    }
  };

  try {
    const response = await fetch('https://a.klaviyo.com/api/back-in-stock-subscriptions/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'accept': 'application/json',
        'content-type': 'application/json',
        'revision': '2024-02-15',
      },
      body: JSON.stringify(payload)
    });
      
    if (response.status === 202) {
      console.log(`✅ Successfully subscribed ${email} to back-in-stock for product ${productId}.`);
      return NextResponse.json({ success: true });
    } else {
      const errorData = await response.json();
      console.error(`❌ Klaviyo API Error for Back in Stock subscription:`, JSON.stringify(errorData, null, 2));
      const detail = errorData.errors?.[0]?.detail || 'No se pudo registrar la solicitud de notificación.';
      return NextResponse.json({ success: false, message: detail }, { status: response.status });
    }
  } catch (error) {
    console.error("❌ Failed to send subscription to Klaviyo:", error);
    return NextResponse.json({ success: false, message: 'Ocurrió un error de red al intentar registrar la notificación.' }, { status: 500 });
  }
}
