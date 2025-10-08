

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
    name: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
}

export interface Order {
  id: string; // Custom Reservation ID like CBD-R12A3G
  userId?: string; // Optional, for guest checkouts
  createdAt: Date;
  status: 'Reserva Recibida' | 'Pago Pendiente de Verificación' | 'Pago Confirmado / En Reparto' | 'Entregado / Finalizado' | 'Cancelado';
  total: number; // Total amount in cents
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'cod' | 'prepaid';
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
