
'use server';

import WebSocket from 'ws';
import { firestore } from './firebase-admin';
import { serverTimestamp, increment } from 'firebase-admin/firestore';
import { trackKlaviyoEvent, formatOrderForKlaviyo } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';

const STORE_ID = 'comprarpopperonline_com';
const SECRET_KEY = process.env.WEBSOCKET_SECRET_KEY || 'CAMBIAME_POR_UN_SECRETO_MUY_SEGURO_COMPARTIDO_CON_LA_TIENDA';
const WEBSOCKET_URL = process.env.NODE_ENV === 'production'
  ? `wss://studio--studio-953389996-b1a64.us-central1.hosted.app/api/orders/subscribe?storeId=${STORE_ID}&token=${SECRET_KEY}`
  : `ws://localhost:9002/api/orders/subscribe?storeId=${STORE_ID}&token=${SECRET_KEY}`;

let ws: WebSocket | null = null;
let reconnectInterval: NodeJS.Timeout | null = null;

function connect() {
  console.log('[WebSocket] Attempting to connect to:', process.env.NODE_ENV === 'production' ? 'wss://...' : WEBSOCKET_URL);

  ws = new WebSocket(WEBSOCKET_URL);

  ws.on('open', () => {
    console.log('[WebSocket] Connection opened successfully.');
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
  });

  ws.on('message', async (message: string) => {
    try {
      console.log('[WebSocket] Received message:', message);
      const data = JSON.parse(message);

      if (data.status === 'completed' && data.order_id) {
        await processCompletedOrder(data);
      } else {
        console.warn('[WebSocket] Received message with unknown format:', data);
      }
    } catch (error) {
      console.error('[WebSocket] Error processing message:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('[WebSocket] Error:', error.message);
  });

  ws.on('close', () => {
    console.log('[WebSocket] Connection closed. Attempting to reconnect in 5 seconds...');
    ws = null;
    if (!reconnectInterval) {
      reconnectInterval = setInterval(connect, 5000);
    }
  });
}

async function processCompletedOrder(data: any) {
  const { order_id } = data;
  
  // The user ID is part of the order_id, e.g., "order_USERID_TIMESTAMP"
  const parts = order_id.split('_');
  if (parts.length < 2 || parts[0] !== 'order') {
     console.error(`[WebSocket] Could not extract userId from order_id: ${order_id}`);
     return;
  }
  const userId = parts[1];

  const orderRef = firestore.collection('users').doc(userId).collection('orders').doc(order_id);

  try {
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
        console.error(`[WebSocket] Order ${order_id} not found in Firestore. Cannot update status.`);
        return;
    }

    const orderData = orderSnap.data() as Order;
    if (orderData.status === 'Reserva Recibida') {
        console.log(`[WebSocket] Order ${order_id} is already marked as 'Reserva Recibida'. Ignoring update.`);
        return;
    }

    await orderRef.update({ status: 'Reserva Recibida' });
    console.log(`[WebSocket] Successfully updated order ${order_id} to 'Reserva Recibida'.`);
    
    // Perform post-payment actions
    const batch = firestore.batch();
    if (orderData.coupon) {
        const couponRef = firestore.collection('coupons').doc(orderData.coupon.code);
        batch.update(couponRef, { usageCount: increment(1) });
    }

    const pointsToAdd = Math.floor(orderData.total / 1000); // 1 point per 10€
    if (pointsToAdd > 0) {
        const userRef = firestore.collection('users').doc(userId);
        batch.update(userRef, { loyaltyPoints: increment(pointsToAdd) });
    }
    await batch.commit();

    // Send emails
    const klaviyoOrderData = await formatOrderForKlaviyo({ ...orderData, id: order_id, createdAt: new Date(orderData.createdAt) }, order_id);
    await trackKlaviyoEvent('Placed Order', orderData.customerEmail, klaviyoOrderData);
    await trackKlaviyoEvent('Admin New Order Notification', 'maryandpopper@gmail.com', klaviyoOrderData);

  } catch (error) {
    console.error(`[WebSocket] Error processing completed order ${order_id}:`, error);
  }
}

// Initialize the connection
if (typeof window === 'undefined') {
  // Ensure this only runs on the server
  connect();
}
