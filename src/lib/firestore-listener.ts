// @ts-nocheck
'use server';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore as adminFirestore } from './firebase-admin'; 
import { FieldValue } from 'firebase-admin/firestore'; // Cambio clave aquí
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
const app = !getApps().some(a => a.name === appName)
  ? initializeApp(hilowFirebaseConfig, appName)
  : getApp(appName);

const db = getFirestore(app);

// --- 3. Lógica de Procesamiento ---

async function processCompletedOrder(orderId: string, eventData: any) {
  const isSubscription = orderId.startsWith('CPO_SUB_');
  const parts = orderId.split('_');
  if (parts.length < 3) return;
  
  const userId = parts[isSubscription ? 1 : 2];

  if (isSubscription) {
    const userRef = adminFirestore.collection('users').doc(userId);
    try {
        await userRef.update({
            isSubscribed: true,
            subscription: {
                sub_id: eventData.stripeSubscriptionId,
                status: 'active',
                last_renewed: FieldValue.serverTimestamp(),
            }
        });
    } catch (error) {
        console.error(`[FirestoreListener] Error suscripción:`, error);
    }
  }

  const orderRef = adminFirestore.collection('users').doc(userId).collection('orders').doc(orderId);

  try {
    const orderSnap = await orderRef.get();
    if (orderSnap.exists) {
        const localOrderData = orderSnap.data() as any;
        const newStatus = 'Reserva Recibida';

        await orderRef.update({ status: newStatus });

        const batch = adminFirestore.batch();
        if (localOrderData.coupon) {
          const couponRef = adminFirestore.collection('coupons').doc(localOrderData.coupon.code);
          batch.update(couponRef, { usageCount: FieldValue.increment(1) });
        }
        
        const pointsToAdd = Math.floor((localOrderData.total || 0) / 1000);
        if (pointsToAdd > 0) {
          batch.update(adminFirestore.collection('users').doc(userId), { 
            loyaltyPoints: FieldValue.increment(pointsToAdd) 
          });
        }
        
        await batch.commit();
        await trackOrderStatusUpdate({...localOrderData, id: orderId, status: newStatus}, newStatus);
    }
  } catch (error) {
    console.error(`[FirestoreListener] Error proceso:`, error);
  }
}

async function processSubscriptionRenewal(subId: string, userId: string, newPeriodEndDate?: string) {
    try {
        const userRef = adminFirestore.collection('users').doc(userId);
        const updateData: any = {
            'subscription.status': 'active',
            'subscription.last_renewed': FieldValue.serverTimestamp(),
        };
        if (newPeriodEndDate) {
            updateData['subscription.current_period_end'] = Timestamp.fromDate(new Date(newPeriodEndDate));
        }
        await userRef.update(updateData);
    } catch (error) {
        console.error(`[FirestoreListener] Error renovación:`, error);
    }
}

// --- 4. Inicializador ---
function initializeOrderListener() {
  // BLOQUEO CRÍTICO PARA EL BUILD
  if (process.env.NEXT_PHASE === 'phase-production-build') return;

  console.log("[Firestore Listener] Inicializando...");
  const ordersRef = collection(db, "portals", "comprarpopperonline.com", "orders");
  const q = query(ordersRef, where("status", "in", ["completed", "renewal_succeeded"]));
  
  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added" || change.type === "modified") {
        const data = change.doc.data();
        if (data.status === "completed") processCompletedOrder(data.orderId, data);
        else if (data.status === "renewal_succeeded") processSubscriptionRenewal(data.stripeSubscriptionId, data.userId, data.currentPeriodEnd);
      }
    });
  });
}

// --- 5. Activación Segura ---
if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
    initializeOrderListener();
}