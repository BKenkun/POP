

export interface Product {
  id: string;
  priceId?: string; // Add priceId here
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

export interface OrderItem {
  productId: string;
  name: string;
  price: number; // Price for a single unit
  quantity: number;
  imageUrl: string;
}

export interface ShippingAddress {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
}

export interface Order {
  id: string; // Stripe Checkout Session ID
  userId: string;
  createdAt: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number; // Total amount in cents
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress | null;
}
