export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number; // Price in cents
  imageUrl: string;
  imageHint: string;
  tag?: string;
  galleryImages?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}
