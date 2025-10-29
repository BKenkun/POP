
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';


export interface Product {
  id: string;
  sku?: string; // Stock Keeping Unit
  active?: boolean;
  name: string;
  description?: string | null;
  longDescription?: string | null;
  price: number; // Price in cents. If offer is active, this is the sale price.
  originalPrice?: number; // Original price in cents, only set when an offer is active.
  imageUrl: string;
  imageHint?: string; // Optional hint for AI image search
  tags?: string[];
  internalTags?: string[];
  galleryImages?: string[];
  stock?: number;
  productDetails?: string;
  brand?: string;
  size?: string;
  composition?: string;
  url?: string;
  web?: string; // To which web portal it belongs
  // --- New Offer Fields ---
  offerStartDate?: string | null; // ISO Date string
  offerEndDate?: string | null; // ISO Date string
  // --- New Accounting Fields ---
  cost?: number; // Cost of the product in cents
  includesVat?: boolean;
  vatPercentage?: number; // e.g., 21 for 21%
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
  phone: z.string().nullable(),
});

const paymentMethods = ['cod_cash', 'cod_card', 'cod_bizum', 'prepaid_bizum', 'prepaid_transfer', 'crypto'] as const;

// Helper function to handle different date types (Timestamp, Date, string)
const dateSchema = z.preprocess((arg) => {
  if (arg instanceof Timestamp) {
    return arg.toDate();
  }
  if (typeof arg === 'string' || arg instanceof Date) {
    return new Date(arg);
  }
  // This handles the Firestore Admin SDK Timestamp which is an object with _seconds and _nanoseconds
  if (typeof arg === 'object' && arg !== null && '_seconds' in arg && '_nanoseconds' in arg) {
    return new Timestamp((arg as any)._seconds, (arg as any)._nanoseconds).toDate();
  }
  // Return undefined for zod to handle validation error
  return undefined;
}, z.date({ required_error: "Invalid date" }));


export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: dateSchema,
  status: z.enum(['pending', 'shipped', 'delivered', 'cancelled', 'entregado', 'enviado', 'pendiente', 'cancelado', 'Reserva Recibida', 'Pago Pendiente de Verificación', 'En Reparto', 'Incidencia']),
  total: z.number(),
  items: z.array(OrderItemSchema),
  customerName: z.string(),
  customerEmail: z.string().email(),
  shippingAddress: ShippingAddressSchema.nullable(),
  paymentMethod: z.enum(paymentMethods).optional(),
  path: z.string().optional(),
  deliveryDni: z.string().optional(),
  deliverySignature: z.string().optional(),
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
    sub_id: string; // The subscription ID from NOWPayments
    status: 'active' | 'cancelled' | 'past_due';
    // We don't get period end from NOWPayments directly in the same way as Stripe
    // We might rely on webhooks to update the status
}

// For the Admin flow
export type OrderWithUserName = {
    id: string;
    createdAt: string;
    status: string;
    total: number;
    userName: string;
};
