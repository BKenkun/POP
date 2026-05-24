import { z } from 'zod';

export const ShippingAddressSchema = z.object({
  line1: z.string().nullable(),
  line2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postal_code: z.string().nullable(),
  country: z.string().nullable(),
  phone: z.string().nullable(),
});

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;