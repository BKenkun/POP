// This is a temporary API route to bridge the gap between client components
// and server-side admin data fetching.
// In a full server component architecture, this would not be needed.

import { getAllAdminOrders } from "@/app/actions/admin-data";
import { getAdminSession } from "@/app/actions/admin-auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getAdminSession();
    if (!session?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const orders = await getAllAdminOrders();
        // The objects from Firestore might have non-serializable fields (like Timestamps)
        // We need to make sure we're sending plain JSON over the wire.
        const serializableOrders = orders.map(order => ({
            ...order,
            createdAt: order.createdAt.toDate().toISOString(), // Convert Timestamp to ISO string
        }));
        return NextResponse.json(serializableOrders);
    } catch (error) {
        console.error("API Error fetching admin orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
