'use client';
/**
 * @fileoverview Hook de React para escuchar la confirmación de un pedido en nuestra PROPIA base de datos.
 *
 * Propósito: Dar feedback visual inmediato al usuario en la página de éxito.
 * ¿Qué hace?: Este hook se conecta a la subcolección de pedidos del usuario actual y espera a que el 
 * estado de un pedido específico cambie a un estado de éxito (ej. 'Reserva Recibida').
 * Cuando lo detecta, ejecuta una acción en la UI, como mostrar una notificación "toast" o cambiar el estado de la página.
 * 
 * IMPORTANTE: Este hook es OPCIONAL y solo debe usarse para mejorar la experiencia de usuario.
 * NO debe usarse para lógica de negocio crítica. Para eso, se usa el Webhook de servidor.
 */

import { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Importamos NUESTRA instancia de DB
import { useAuth } from '@/context/auth-context'; // Para obtener el ID del usuario actual
import { useToast } from '@/hooks/use-toast';

/**
 * Un hook de React que escucha los pedidos completados en NUESTRA base de datos y ejecuta una acción.
 *
 * @param yourInternalOrderId El ID del pedido que queremos vigilar.
 * @param onPaymentSuccess Un callback que se ejecuta cuando se detecta el pago.
 */
export const useHilowPaymentListener = (yourInternalOrderId: string | null, onPaymentSuccess: () => void) => {
  const { toast } = useToast();
  const { user } = useAuth(); // Obtenemos el usuario autenticado
  
  useEffect(() => {
    // No hacer nada si no hay ID de pedido o no hay usuario
    if (!yourInternalOrderId || !user) {
      return;
    }
    
    let unsubscribe: () => void = () => {};
    let isSubscribed = true; // Flag para evitar llamadas al callback después de desmontar

    try {
      // Construimos la ruta al documento del pedido en NUESTRA base de datos
      const orderDocRef = doc(db, 'users', user.uid, 'orders', yourInternalOrderId);
      
      // onSnapshot es el listener en tiempo real
      unsubscribe = onSnapshot(orderDocRef, (docSnap) => {
        if (docSnap.exists() && isSubscribed) {
          const orderData = docSnap.data();
          
          // VERIFICACIÓN EN EL CLIENTE:
          // Reaccionamos si el estado ya es uno de los estados de éxito que define el webhook
          const isCompleted = ['Reserva Recibida', 'completed', 'paid', 'renewal_succeeded'].includes(orderData.status);
          
          if (isCompleted) {
            toast({
              title: "¡Pago Confirmado!",
              description: `Tu pedido ${yourInternalOrderId} se ha procesado correctamente.`
            });
            
            // Ejecutamos el callback para actualizar la UI (ej. quitar el spinner)
            onPaymentSuccess();

            // Dejamos de escuchar para ahorrar recursos.
            unsubscribe();
            isSubscribed = false; // Prevenir doble ejecución
          }
        }
      }, (error) => {
        console.error("Error al escuchar el pedido en nuestra base de datos:", error.message);
      });

    } catch (error) {
      console.error("No se pudo inicializar el listener de pagos:", error);
    }
    
    return () => {
        unsubscribe();
        isSubscribed = false;
    };

  }, [yourInternalOrderId, user, onPaymentSuccess, toast]);
};
