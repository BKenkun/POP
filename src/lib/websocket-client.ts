'use server';

// This file should be imported in a server-side context, e.g., your main server entry file
// to ensure the WebSocket client starts with the server.

import WebSocket from 'ws';
import { firestore } from './firebase-admin';
import { serverTimestamp, increment } from 'firebase-admin/firestore';
import { trackKlaviyoEvent, formatOrderForKlaviyo } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';
import crypto from 'crypto';

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

      // Validate incoming data structure
      if (data.status === 'completed' && data.order_id && data.metadata) {
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
  const { order_id, metadata } = data;
  const { userId, ...orderDetails } = metadata;

  if (!userId) {
    console.error(`[WebSocket] Could not extract userId from metadata for order_id: ${order_id}`);
    return;
  }

  const orderRef = firestore.collection('users').doc(userId).collection('orders').doc(order_id);
  const orderSnap = await orderRef.get();

  if (orderSnap.exists) {
    console.log(`[WebSocket] Order ${order_id} already exists. Ignoring message.`);
    return;
  }
  
  console.log(`[WebSocket] Creating order ${order_id} in Firestore...`);

  const batch = firestore.batch();

  const newOrderData: Omit<Order, 'id'> = {
    ...orderDetails,
    userId,
    status: 'Reserva Recibida',
    createdAt: serverTimestamp() as any,
  };
  batch.set(orderRef, newOrderData);

  if (metadata.coupon) {
    const couponRef = firestore.collection('coupons').doc(metadata.coupon.code);
    batch.update(couponRef, { usageCount: increment(1) });
  }

  const pointsToAdd = Math.floor(metadata.total / 1000); // 1 point per 10€
  if (pointsToAdd > 0) {
    const userRef = firestore.collection('users').doc(userId);
    batch.update(userRef, { loyaltyPoints: increment(pointsToAdd) });
  }

  await batch.commit();
  console.log(`[WebSocket] Successfully created order ${order_id}.`);

  try {
    const klaviyoOrderData = await formatOrderForKlaviyo({ ...newOrderData, id: order_id, createdAt: new Date() }, order_id);
    await trackKlaviyoEvent('Placed Order', metadata.customerEmail, klaviyoOrderData);
    await trackKlaviyoEvent('Admin New Order Notification', 'maryandpopper@gmail.com', klaviyoOrderData);
    console.log(`[WebSocket] Klaviyo events sent for order ${order_id}.`);
  } catch (error) {
    console.error(`[WebSocket] Error sending Klaviyo events for order ${order_id}:`, error);
  }
}

// Initialize the connection
if (typeof window === 'undefined') {
  // Ensure this only runs on the server
  connect();
}
