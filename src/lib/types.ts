export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number; // Price in cents
  imageUrl: string;
  imageHint: string;
  tags?: string[];
  internalTags?: string[];
  galleryImages?: string[];
  stock?: number;
  productDetails?: Record<string, string>;
}

export interface CartItem extends Product {
  quantity: number;
}
