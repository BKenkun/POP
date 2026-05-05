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
  offerStartDate?: string | null; // ISO Date string
  offerEndDate?: string | null; // ISO Date string
  cost?: number; // Cost of the product in cents
  includesVat?: boolean;
  vatPercentage?: number; // e.g., 21 for 21%
}

export default Product