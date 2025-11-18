
'use server';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore as adminFirestore } from './firebase-admin'; // Our admin DB for writing
import { serverTimestamp, increment } from 'firebase-admin/firestore';
import { trackKlaviyoEvent, formatOrderForKlaviyo } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';
import { Timestamp } from "firebase/firestore";


// --- 1. Configuración de Conexión ---
// Utiliza la configuración que nos has proporcionado.
const hilowFirebaseConfig = {
  projectId: "studio-953389996-b1a64",
  appId: "1:272897992610:web:b39d784458a79edf2274fb",
  apiKey: "AIzaSyA27KSQo4tgrVNMurwrYO_B59-1njW3Qz8",
  authDomain: "studio-953389996-b1a64.firebaseapp.com",
};

// --- 2. Inicialización de Firebase ---
// Nos aseguramos de inicializar la app solo una vez, dándole un nombre único.
const appName = "hilow-orders-listener";
const app = !getApps().some(app => app.name === appName)
  ? initializeApp(hilowFirebaseConfig, appName)
  : getApp(appName);

const db = getFirestore(app);

// --- 3. Lógica de Procesamiento de Pedido ---
// Esta es nuestra lógica interna que se ejecuta cuando un pedido se completa.
async function processCompletedOrder(orderId: string) {
  // El ID de usuario es parte del orderId, ej: "CPO_order_USERID_TIMESTAMP"
  const parts = orderId.split('_');
  if (parts.length < 3 || parts[0] !== 'CPO' || parts[1] !== 'order') {
    console.error(`[FirestoreListener] No se pudo extraer el userId de order_id: ${orderId}`);
    return;
  }
  const userId = parts[2];

  const orderRef = adminFirestore.collection('users').doc(userId).collection('orders').doc(orderId);

  try {
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      console.error(`[FirestoreListener] El pedido ${orderId} no se encontró en nuestra Firestore local. No se puede actualizar.`);
      // Podríamos incluso decidir crear un pedido "fantasma" aquí si fuera necesario, pero por ahora solo lo notificamos.
      return;
    }

    const localOrderData = orderSnap.data() as Order;

    // Si el pedido ya fue procesado y no está pendiente, no hacemos nada más.
    // Esto evita procesar duplicados o sobrescribir estados finales como 'Enviado'.
    if (localOrderData.status !== 'Pago Pendiente de Verificación') {
      console.log(`[FirestoreListener] El estado del pedido local ${orderId} ya es '${localOrderData.status}'. Ignorando actualización.`);
      return;
    }

    // ACTUALIZACIÓN CRÍTICA: Cambiamos el estado a 'Reserva Recibida'
    await orderRef.update({ status: 'Reserva Recibida' });
    console.log(`[FirestoreListener] Se actualizó correctamente el pedido local ${orderId} a 'Reserva Recibida'.`);
    
    // --- Realizar acciones posteriores al pago ---
    const batch = adminFirestore.batch();
    
    // 1. Incrementar el uso del cupón si se aplicó uno
    if (localOrderData.coupon) {
      // Necesitamos el ID del cupón, no solo el código. Asumimos que el código es el ID por ahora.
      const couponRef = adminFirestore.collection('coupons').doc(localOrderData.coupon.code);
      const couponSnap = await couponRef.get();
      if (couponSnap.exists()){
         batch.update(couponRef, { usageCount: increment(1) });
      }
    }

    // 2. Añadir puntos de fidelidad
    const pointsToAdd = Math.floor(localOrderData.total / 1000); // 1 punto por cada 10€
    if (pointsToAdd > 0) {
      const userRef = adminFirestore.collection('users').doc(userId);
      batch.update(userRef, { loyaltyPoints: increment(pointsToAdd) });
    }
    
    // Ejecutamos las actualizaciones de puntos y cupones.
    await batch.commit();
    console.log(`[FirestoreListener] Se procesaron los puntos de fidelidad y el uso del cupón para el pedido ${orderId}.`);

    // 3. Enviar correos de confirmación a través de Klaviyo
    // Aseguramos que los datos que enviamos a Klaviyo sean consistentes.
    const klaviyoOrderData = await formatOrderForKlaviyo({ ...localOrderData, id: orderId, status: 'Reserva Recibida', createdAt: new Date() }, orderId);
    await trackKlaviyoEvent('Placed Order', localOrderData.customerEmail, klaviyoOrderData);
    await trackKlaviyoEvent('Admin New Order Notification', 'maryandpopper@gmail.com', klaviyoOrderData);
    console.log(`[FirestoreListener] Se enviaron notificaciones de Klaviyo para el pedido ${orderId}.`);

  } catch (error) {
    console.error(`[FirestoreListener] Error al procesar el pedido completado ${orderId}:`, error);
  }
}

// --- 4. Lógica del Listener en Tiempo Real ---
function initializeOrderListener() {
  console.log("[Firestore Listener] Inicializando listener para pedidos completados...");

  // La ruta a la colección de pedidos de nuestra tienda. CORREGIDO
  const storeId = "comprarpopperonline.com";
  const ordersRef = collection(db, "portals", storeId, "orders");

  // Creamos una consulta para escuchar solo los pedidos que están o cambian a "completed".
  // Esto es más eficiente que escuchar todos los cambios.
  const q = query(ordersRef, where("status", "==", "completed"));

  const processedOrders = new Set<string>();

  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      // Nos interesan los pedidos que se añaden a la lista de "completed"
      // y que no hemos procesado antes.
      // Usamos 'added' y 'modified' para ser más robustos, en caso de que un pedido pase de 'pending' a 'completed'.
      if (change.type === "added" || change.type === "modified") {
        const order = change.doc.data();
        const orderId = order.orderId;

        if (processedOrders.has(orderId)) {
          // Si ya lo hemos procesado en esta sesión, lo ignoramos.
          console.log(`[Firestore Listener] El pedido ${orderId} ya ha sido procesado en esta sesión. Ignorando.`);
          return;
        }

        console.log(`[Firestore Listener] Pedido completado detectado: ${orderId}`);
        
        // Llamamos a nuestra función para procesar el pedido.
        processCompletedOrder(orderId);
        
        // Marcamos el pedido como procesado para evitar duplicados.
        processedOrders.add(orderId);
      }
    });
  }, (error) => {
    // Manejo de errores en el listener
    console.error("[Firestore Listener] Error al escuchar cambios en pedidos: ", error);
  });
}

// --- 5. Activación del Listener ---
// Llamamos a la función para que el listener se active cuando este archivo se cargue.
initializeOrderListener();
