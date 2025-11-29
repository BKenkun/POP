
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

// --- FUNCIÓN ACTUAL (SIN CAMBIOS) ---
// Se encarga de activar pedidos por primera vez.
async function processCompletedOrder(orderId: string) {
  const parts = orderId.split('_');
  if (parts.length < 3 || (parts[0] !== 'CPO' && parts[0] !== 'SUB')) {
    console.error(`[FirestoreListener] No se pudo extraer el userId de order_id: ${orderId}`);
    return;
  }
  
  // Adaptado para ambos prefijos: CPO_order_USERID_... y SUB_USERID_...
  const userId = parts[0] === 'CPO' ? parts[2] : parts[1];

  const orderRef = adminFirestore.collection('users').doc(userId).collection('orders').doc(orderId);

  try {
    const orderSnap = await orderRef.get();
    
    if (!orderSnap.exists || orderSnap.data()?.status !== 'Pago Pendiente de Verificación') {
      if (orderSnap.exists()) {
        console.log(`[FirestoreListener] El estado del pedido local ${orderId} ya es '${orderSnap.data()?.status}'. Ignorando activación.`);
      } else {
         console.warn(`[FirestoreListener] El pedido ${orderId} no se encontró en nuestra base de datos. Se procesará si se crea en breve.`);
      }
      return;
    }
    
    const localOrderData = orderSnap.data() as Order;
    const newStatus = 'Reserva Recibida';

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

    const updatedOrderForKlaviyo: Order = {
        ...localOrderData,
        id: orderId,
        status: newStatus,
        createdAt: localOrderData.createdAt,
    };
    await trackOrderStatusUpdate(updatedOrderForKlaviyo, newStatus);
    console.log(`[FirestoreListener] Se enviaron notificaciones de Klaviyo para el pedido ${orderId}.`);

  } catch (error) {
    console.error(`[FirestoreListener] Error al procesar el pedido completado ${orderId}:`, error);
  }
}

// --- NUEVA FUNCIÓN ---
// Se encarga de gestionar la renovación del ciclo de suscripción.
async function processSubscriptionRenewal(subId: string, userId: string, newPeriodEndDate?: string) {
    console.log(`Procesando renovación en 'purorush' para subscripción ${subId} del usuario ${userId}.`);
    
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
        
        // Aquí se podrían añadir más lógicas de negocio, como:
        // - Reiniciar la selección de productos del mes para el usuario.
        // - Enviar un email de confirmación de renovación a través de Klaviyo.
        
        // Ejemplo de evento para Klaviyo
        // await trackKlaviyoEvent('Subscription Renewed', userSnap.data()?.email, {
        //   'SubscriptionID': subId,
        //   'NewPeriodEnd': newPeriodEndDate,
        // });

    } catch (error) {
        console.error(`[FirestoreListener] Error al procesar la renovación para la suscripción ${subId}:`, error);
    }
}


// --- 4. Lógica del Listener en Tiempo Real ---
function initializeOrderListener() {
  console.log("[Firestore Listener] Inicializando listener para activaciones y renovaciones...");

  const storeId = "comprarpopperonline.com";
  const ordersRef = collection(db, "portals", storeId, "orders");
  
  // MODIFICACIÓN: La consulta ahora escucha dos estados.
  const q = query(ordersRef, where("status", "in", ["completed", "renewal_succeeded"]));
  const processedEvents = new Set<string>();

  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      // Usamos el ID del documento de Hilow para evitar duplicados en una misma sesión.
      const eventId = change.doc.id;
      if ((change.type === "added" || change.type === "modified") && !processedEvents.has(eventId)) {
        
        const orderData = change.doc.data();
        const orderId = orderData.orderId; // ID de nuestro sistema
        const status = orderData.status;

        // MODIFICACIÓN: La lógica interna diferencia la señal recibida.
        if (status === "completed") {
            // SEÑAL 1: Activación de un nuevo pedido.
            console.log(`[SEÑAL RECIBIDA] Activación de pedido/suscripción detectada para: ${orderId}`);
            processCompletedOrder(orderId);

        } else if (status === "renewal_succeeded") {
            // SEÑAL 2: Renovación de una suscripción existente.
            const subId = orderData.subscriptionId; // El ID de la suscripción en Stripe/Hilow
            const userId = orderData.userId; // El ID de nuestro usuario
            const newPeriodEnd = orderData.currentPeriodEnd; 
            
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
