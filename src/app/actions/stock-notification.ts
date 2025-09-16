
'use server';

import { z } from 'zod';

// Now we need the priceId as well
const stockNotificationSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  productId: z.string().min(1), // keep for reference
  priceId: z.string().min(1, { message: 'El ID de la variante es requerido.' }),
});

export async function subscribeToStockNotification(
    data: z.infer<typeof stockNotificationSchema>
): Promise<{ success: boolean, error?: string }> {
  
  const validation = stockNotificationSchema.safeParse(data);

  if (!validation.success) {
    const firstError = validation.error.errors[0]?.message || 'Datos inválidos.';
    return { success: false, error: firstError };
  }

  const { email, priceId } = validation.data;

  const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
  if (!KLAVIYO_API_KEY) {
      console.warn("Klaviyo API Key is not set. Cannot subscribe to back in stock.");
      return { success: false, error: 'La configuración del servicio de notificaciones no está disponible.' };
  }

  // This is the payload for Klaviyo's native Back in Stock API
  // It requires the VARIANT ID, which in Stripe is the PRICE ID.
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
                      // Klaviyo's foreign key for the product variant is `$stripe:::{PRICE_ID}`
                      id: `$stripe:::${priceId}`
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
          console.log(`✅ Successfully subscribed ${email} to back-in-stock for price ${priceId}.`);
          return { success: true };
      } else {
          const errorData = await response.json();
          console.error(`❌ Klaviyo API Error for Back in Stock subscription:`, JSON.stringify(errorData, null, 2));
          // Provide a more specific error if possible
          const detail = errorData.errors?.[0]?.detail || 'No se pudo registrar la solicitud de notificación.';
          return { success: false, error: detail };
      }
  } catch (error) {
      console.error("❌ Failed to send subscription to Klaviyo:", error);
      return { success: false, error: 'Ocurrió un error de red al intentar registrar la notificación.' };
  }
}
