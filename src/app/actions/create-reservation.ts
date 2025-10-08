
'use server';

import { CartItem, Order, ShippingAddress } from "@/lib/types";
import { cbdProducts } from "@/lib/cbd-products";

// Helper function to generate a unique alphanumeric order code
function generateOrderCode(): string {
  const prefix = "CBD";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

interface ReservationInput {
    customerDetails: ShippingAddress;
    items: CartItem[];
    total: number;
}

// This is a SERVER ACTION. It runs on the server.
export async function createReservationAction(
    input: ReservationInput,
): Promise<{ orderId: string | null; error?: string }> {
    console.log("Received reservation request:", input);

    // --- 1. Generate Unique Order Code ---
    const orderId = generateOrderCode();
    console.log(`Generated Order ID: ${orderId}`);
    
    // --- 2. Stock Management (Simulation) ---
    // In a real app, this would be a database transaction
    const stockErrors = [];
    for (const item of input.items) {
        const productInDb = cbdProducts.find(p => p.id === item.id);
        if (!productInDb) {
            stockErrors.push(`Producto ${item.name} no encontrado.`);
            continue;
        }
        if (productInDb.stock === undefined || productInDb.stock < item.quantity) {
             stockErrors.push(`Stock insuficiente para ${item.name}.`);
        }
    }

    if (stockErrors.length > 0) {
        console.error("Stock validation failed:", stockErrors);
        return { orderId: null, error: `Error de stock: ${stockErrors.join(' ')}` };
    }

    // If stock is okay, we would decrement it here.
    // For now, we just log it.
    console.log("Stock check passed. Simulating stock reduction.");
    input.items.forEach(item => {
        console.log(`- Reducing stock for ${item.name} by ${item.quantity}`);
    });
    
    // --- 3. Create Order Object (for DB persistence) ---
    const newOrder: Order = {
        id: orderId,
        createdAt: new Date(),
        status: input.customerDetails.paymentMethod === 'prepaid' ? 'Pago Pendiente de Verificación' : 'Reserva Recibida',
        total: input.total,
        items: input.items.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl
        })),
        shippingAddress: input.customerDetails,
        paymentMethod: input.customerDetails.paymentMethod,
    };

    // In a real app, you would save `newOrder` to Firestore here.
    console.log("Order object created. In a real app, this would be saved to Firestore:", newOrder);

    // --- 4. Send Confirmation Email (Simulation) ---
    console.log(`Simulating sending email to ${input.customerDetails.email}...`);
    if (input.customerDetails.paymentMethod === 'prepaid') {
        console.log("Email content: Instructions for Bizum/Transfer");
        console.log(` - Concepto: ${orderId}`);
        console.log(` - IBAN: ESXX XXXX XXXX XXXX XXXX`);
        console.log(` - Bizum: 622 222 222`);
        console.log(" - Instrucción: Responder a este email con el justificante.");
    } else {
        console.log("Email content: Confirmation for Cash on Delivery");
    }

    // --- 5. Return success response ---
    // We return the orderId so the frontend can display it.
    return { orderId: orderId };
}
