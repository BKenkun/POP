'use client';
/**
 * Escucha el estado del pedido en Firestore de Hilow (opcional, UX).
 * La página /checkout/success confirma el pago con onSnapshot en Firestore local (users/.../orders).
 * Configura credenciales públicas de Hilow vía NEXT_PUBLIC_* si vuelves a usar este hook.
 */

import { useEffect } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, collectionGroup, query, where, onSnapshot } from 'firebase/firestore';

// Import our app's toast system
import { useToast } from '@/hooks/use-toast'; 

const HILOW_APP_NAME = 'hilowListener';

function getHilowFirebaseConfig() {
  const apiKey = process.env.NEXT_PUBLIC_HILOW_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_HILOW_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_HILOW_FIREBASE_PROJECT_ID;
  if (!apiKey || !authDomain || !projectId) {
    return null;
  }
  return { apiKey, authDomain, projectId };
}

const getHilowApp = (): FirebaseApp | null => {
  const config = getHilowFirebaseConfig();
  if (!config) return null;
  const existingApp = getApps().find((app) => app.name === HILOW_APP_NAME);
  if (existingApp) {
    return existingApp;
  }
  return initializeApp(config, HILOW_APP_NAME);
};


/**
 * Un hook de React que escucha los pedidos completados en el sistema de Hilow y ejecuta una acción.
 *
 * @param yourInternalOrderId El ID del pedido del sistema propio del cliente.
 * @param onPaymentSuccess Un callback que se ejecuta cuando se detecta el pago.
 */
export const useHilowPaymentListener = (yourInternalOrderId: string | null, onPaymentSuccess: () => void) => {
  const { toast } = useToast();
  
  useEffect(() => {
    if (!yourInternalOrderId) {
      return;
    }
    
    let unsubscribe: () => void = () => {};
    let isSubscribed = true; // Flag to prevent calling callback after unmount

    try {
      const hilowApp = getHilowApp();
      if (!hilowApp) {
        return;
      }
      const hilowDb = getFirestore(hilowApp);
      
      const ordersCollectionGroup = collectionGroup(hilowDb, 'orders');
      
      // LÓGICA CORREGIDA:
      // 1. Buscamos el pedido solo por su ID para evitar problemas con las reglas de seguridad de Hilow.
      const q = query(
        ordersCollectionGroup, 
        where('internalOrderId', '==', yourInternalOrderId)
      );
      
      // onSnapshot es el listener en tiempo real.
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (querySnapshot.empty) {
            console.warn(`Hilow Listener: No se encontró ningún pedido con el internalOrderId ${yourInternalOrderId}. Esperando...`);
            return;
        }
          
        if (isSubscribed) {
          const doc = querySnapshot.docs[0];
          const orderData = doc.data();
          // 2. Comprobamos el estado del pedido DENTRO del listener.
          const isCompleted = ['completed', 'renewal_succeeded', 'paid'].includes(orderData.status);
          
          // 3. Si el estado es uno de los de éxito, ejecutamos la acción.
          if (isCompleted) {
            toast({
              title: "¡Pago Confirmado!",
              description: `Tu pedido ${yourInternalOrderId} se ha procesado correctamente.`
            });
            
            onPaymentSuccess();

            // 4. Dejamos de escuchar para ahorrar recursos.
            unsubscribe();
            isSubscribed = false;
          }
        }
      }, (error) => {
        console.error("Error al escuchar los pedidos de Hilow:", error.message);
      });

    } catch (error) {
      console.error("No se pudo inicializar el listener de pagos de Hilow:", error);
    }
    
    return () => {
        unsubscribe();
        isSubscribed = false;
    };

  }, [yourInternalOrderId, onPaymentSuccess, toast]);
};
