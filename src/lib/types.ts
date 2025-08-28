export interface Product {
  id: string;
  name: string;
  price: number; // Price in cents
  imageUrl: string;
  imageHint: string;
  tag?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
