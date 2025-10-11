
import { z } from 'zod';

export interface Product {
  id: string;
  sku?: string; // Stock Keeping Unit
  active?: boolean;
  name: string;
  description?: string | null;
  longDescription?: string | null;
  price: number; // Price in cents
  imageUrl: string;
  imageHint: string;
  tags?: string[];
  internalTags?: string[];
  galleryImages?: string[];
  stock?: number;
  productDetails?: string;
  brand?: string;
  size?: string;
  composition?: string;
  url?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface PackItem {
    id: string;
    price: number;
    quantity: number;
    size?: string;
}

// A simpler type for passing pack info to the server action
export interface PackItemBrief {
    id: string;
    name: string;
    quantity: number;
}

export type PackCalculationInput = PackItem[];

export interface PackCalculationOutput {
  originalTotal: number;
  discountedTotal: number;
  savings: number;
}

// --- NEW ORDER TYPES ---

export const OrderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  imageUrl: z.string().url(),
});

export const ShippingAddressSchema = z.object({
  line1: z.string().nullable(),
  line2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postal_code: z.string().nullable(),
  country: z.string().nullable(),
});

export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.union([z.date(), z.string(), z.any()]), // Loosened for server/client flexibility
  status: z.enum(['pending', 'shipped', 'delivered', 'cancelled', 'entregado', 'enviado', 'pendiente', 'cancelado', 'Reserva Recibida', 'Pago Pendiente de Verificación']),
  total: z.number(),
  items: z.array(OrderItemSchema),
  customerName: z.string(),
  customerEmail: z.string().email(),
  shippingAddress: ShippingAddressSchema.nullable(),
  paymentMethod: z.enum(['cod_cash', 'cod_card', 'cod_bizum', 'prepaid_bizum', 'prepaid_transfer']).optional(),
  path: z.string().optional(),
});


export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export type OrderStatus = Order['status'];


// --- NEW SUBSCRIPTION TYPES ---

export interface MonthlySelection {
    [key:string]: string; // e.g., { popper1: 'prod_xxxx', popper2: 'prod_yyyy', ... }
}

// This type will be stored in the user's document
export interface UserSubscription {
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodEnd: Date;
    monthlySelection: MonthlySelection;
}
