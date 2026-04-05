'use client';
/**
 * @fileoverview PLANTILLA: Escuchar confirmación de pago en tiempo real en el frontend.
 * 
 * Útil para mostrar un check de éxito automáticamente en cuanto el webhook de Hilow se procesa,
 * sin que el usuario tenga que refrescar la página.
 */

import { useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collectionGroup, query, where, onSnapshot } from 'firebase/firestore';

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

/**
 * Hook para escuchar el estado de un pedido específico.
 * 
 * @param internalOrderId El ID de tu base de datos (internalOrderId) que enviaste al crear el pedido.
 * @param onConfirmed Callback opcional que se ejecuta cuando el pago se confirma en los servidores de Hilow.
 */
export const useHilowPaymentListener = (internalOrderId: string | null, onConfirmed?: () => void) => {
  useEffect(() => {
    if (!internalOrderId) return;
    
    let unsubscribe: () => void = () => {};

    try {
      const db = getFirestore(getHilowApp());
      
      // Consultamos en la base de datos de Hilow buscando tu ID interno
      const q = query(
        collectionGroup(db, 'orders'), 
        where('internalOrderId', '==', internalOrderId)
      );
      
      unsubscribe = onSnapshot(q, (snap) => {
        snap.forEach((doc) => {
            const data = doc.data();
            // Verificamos si el estado indica éxito en Hilow
            const isConfirmed = data.status === 'completed' || data.status === 'renewal_succeeded';
            
            if (isConfirmed && onConfirmed) {
                onConfirmed();
                unsubscribe(); // Dejamos de escuchar tras recibir la confirmación
            }
        });
      });

    } catch (e) {
      console.error("Hilow Real-time Listener Error:", e);
    }
    
    return () => unsubscribe();
  }, [internalOrderId, onConfirmed]);
};
