import { z } from 'zod';

const PackItemSchema = z.object({
  id: z.string(),
  price: z.number(), // Price in cents
  quantity: z.number(),
  size: z.string().optional(),
});

const PackCalculationInputSchema = z.array(PackItemSchema);
export type PackCalculationInput = z.infer<typeof PackCalculationInputSchema>;

const PackCalculationOutputSchema = z.object({
  originalTotal: z.number(),
  discountedTotal: z.number(),
  savings: z.number(),
});
export type PackCalculationOutput = z.infer<typeof PackCalculationOutputSchema>;

/**
 * Calcula de forma determinista el precio y descuento de un pack personalizado
 * sin depender de Genkit ni de APIs de IA externas.
 */
export async function calculatePackPrice(
  input: PackCalculationInput
): Promise<PackCalculationOutput> {
  const items = PackCalculationInputSchema.parse(input);
  const originalTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

  const MINIMUM_FOR_DISCOUNT = 7000; // 70 euros en céntimos
  let discountPercent = 0;

  if (originalTotal >= MINIMUM_FOR_DISCOUNT) {
    if (totalQuantity <= 5) {
      discountPercent = 0.05; // 5%
    } else if (totalQuantity >= 6 && totalQuantity <= 11) {
      discountPercent = 0.08; // 8%
    } else if (totalQuantity >= 12 && totalQuantity <= 18) {
      discountPercent = 0.12; // 12%
    }
  }

  const savings = originalTotal * discountPercent;
  const discountedTotal = originalTotal - savings;

  return {
    originalTotal,
    discountedTotal: Math.round(discountedTotal),
    savings: Math.round(savings),
  };
}
