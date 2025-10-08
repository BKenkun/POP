

export interface Product {
  id: string;
  sku?: string; // Stock Keeping Unit
  active?: boolean;
  priceId?: string; 
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
  id: string;
  userId: string;
  createdAt: Date;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'entregado' | 'enviado' | 'pendiente' | 'cancelado';
  total: number; // Total amount in cents
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress | null;
  paymentMethod?: 'cod' | 'prepaid';
}


// --- NEW SUBSCRIPTION TYPES ---

export interface MonthlySelection {
    [key: string]: string; // e.g., { popper1: 'prod_xxxx', popper2: 'prod_yyyy', ... }
}

// This type will be stored in Firestore under the user's document
export interface UserSubscription {
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodEnd: Date;
    monthlySelection: MonthlySelection;
}
