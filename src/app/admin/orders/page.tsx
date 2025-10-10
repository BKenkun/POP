
import { Order } from "@/lib/types";
import { db } from '@/lib/firebase';
import { collection, collectionGroup, getDocs, query, orderBy } from 'firebase/firestore';
import OrdersClientPage from './orders-client-page';
import { z } from 'zod';

// Zod schema for validation
const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.string(), // Ensure createdAt is expected as a string after serialization
  status: z.string(), // Loosened to string to accept any status from DB
  total: z.number(),
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    imageUrl: z.string(),
  })),
  customerName: z.string(),
  customerEmail: z.string().email(),
  shippingAddress: z.object({
    line1: z.string().nullable(),
    line2: z.string().nullable(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    postal_code: z.string().nullable(),
    country: z.string().nullable(),
  }).nullable(),
  paymentMethod: z.string().optional(),
  path: z.string().optional(),
});


// Helper para convertir Timestamps de Firestore a strings serializables
const toDateSafe = (timestamp: any): string => {
  if (!timestamp) return new Date(0).toISOString();
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  if (typeof timestamp === 'object' && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  // Return a default date for invalid formats
  return new Date(0).toISOString();
};


async function getAllAdminOrders(): Promise<Order[]> {
  try {
    const userOrdersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
    const reservationsQuery = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));

    const [userOrdersSnap, guestOrdersSnap] = await Promise.all([
        getDocs(userOrdersQuery),
        getDocs(reservationsQuery),
    ]);

    const allOrdersRaw: any[] = [];

    userOrdersSnap.forEach(doc => {
        const orderData = doc.data();
        allOrdersRaw.push({ ...orderData, path: doc.ref.path });
    });

    guestOrdersSnap.forEach(doc => {
        const orderData = doc.data();
        if (!allOrdersRaw.some(o => o.id === orderData.id)) {
            allOrdersRaw.push({ ...orderData, path: doc.ref.path });
        }
    });
    
    const sortedOrders = allOrdersRaw.sort((a, b) => {
        const dateA = new Date(toDateSafe(a.createdAt)).getTime();
        const dateB = new Date(toDateSafe(b.createdAt)).getTime();
        return dateB - dateA;
    });

    const validatedOrders: Order[] = [];
    sortedOrders.forEach(order => {
        const serializedOrder = {
            ...order,
            createdAt: toDateSafe(order.createdAt),
        };

        const validationResult = OrderSchema.safeParse(serializedOrder);
        if (validationResult.success) {
            validatedOrders.push(validationResult.data as Order);
        } else {
            console.warn(`[DATA VALIDATION FAILED] Order with ID ${order.id} was filtered out due to invalid structure:`, validationResult.error.flatten().fieldErrors);
        }
    });
    
    return validatedOrders;

  } catch (error) {
    // Estrategia 10: Monitoreo y Alertas en el Servidor
    console.error("Error fetching admin orders directly in Server Component:", error);
    // Devuelve un array vacío en caso de error para evitar que la página se rompa.
    // El componente cliente ya está preparado para mostrar un mensaje si no hay pedidos.
    return [];
  }
}


// --- Componente Contenedor (Servidor) ---
export default async function AdminOrdersPage() {
  const initialOrders = await getAllAdminOrders();
  return <OrdersClientPage initialOrders={initialOrders} />;
}
