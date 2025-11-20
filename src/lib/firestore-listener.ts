
'use server';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore as adminFirestore } from './firebase-admin'; // Our admin DB for writing
import { serverTimestamp, increment } from 'firebase-admin/firestore';
import { trackOrderStatusUpdate } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';
import { Timestamp } from "firebase/firestore";


// --- 1. Configuración de Conexión ---
const hilowFirebaseConfig = {
  projectId: "studio-953389996-b1a64",
  appId: "1:272897992610:web:b39d784458a79edf2274fb",
  apiKey: "AIzaSyA27KSQo4tgrVNMurwrYO_B59-1njW3Qz8",
  authDomain: "studio-953389996-b1a64.firebaseapp.com",
};

// --- 2. Inicialización de Firebase ---
const appName = "hilow-orders-listener";
const app = !getApps().some(app => app.name === appName)
  ? initializeApp(hilowFirebaseConfig, appName)
  : getApp(appName);

const db = getFirestore(app);

// --- 3. Lógica de Procesamiento de Pedido ---
async function processCompletedOrder(orderId: string) {
  const parts = orderId.split('_');
  if (parts.length < 3 || parts[0] !== 'CPO' || parts[1] !== 'order') {
    console.error(`[FirestoreListener] No se pudo extraer el userId de order_id: ${orderId}`);
    return;
  }
  const userId = parts[2];

  const orderRef = adminFirestore.collection('users').doc(userId).collection('orders').doc(orderId);

  try {
    const orderSnap = await orderRef.get();
    
    // Si el pedido no existe, o si ya fue procesado y no está pendiente, no hacemos nada más.
    if (!orderSnap.exists || orderSnap.data()?.status !== 'Pago Pendiente de Verificación') {
      if (orderSnap.exists()) {
        console.log(`[FirestoreListener] El estado del pedido local ${orderId} ya es '${orderSnap.data()?.status}'. Ignorando actualización.`);
      } else {
         console.warn(`[FirestoreListener] El pedido ${orderId} no se encontró en nuestra base de datos al momento de la confirmación. Puede que se cree en breve.`);
      }
      return;
    }
    
    const localOrderData = orderSnap.data() as Order;
    const newStatus = 'Reserva Recibida';

    // ACTUALIZACIÓN CRÍTICA: Cambiamos el estado
    await orderRef.update({ status: newStatus });
    console.log(`[FirestoreListener] Se actualizó correctamente el pedido local ${orderId} a '${newStatus}'.`);
    
    const batch = adminFirestore.batch();
    
    if (localOrderData.coupon) {
      const couponRef = adminFirestore.collection('coupons').doc(localOrderData.coupon.code);
      const couponSnap = await couponRef.get();
      if(couponSnap.exists()){
         batch.update(couponRef, { usageCount: increment(1) });
      }
    }

    const pointsToAdd = Math.floor(localOrderData.total / 1000);
    if (pointsToAdd > 0) {
      const userRef = adminFirestore.collection('users').doc(userId);
      batch.update(userRef, { loyaltyPoints: increment(pointsToAdd) });
    }
    
    await batch.commit();
    console.log(`[FirestoreListener] Se procesaron los puntos de fidelidad y el uso del cupón para el pedido ${orderId}.`);

    // Usamos la nueva función centralizada para enviar notificaciones de Klaviyo
    // Pasamos el objeto de pedido completo con el nuevo estado actualizado
    const updatedOrderForKlaviyo: Order = {
        ...localOrderData,
        id: orderId, // Aseguramos que el id está en el objeto
        status: newStatus,
        createdAt: localOrderData.createdAt,
    };
    await trackOrderStatusUpdate(updatedOrderForKlaviyo, newStatus);
    console.log(`[FirestoreListener] Se enviaron notificaciones de Klaviyo para el pedido ${orderId}.`);

  } catch (error) {
    console.error(`[FirestoreListener] Error al procesar el pedido completado ${orderId}:`, error);
  }
}

// --- 4. Lógica del Listener en Tiempo Real ---
function initializeOrderListener() {
  console.log("[Firestore Listener] Inicializando listener para pedidos completados...");

  const storeId = "comprarpopperonline.com";
  const ordersRef = collection(db, "portals", storeId, "orders");
  const q = query(ordersRef, where("status", "==", "completed"));

  const processedOrders = new Set<string>();

  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added" || change.type === "modified") {
        const order = change.doc.data();
        const orderId = order.orderId;

        if (processedOrders.has(orderId)) {
          return;
        }

        console.log(`[Firestore Listener] Pedido completado detectado: ${orderId}`);
        processCompletedOrder(orderId);
        processedOrders.add(orderId);
      }
    });
  }, (error) => {
    console.error("[Firestore Listener] Error al escuchar cambios en pedidos: ", error);
  });
}

// --- 5. Activación del Listener ---
initializeOrderListener();
