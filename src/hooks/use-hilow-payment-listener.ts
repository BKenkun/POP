'use client';
/**
 * @fileoverview PLANTILLA: Escuchar confirmación de pago en tiempo real en el frontend.
 * 
 * Útil para mostrar un check de éxito automáticamente en cuanto el webhook de Hilow se procesa,
 * sin que el usuario tenga que refrescar la página.
 */

import { useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  collectionGroup,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

// Configuración pública de Hilow Global Services
const hilowFirebaseConfig = {
  apiKey: "AIzaSyA27KSQo4tgrVNMurwrYO_B59-1njW3Qz8",
  authDomain: "studio-953389996-b1a64.firebaseapp.com",
  projectId: "studio-953389996-b1a64",
};

const getHilowApp = () => {
  const existing = getApps().find(a => a.name === 'hilowListener');
  return existing || initializeApp(hilowFirebaseConfig, 'hilowListener');
};

const getSafeHilowDb = () => {
  const hilowApp = getHilowApp();
  try {
    return initializeFirestore(hilowApp, {
      experimentalForceLongPolling: true,
      localCache: memoryLocalCache(),
    });
  } catch {
    return getFirestore(hilowApp);
  }
};

/**
 * Hook para escuchar el estado de un pedido específico.
 * 
 * @param internalOrderId El ID de tu base de datos (internalOrderId) que enviaste al crear el pedido.
 * @param onConfirmed Callback opcional que se ejecuta cuando el pago se confirma en los servidores de Hilow.
 */
export const useHilowPaymentListener = (internalOrderId: string | null, onConfirmed?: () => void) => {
  const onConfirmedRef = useRef(onConfirmed);
  onConfirmedRef.current = onConfirmed;

  useEffect(() => {
    if (!internalOrderId) return;

    let active = true;
    let intervalId: number | null = null;

    const checkPayment = async () => {
      try {
        const db = getSafeHilowDb();
        const q = query(
          collectionGroup(db, 'orders'),
          where('internalOrderId', '==', internalOrderId)
        );
        const snap = await getDocs(q);
        if (!active) return;

        let confirmed = false;
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.status === 'completed' || data.status === 'renewal_succeeded') {
            confirmed = true;
          }
        });

        if (confirmed) {
          if (intervalId !== null) {
            window.clearInterval(intervalId);
            intervalId = null;
          }
          onConfirmedRef.current?.();
        }
      } catch (e) {
        console.error("Hilow Real-time Listener Error:", e);
      }
    };

    void checkPayment();
    intervalId = window.setInterval(() => {
      if (active) {
        void checkPayment();
      }
    }, 3000);

    return () => {
      active = false;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [internalOrderId]);
};
