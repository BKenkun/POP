
'use client';
import OrdersClientPage from './orders-client-page';

// This is now a simple client component wrapper.
// The actual data fetching logic has been moved into OrdersClientPage
// to use the client SDK and rely on Firestore rules for security.
export default function AdminOrdersPage() {
  return <OrdersClientPage />;
}
