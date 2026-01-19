
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';

// IMPORTANT: This assumes you have a separate Firebase client instance
// configured to connect to Hilow's Firestore project.
// Let's call it `hilowDb`. You would need to initialize this similar to your main `db`.
import { hilowDb } from '@/lib/firebase-hilow'; // Assuming this file exists

type OrderStatus = 'pending_payment' | 'completed' | 'failed';

interface HilowOrder {
  status: OrderStatus;
  // ... other fields from the Hilow order document
}

/**
 * A React hook to listen for real-time status updates of an order
 * from the Hilow Firestore database. This is intended for UI updates only.
 *
 * @param internalOrderId - Your internal order ID, which corresponds to the document ID in Hilow's DB.
 * @param onStatusChange - A callback function that triggers when the order status changes.
 */
export function useHilowOrderStatus(
  internalOrderId: string | null,
  onStatusChange: (status: OrderStatus) => void
) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!internalOrderId) {
      return;
    }

    // The path to the order document in Hilow's Firestore.
    // Assumes a structure like: /portals/{storeId}/orders/{internalOrderId}
    const storeId = "bukkakery.com"; 
    const orderDocRef = doc(hilowDb, 'portals', storeId, 'orders', internalOrderId);

    const unsubscribe = onSnapshot(
      orderDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const orderData = docSnap.data() as HilowOrder;
          if (orderData.status) {
            // Trigger the callback with the new status
            onStatusChange(orderData.status);
          }
        } else {
          setError('Order not found in the payment system.');
        }
      },
      (err) => {
        console.error('Error listening to Hilow order status:', err);
        setError('Could not connect to the payment system for real-time updates.');
      }
    );

    // Clean up the listener when the component unmounts or the orderId changes.
    return () => unsubscribe();

  }, [internalOrderId, onStatusChange]);

  return { error };
}
