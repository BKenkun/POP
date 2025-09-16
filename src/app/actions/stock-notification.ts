
'use server';

import { z } from 'zod';

const stockNotificationSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  productId: z.string().min(1, { message: 'El ID del producto es requerido.' }),
  variantId: z.string().optional(), // Klaviyo uses variant ID, which for us is the same as product ID
});

export async function subscribeToStockNotification(
    data: z.infer<typeof stockNotificationSchema>
): Promise<{ success: boolean, error?: string }> {
  
  const validation = stockNotificationSchema.safeParse(data);

  if (!validation.success) {
    const firstError = validation.error.errors[0]?.message || 'Datos inválidos.';
    return { success: false, error: firstError };
  }

  const { email, productId } = validation.data;
  const variantId = productId; // In our case, the Stripe Product ID is the variant identifier.

  const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
  if (!KLAVIYO_API_KEY) {
      console.warn("Klaviyo API Key is not set. Cannot subscribe to back in stock.");
      return { success: false, error: 'La configuración del servicio de notificaciones no está disponible.' };
  }

  // This is the payload for Klaviyo's native Back in Stock API
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
                      // Klaviyo's foreign key for the product is `$stripe:::{PRODUCT_ID}`
                      id: `$stripe:::${variantId}`
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

      // A 202 status code means the request was accepted.
      if (response.status === 202) {
          console.log(`✅ Successfully subscribed ${email} to back-in-stock notification for product ${productId}.`);
          return { success: true };
      } else {
          const errorData = await response.json();
          console.error(`❌ Klaviyo API Error for Back in Stock subscription:`, JSON.stringify(errorData, null, 2));
          return { success: false, error: 'No se pudo registrar la solicitud de notificación.' };
      }
  } catch (error) {
      console.error("❌ Failed to send subscription to Klaviyo:", error);
      return { success: false, error: 'Ocurrió un error de red al intentar registrar la notificación.' };
  }
}
