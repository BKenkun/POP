
export interface Product {
  id: string;
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
