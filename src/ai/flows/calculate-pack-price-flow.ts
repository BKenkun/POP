
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
export type PackCalculationInput = z.infer<typeof PackCalculationInputSchema>;


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
    const originalTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
    
    const MINIMUM_FOR_DISCOUNT = 7000; // 70 euros in cents
    let discountPercent = 0;

    if (originalTotal >= MINIMUM_FOR_DISCOUNT) {
        if (totalQuantity <= 5) {
            discountPercent = 0.05; // 5%
        } else if (totalQuantity >= 6 && totalQuantity <= 11) {
            discountPercent = 0.08; // 8%
        } else if (totalQuantity >= 12 && totalQuantity <= 18) {
            discountPercent = 0.12; // 12%
        }
        // No discount for more than 18 items in the pack builder, per the strategy
    }

    const savings = originalTotal * discountPercent;
    const discountedTotal = originalTotal - savings;

    return {
      originalTotal,
      discountedTotal: Math.round(discountedTotal),
      savings: Math.round(savings),
    };
  }
);
