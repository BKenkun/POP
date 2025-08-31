export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number; // Price in cents
  imageUrl: string;
  imageHint: string;
  tags?: string[];
  galleryImages?: string[];
  stock?: number;
}

export interface CartItem extends Product {
  quantity: number;
}
