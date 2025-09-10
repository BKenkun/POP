
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

export const PackCalculationInputSchema = z.array(PackItemSchema);
export type PackCalculationInput = z.infer<typeof PackCalculationInputSchema>;


export const PackCalculationOutputSchema = z.object({
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
    let discountedTotal = 0;
    const MINIMUM_FOR_DISCOUNT = 7000; // 70 euros in cents

    items.forEach(item => {
      originalTotal += item.price * item.quantity;
    });

    if (originalTotal >= MINIMUM_FOR_DISCOUNT) {
        items.forEach(item => {
            const priceInEuros = item.price / 100;
            let discountPercent = 0;

            if (priceInEuros >= 4 && priceInEuros <= 6) {
                discountPercent = 0.02; // 2%
            } else if (priceInEuros >= 7 && priceInEuros <= 8) {
                discountPercent = 0.05; // 5%
            } else if (priceInEuros >= 9 && priceInEuros <= 11) {
                discountPercent = 0.06; // 6%
            } else if (priceInEuros >= 12 && priceInEuros <= 15) {
                discountPercent = 0.07; // 7%
            } else if (priceInEuros > 15) {
                discountPercent = 0.09; // 9%
            }
            
            const discountedItemPrice = item.price * (1 - discountPercent);
            discountedTotal += discountedItemPrice * item.quantity;
        });
    } else {
        // If total is less than 70€, no discount is applied.
        discountedTotal = originalTotal;
    }
    
    const savings = originalTotal - discountedTotal;

    return {
      originalTotal,
      discountedTotal: Math.round(discountedTotal),
      savings: Math.round(savings),
    };
  }
);
