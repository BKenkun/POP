import { z } from 'zod';

export const addressSchema = z.object({
  alias: z.string().min(2, "El alias debe tener al menos 2 caracteres (ej. Casa, Trabajo)."),
  name: z.string().min(3, "El nombre del destinatario es requerido."),
  phone: z.string().min(9, "El teléfono es requerido."),
  street: z.string().min(5, "La calle debe tener al menos 5 caracteres."),
  city: z.string().min(2, "La ciudad debe tener al menos 2 caracteres."),
  state: z.string().min(2, "El estado/provincia es requerido."),
  postalCode: z.string().regex(/^\d{5}$/, "El código postal debe tener 5 dígitos."),
  country: z.string().min(2, "El país debe tener al menos 2 caracteres."),
  isDefault: z.boolean().default(false),
});

export type AddressFormData = z.infer<typeof addressSchema>;