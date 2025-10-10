
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, collectionGroup, getDocs, query, orderBy } from 'firebase/firestore';
import type { Order } from '@/lib/types';

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
  return new Date(0).toISOString();
};

export async function GET() {
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
        // Evita duplicados si una reserva también existe como pedido (poco probable pero seguro)
        if (!allOrdersRaw.some(o => o.id === orderData.id)) {
            allOrdersRaw.push({ ...orderData, path: doc.ref.path });
        }
    });
    
    // Ordenar la lista combinada final por fecha
    const sortedOrders = allOrdersRaw.sort((a, b) => {
        const dateA = new Date(toDateSafe(a.createdAt)).getTime();
        const dateB = new Date(toDateSafe(b.createdAt)).getTime();
        return dateB - dateA;
    });

    // **CRÍTICO**: Serializar los datos antes de enviarlos como JSON
    const safeOrders: Order[] = sortedOrders.map(order => ({
        ...order,
        createdAt: toDateSafe(order.createdAt),
    }));
    
    return NextResponse.json(safeOrders);

  } catch (error) {
    console.error("Error fetching admin orders for API:", error);
    return NextResponse.json({ message: 'Error interno del servidor al obtener los pedidos.' }, { status: 500 });
  }
}
