
'use server';

import { z } from 'zod';

const stockNotificationSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  productId: z.string().min(1, { message: 'El ID del producto es requerido.' }),
});

export async function subscribeToStockNotification(
    data: z.infer<typeof stockNotificationSchema>
): Promise<{ success: boolean, error?: string }> {
  
  const validation = stockNotificationSchema.safeParse(data);

  if (!validation.success) {
    // Return the first error message
    const firstError = validation.error.errors[0]?.message || 'Datos inválidos.';
    return { success: false, error: firstError };
  }

  const { email, productId } = validation.data;

  // --- Lógica de la Base de Datos (Simulada por ahora) ---
  // En una implementación real, aquí guardarías la información en Firestore,
  // por ejemplo, en una colección `stockSubscriptions`.
  //
  // Ejemplo con Firestore (requeriría importar `db` de `@/lib/firebase`):
  /*
  try {
    const subscriptionRef = doc(db, 'stockSubscriptions', `${productId}_${email}`);
    await setDoc(subscriptionRef, {
      productId: productId,
      email: email,
      createdAt: serverTimestamp(),
      notified: false, // Para controlar si ya se ha enviado la notificación
    });
  } catch (dbError) {
    console.error("Error saving stock notification to Firestore:", dbError);
    return { success: false, error: 'No se pudo guardar tu solicitud en la base de datos.' };
  }
  */
  
  console.log(`SIMULACIÓN: El usuario con email ${email} se ha suscrito a las notificaciones de stock para el producto ${productId}.`);

  // Devolvemos éxito porque la parte visible para el usuario está completa.
  return { success: true };
}
