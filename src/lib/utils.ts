
import { type Product } from "@/lib/types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(price / 100); // Assuming price is in cents
}


export const getUniqueValues = (products: Product[], key: keyof Product): string[] => {
    const allValues = new Set<string>();
    products.forEach(p => {
        const value = p[key];
        if (typeof value === 'string' && value) {
            allValues.add(value);
        } else if (Array.isArray(value)) {
            value.forEach(v => allValues.add(v));
        }
    });
    return Array.from(allValues).sort();
};
