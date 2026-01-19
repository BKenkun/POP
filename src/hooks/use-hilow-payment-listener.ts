'use client';
/**
 * @fileoverview Hook de React para escuchar notificaciones de pago de Hilow en tiempo real DESDE EL FRONTEND.
 *
 * Propósito: Dar feedback visual inmediato al usuario (ej. un "tick" de confirmación en la página de éxito).
 * ¿Qué hace?: Este hook establece una conexión segura y de solo lectura con la base de datos de Hilow
 * para "escuchar" cuándo un pedido se marca como 'completed' o 'renewal_succeeded'. Cuando lo detecta, puede ejecutar
 * una acción en la UI, como mostrar una notificación "toast".
 * 
 * IMPORTANTE: Este hook es OPCIONAL y solo debe usarse para mejorar la experiencia de usuario.
 * NO debe usarse para lógica de negocio crítica (activar envíos, etc.). Para eso, se debe usar el Webhook de servidor.
 */

import { useEffect } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, collectionGroup, query, where, onSnapshot } from 'firebase/firestore';

// Import our app's toast system
import { useToast } from '@/hooks/use-toast'; 

// --- Configuración de Conexión a Hilow (Segura para el frontend) ---
const HILOW_API_KEY = "AIzaSyA27KSQo4tgrVNMurwrYO_B59-1njW3Qz8";

const hilowFirebaseConfig = {
  apiKey: HILOW_API_KEY,
  authDomain: "studio-953389996-b1a64.firebaseapp.com",
  projectId: "studio-953389996-b1a64",
};

const HILOW_APP_NAME = 'hilowListener';

/**
 * Inicializa y devuelve una instancia de la aplicación de Firebase para Hilow.
 * Evita inicializaciones múltiples.
 * @returns La instancia de la app de Firebase para Hilow.
 */
const getHilowApp = (): FirebaseApp => {
  const existingApp = getApps().find(app => app.name === HILOW_APP_NAME);
  if (existingApp) {
    return existingApp;
  }
  // Crea una instancia con un nombre único para no interferir con la app principal del cliente.
  return initializeApp(hilowFirebaseConfig, HILOW_APP_NAME);
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
      const hilowDb = getFirestore(hilowApp);
      
      const ordersCollectionGroup = collectionGroup(hilowDb, 'orders');
      
      // NUEVA LÓGICA:
      // 1. Buscamos el pedido solo por su ID.
      // 2. Una vez encontrado, el listener se queda esperando a que el campo 'status' cambie.
      const q = query(
        ordersCollectionGroup, 
        where('internalOrderId', '==', yourInternalOrderId)
      );
      
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty && isSubscribed) {
          const doc = querySnapshot.docs[0];
          const orderData = doc.data();
          const isCompleted = ['completed', 'renewal_succeeded', 'paid'].includes(orderData.status);
          
          // 3. Si el estado es uno de los de éxito, ejecutamos la acción.
          if (isCompleted) {
            toast({
              title: "¡Pago Confirmado!",
              description: `Tu pedido ${yourInternalOrderId} se ha procesado correctamente.`
            });
            
            onPaymentSuccess();

            // Dejamos de escuchar para ahorrar recursos.
            unsubscribe();
            isSubscribed = false; // Prevent double execution
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
