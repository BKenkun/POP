import { z } from 'zod';

export const PackItemSchema = z.object({
  id: z.string(),
  price: z.number(),
  quantity: z.number(),
  size: z.string().optional(),
});

export const PackCalculationInputSchema =
  z.array(PackItemSchema);

export const PackItemBriefSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
});

export const PackCalculationOutputSchema = z.object({
  originalTotal: z.number(),
  discountedTotal: z.number(),
  savings: z.number(),
});

export type PackItem =
  z.infer<typeof PackItemSchema>;

export type PackCalculationInput =
  z.infer<typeof PackCalculationInputSchema>;

export type PackItemBrief =
  z.infer<typeof PackItemBriefSchema>;

export type PackCalculationOutput =
  z.infer<typeof PackCalculationOutputSchema>;