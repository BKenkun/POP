
'use server';
/**
 * @fileOverview A flow to calculate the dynamic price of a custom popper pack.
 *
 * - calculatePackPrice - A function that handles the price calculation with discounts.
 * - PackCalculationInput - The input type for the calculatePackPrice function.
 * - PackCalculationOutput - The return type for the calculatePackPrice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PackItemSchema = z.object({
  id: z.string(),
  price: z.number(), // Price in cents
  quantity: z.number(),
  size: z.string().optional(),
});

const PackCalculationInputSchema = z.array(PackItemSchema);
type PackCalculationInput = z.infer<typeof PackCalculationInputSchema>;


const PackCalculationOutputSchema = z.object({
  originalTotal: z.number(),
  discountedTotal: z.number(),
  savings: z.number(),
});
export type PackCalculationOutput = z.infer<typeof PackCalculationOutputSchema>;


export async function calculatePackPrice(input: PackCalculationInput): Promise<PackCalculationOutput> {
  return calculatePackPriceFlow(input);
}


const calculatePackPriceFlow = ai.defineFlow(
  {
    name: 'calculatePackPriceFlow',
    inputSchema: PackCalculationInputSchema,
    outputSchema: PackCalculationOutputSchema,
  },
  async (items) => {
    let originalTotal = 0;
    let totalDiscount = 0;

    items.forEach(item => {
      originalTotal += item.price * item.quantity;
      const priceInEuros = item.price / 100;
      let discountPerUnit = 0;

      if (priceInEuros >= 4 && priceInEuros <= 6) {
        discountPerUnit = 100; // 1 euro in cents
      } else if (priceInEuros >= 7 && priceInEuros <= 8) {
        discountPerUnit = 150; // 1.5 euros in cents
      } else if (priceInEuros >= 9 && priceInEuros <= 11) {
        discountPerUnit = 200; // 2 euros in cents
      } else if (priceInEuros >= 12 && priceInEuros <= 15) {
        discountPerUnit = 300; // 3 euros in cents
      } else if (priceInEuros > 15) {
        discountPerUnit = 400; // 4 euros in cents
      }
      
      totalDiscount += discountPerUnit * item.quantity;
    });

    const discountedTotal = Math.max(0, originalTotal - totalDiscount);
    const savings = originalTotal - discountedTotal;

    return {
      originalTotal,
      discountedTotal,
      savings,
    };
  }
);
