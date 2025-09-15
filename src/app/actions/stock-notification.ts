
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

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

  // --- Lógica de la Base de Datos (Implementación Real) ---
  // Guardamos la información en la colección `stockSubscriptions`.
  // El ID del documento combina el ID del producto y el email para evitar duplicados.
  try {
    const subscriptionRef = doc(db, 'stockSubscriptions', `${productId}_${email.toLowerCase()}`);
    await setDoc(subscriptionRef, {
      productId: productId,
      email: email.toLowerCase(),
      createdAt: serverTimestamp(),
      notified: false, // Para controlar si ya se ha enviado la notificación
    }, { merge: true }); // Usamos merge por si ya existe, para no sobreescribir la fecha de creación original
  } catch (dbError) {
    console.error("Error saving stock notification to Firestore:", dbError);
    return { success: false, error: 'No se pudo guardar tu solicitud en la base de datos.' };
  }
  
  console.log(`Petición de stock guardada: El usuario con email ${email} quiere el producto ${productId}.`);

  // Devolvemos éxito porque la petición del usuario se ha guardado correctamente.
  return { success: true };
}
