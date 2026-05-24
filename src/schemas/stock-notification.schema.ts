import { z } from 'zod';

export const stockNotificationSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  // Changed from priceId to productId
  productId: z.string().min(1, { message: 'El ID del producto es requerido.' }),
});