
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

// --- FUNCIÓN ACTUALIZADA ---
// Ahora maneja tanto pedidos normales como la activación de suscripciones.
async function processCompletedOrder(orderId: string, eventData: any) {
  const isSubscription = orderId.startsWith('CPO_SUB_');
  
  const parts = orderId.split('_');
  if (parts.length < 3) {
    console.error(`[FirestoreListener] No se pudo extraer el userId de order_id: ${orderId}`);
    return;
  }
  
  const userId = parts[isSubscription ? 1 : 2];

  // Lógica para activar la suscripción en el perfil del usuario
  if (isSubscription) {
    const userRef = adminFirestore.collection('users').doc(userId);
    const stripeSubscriptionId = eventData.stripeSubscriptionId;
    const subscriptionStatus = eventData.subscriptionStatus;

    if (!stripeSubscriptionId || subscriptionStatus !== 'active') {
         console.error(`[FirestoreListener] Faltan datos de suscripción para el evento ${orderId}. No se puede activar la suscripción.`);
         return;
    }

    try {
        await userRef.update({
            isSubscribed: true,
            subscription: {
                sub_id: stripeSubscriptionId,
                status: 'active',
                last_renewed: serverTimestamp(),
            }
        });
        console.log(`[FirestoreListener] Suscripción activada para el usuario ${userId} con ID de Stripe ${stripeSubscriptionId}.`);
    } catch (error) {
        console.error(`[FirestoreListener] Error al activar la suscripción para el usuario ${userId}:`, error);
        // Aún así, intentamos procesar el pedido si existe
    }
  }

  // Lógica para actualizar el estado del pedido (se ejecuta para ambos, suscripciones y pedidos normales)
  const orderRef = adminFirestore.collection('users').doc(userId).collection('orders').doc(orderId);

  try {
    const orderSnap = await orderRef.get();
    
    if (orderSnap.exists() && orderSnap.data()?.status !== 'Pago Pendiente de Verificación') {
      console.log(`[FirestoreListener] El pedido ${orderId} ya fue procesado. Ignorando evento.`);
      return;
    }
    
    if (orderSnap.exists()) {
        const localOrderData = orderSnap.data() as Order;
        const newStatus = 'Reserva Recibida';

        await orderRef.update({ status: newStatus });
        console.log(`[FirestoreListener] Estado del pedido ${orderId} actualizado a '${newStatus}'.`);

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
          const userRefForPoints = adminFirestore.collection('users').doc(userId);
          batch.update(userRefForPoints, { loyaltyPoints: increment(pointsToAdd) });
        }
        
        await batch.commit();
        console.log(`[FirestoreListener] Se procesaron puntos y cupones para ${orderId}.`);

        const updatedOrderForKlaviyo: Order = {
            ...localOrderData,
            id: orderId,
            status: newStatus,
            createdAt: localOrderData.createdAt,
        };
        await trackOrderStatusUpdate(updatedOrderForKlaviyo, newStatus);
        console.log(`[FirestoreListener] Notificación de Klaviyo enviada para ${orderId}.`);
    } else {
        // This is now just a warning, as for subscriptions, there might not be a local order record
        // if the payment was for the subscription itself and not a product order.
        console.warn(`[FirestoreListener] El pedido ${orderId} no se encontró en la DB local. Si era una suscripción, esto es normal. Si era un pedido, podría ser un error.`);
    }

  } catch (error) {
    console.error(`[FirestoreListener] Error al procesar el evento ${orderId}:`, error);
  }
}


async function processSubscriptionRenewal(subId: string, userId: string, newPeriodEndDate?: string) {
    console.log(`Procesando renovación en 'purorush' para suscripción ${subId} del usuario ${userId}.`);
    
    try {
        const userRef = adminFirestore.collection('users').doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists() || !userSnap.data()?.isSubscribed) {
            console.warn(`[FirestoreListener] Usuario ${userId} no encontrado o no tiene una suscripción activa. No se procesa la renovación.`);
            return;
        }

        const currentSubscription = userSnap.data()?.subscription;
        
        if(currentSubscription?.sub_id !== subId) {
            console.warn(`[FirestoreListener] El ID de suscripción de la renovación (${subId}) no coincide con el guardado para el usuario ${userId} (${currentSubscription?.sub_id}).`);
            return;
        }

        const updateData: { [key: string]: any } = {
            'subscription.status': 'active',
            'subscription.last_renewed': serverTimestamp(),
        };

        if (newPeriodEndDate) {
            updateData['subscription.current_period_end'] = Timestamp.fromDate(new Date(newPeriodEndDate));
        }

        await userRef.update(updateData);

        console.log(`[FirestoreListener] Renovación procesada para el usuario ${userId}. La suscripción está activa.`);
        
    } catch (error) {
        console.error(`[FirestoreListener] Error al procesar la renovación para la suscripción ${subId}:`, error);
    }
}


// --- 4. Lógica del Listener en Tiempo Real ---
function initializeOrderListener() {
  console.log("[Firestore Listener] Inicializando listener para activaciones y renovaciones...");

  const storeId = "comprarpopperonline.com";
  const ordersRef = collection(db, "portals", storeId, "orders");
  
  const q = query(ordersRef, where("status", "in", ["completed", "renewal_succeeded"]));
  const processedEvents = new Set<string>();

  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const eventId = change.doc.id;
      if ((change.type === "added" || change.type === "modified") && !processedEvents.has(eventId)) {
        
        const eventData = change.doc.data();
        const status = eventData.status;

        if (status === "completed") {
            const orderId = eventData.orderId;
            console.log(`[SEÑAL RECIBIDA] Activación de pedido/suscripción detectada para: ${orderId}`);
            processCompletedOrder(orderId, eventData);

        } else if (status === "renewal_succeeded") {
            const subId = eventData.stripeSubscriptionId;
            const userId = eventData.userId;
            const newPeriodEnd = eventData.currentPeriodEnd; 
            
            console.log(`[SEÑAL RECIBIDA] Renovación exitosa para la suscripción: ${subId}`);
            processSubscriptionRenewal(subId, userId, newPeriodEnd);
        }
        
        processedEvents.add(eventId);
      }
    });
  }, (error) => {
    console.error("[Firestore Listener] Error al escuchar cambios en pedidos: ", error);
  });
}

// --- 5. Activación del Listener ---
initializeOrderListener();

