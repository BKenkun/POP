
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

// Input Schema: A list of items with id, price, quantity, and size.
export const PackItemSchema = z.object({
  id: z.string(),
  price: z.number(), // Price in cents
  quantity: z.number(),
  size: z.string().optional(),
});
export type PackItem = z.infer<typeof PackItemSchema>;

const PackCalculationInputSchema = z.array(PackItemSchema);
export type PackCalculationInput = z.infer<typeof PackCalculationInputSchema>;

// Output Schema: The original total, the discounted total, and the savings.
const PackCalculationOutputSchema = z.object({
  originalTotal: z.number(),
  discountedTotal: z.number(),
  savings: z.number(),
});
export type PackCalculationOutput = z.infer<typeof PackCalculationOutputSchema>;


// Exported function to be called from the client component.
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
    let weightedDiscountSum = 0;
    let totalQuantity = 0;

    const sizeDiscounts: { [key: string]: number } = {
      '10ml': 0.18, // 18% discount for 10ml
      '15ml': 0.12, // 12% discount for 15ml
      '25ml': 0.08, // 8% discount for 25ml
    };

    items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      originalTotal += itemTotal;
      totalQuantity += item.quantity;

      const sizeKey = item.size || '10ml'; // Default to 10ml if size is not present
      const discountRate = sizeDiscounts[sizeKey] || sizeDiscounts['10ml'];
      
      // The discount for this item is its total value multiplied by its discount rate.
      weightedDiscountSum += itemTotal * discountRate;
    });

    if (totalQuantity === 0) {
      return { originalTotal: 0, discountedTotal: 0, savings: 0 };
    }

    // The final discount is the average of the weighted discounts.
    const averageDiscountRate = weightedDiscountSum / originalTotal;
    const totalDiscount = originalTotal * averageDiscountRate;
    
    const discountedTotal = Math.round(originalTotal - totalDiscount);
    const savings = originalTotal - discountedTotal;

    return {
      originalTotal,
      discountedTotal,
      savings,
    };
  }
);
