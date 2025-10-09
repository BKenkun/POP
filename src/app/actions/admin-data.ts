
'use server';

import { db } from '@/lib/firebase';
import { Order, Product } from '@/lib/types';
import { getAdminSession } from '@/app/actions/admin-auth';
import { collection, collectionGroup, getDocs, query, where, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { cbdProducts } from '@/lib/cbd-products';

// This is a server-only function
async function verifyAdmin() {
    const session = await getAdminSession();
    if (!session?.isAdmin) {
        throw new Error('Not authenticated');
    }
}

async function fetchAllOrders(): Promise<Order[]> {
    const userOrdersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
    const reservationsQuery = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));

    const [userOrdersSnap, guestOrdersSnap] = await Promise.all([
        getDocs(userOrdersQuery),
        getDocs(reservationsQuery),
    ]);

    const userOrders = userOrdersSnap.docs.map(doc => doc.data() as Order);
    const guestOrders = guestOrdersSnap.docs.map(doc => doc.data() as Order);

    const combined = [...userOrders, ...guestOrders];
    const unique = Array.from(new Map(combined.map(order => [order.id, order])).values());
    
    // Sort after combining and ensuring uniqueness
    unique.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA;
    });

    return unique;
}

export async function getAdminDashboardData() {
    await verifyAdmin();

    const allOrders = await fetchAllOrders();
    const allProducts: Product[] = cbdProducts;
    
    const recentOrders = allOrders.slice(0, 5);
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = allOrders.length;

    return {
        totalRevenue,
        totalOrders,
        totalProducts: allProducts.length,
        recentOrders,
        topClients: [], 
        topProducts: [],
    };
}

export async function getAllAdminOrders(): Promise<Order[]> {
    await verifyAdmin();
    const orders = await fetchAllOrders();
    // Serialize Timestamps to strings before sending to the client
    return orders.map(order => ({
        ...order,
        createdAt: order.createdAt?.toDate ? order.createdAt.toDate().toISOString() : new Date(0).toISOString(),
    }));
}


export async function getAdminOrderById(orderId: string): Promise<Order | null> {
    await verifyAdmin();
    if (!orderId) return null;

    let order: Order | null = null;
    let path: string | null = null;

    const ordersQuery = query(collectionGroup(db, 'orders'), where('id', '==', orderId));
    const orderSnap = await getDocs(ordersQuery);
    
    if (!orderSnap.empty) {
        path = orderSnap.docs[0].ref.path;
        const docRef = doc(db, path);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
             order = docSnap.data() as Order;
        }
    } else {
        const reservationRef = doc(db, 'reservations', orderId);
        const reservationSnap = await getDoc(reservationRef);
        if (reservationSnap.exists()) {
            order = reservationSnap.data() as Order;
        }
    }

    return order;
}

// You might need a new function for getting customer data
export async function getAllAdminCustomers() {
    await verifyAdmin();
    const { getAuth } = await import('firebase-admin/auth');
    const auth = getAuth();
    
    const listUsersResult = await auth.listUsers(1000);
    const users = listUsersResult.users.map(userRecord => {
        return {
            uid: userRecord.uid,
            email: userRecord.email || 'No Email',
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            disabled: userRecord.disabled,
            creationTime: userRecord.metadata.creationTime,
        };
    });
    return users;
}

    