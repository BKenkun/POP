
'use server';

import { CartItem, Order, ShippingAddress } from "@/lib/types";
import { cbdProducts } from "@/lib/cbd-products";
import { getFirestore } from "firebase-admin/firestore";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { initializeFirebase } from "@/firebase/server";


// Helper function to generate a unique alphanumeric order code
function generateOrderCode(): string {
  const prefix = "P";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

interface ReservationInput {
    customerDetails: any; // Using 'any' as it comes from a form with a different structure
    items: CartItem[];
    total: number;
    userId?: string; // Optional user ID for logged-in users
}

const getOrderStatus = (paymentMethod: string): string => {
    switch(paymentMethod) {
        case 'prepaid_bizum':
        case 'prepaid_transfer':
            return 'Pago Pendiente de Verificación';
        case 'cod_cash':
        case 'cod_card':
        case 'cod_bizum':
        default:
            return 'Reserva Recibida';
    }
}

// This is a SERVER ACTION. It runs on the server.
export async function createReservationAction(
    input: ReservationInput,
): Promise<{ orderId: string | null; error?: string }> {
    console.log("Received reservation request:", input);
    const { db } = initializeFirebase();

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
        if (productInDb.stock !== undefined && productInDb.stock < item.quantity) {
             stockErrors.push(`Stock insuficiente para ${item.name}.`);
        }
    }

    if (stockErrors.length > 0) {
        console.error("Stock validation failed:", stockErrors);
        return { orderId: null, error: `Error de stock: ${stockErrors.join(' ')}` };
    }

    console.log("Stock check passed. Simulating stock reduction.");
    
    // --- 3. Create Order Object (for DB persistence) ---
     const shippingAddress: ShippingAddress = {
        line1: input.customerDetails.street,
        line2: null,
        city: input.customerDetails.city,
        state: input.customerDetails.state,
        postal_code: input.customerDetails.postalCode,
        country: input.customerDetails.country,
    }
    
    const newOrder: Order = {
        id: orderId,
        userId: input.userId || 'guest',
        createdAt: new Date(), // This will be replaced by serverTimestamp
        status: getOrderStatus(input.customerDetails.paymentMethod),
        total: input.total,
        items: input.items.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl
        })),
        customerName: input.customerDetails.name,
        customerEmail: input.customerDetails.email,
        shippingAddress: shippingAddress,
        paymentMethod: input.customerDetails.paymentMethod as any,
    };

    // --- 4. Save to Firestore ---
    try {
        let docRef;
        if (input.userId) {
            // For registered users, save under their own orders subcollection
            docRef = doc(db, 'users', input.userId, 'orders', orderId);
        } else {
            // For guest users, save to a general 'reservations' collection
            docRef = doc(db, 'reservations', orderId);
        }

        await setDoc(docRef, {
            ...newOrder,
            createdAt: serverTimestamp(), // Use server-side timestamp for accuracy
        });
        console.log(`✅ Order ${orderId} successfully saved to Firestore.`);
    } catch (error) {
        console.error("❌ Firestore save error:", error);
        return { orderId: null, error: "No se pudo guardar la reserva en la base de datos." };
    }


    // --- 5. Send Confirmation Email (Simulation) ---
    console.log(`Simulating sending email to ${input.customerDetails.email}...`);
    if (input.customerDetails.paymentMethod.startsWith('prepaid')) {
        console.log("Email content: Instructions for Bizum/Transfer");
        console.log(` - Concepto: ${orderId}`);
        if(input.customerDetails.paymentMethod === 'prepaid_transfer') {
            console.log(` - IBAN: ESXX XXXX XXXX XXXX XXXX XXXX`);
        } else {
            console.log(` - Bizum: 622 222 222`);
        }
        console.log(" - Instrucción: Responder a este email con el justificante.");
    } else {
        console.log("Email content: Confirmation for Cash on Delivery");
    }

    // --- 6. Return success response ---
    return { orderId: orderId };
}
