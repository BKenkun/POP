import { z } from 'zod';

export const OrderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  imageUrl: z.string().url(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;