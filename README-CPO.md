# Guía de Integración Avanzada para `comprarpopperonline.com`

**Asunto:** Cómo recibir notificaciones de pedidos en tiempo real con Hilow Global Services.

Este documento técnico amplía nuestra [guía de integración de pasarela de pago inicial](./docs/integration_guide_cpo.md) y explica cómo su tienda, `comprarpopperonline.com`, puede recibir confirmaciones de pedidos completados y renovaciones de suscripción en tiempo real.

## Objetivo

El objetivo es que su sistema (`comprarpopperonline.com`) pueda "escuchar" activamente cuándo un pedido ha sido marcado como **`completed`** o **`renewal_succeeded`** en nuestra base de datos (Firestore). Esto le permite actualizar el estado del pedido en su propio sistema de forma instantánea, sin depender únicamente de la redirección del usuario a la página de éxito.

Esto es especialmente útil para:
1.  Confirmar pedidos incluso si el cliente cierra la ventana después de pagar.
2.  Gestionar renovaciones de suscripciones que ocurren en segundo plano.
3.  Tener un sistema de confirmación de pedidos más robusto y fiable.

## Requisitos Técnicos

Para implementar esta funcionalidad, necesitará utilizar el SDK de cliente de Firebase.

### Credenciales de Conexión a Firebase

A continuación se encuentran las credenciales de configuración de Firebase que debe usar en su aplicación frontend. **Estos datos son seguros para ser expuestos en el lado del cliente**, ya que la seguridad está garantizada por las reglas de nuestra base de datos.

```javascript
// Configuración de Firebase para conectar con Hilow Global Services
const firebaseConfig = {
  apiKey: "AIzaSyA27KSQo4tgrVNMurwrYO_B59-1njW3Qz8",
  authDomain: "studio-953389996-b1a64.firebaseapp.com",
  projectId: "studio-953389996-b1a64",
  // El resto de campos como storageBucket, messagingSenderId, appId no son necesarios para esta integración.
};
```

## Implementación

Deberá añadir un script en su frontend (por ejemplo, en las páginas de su cuenta de cliente o en una sección de administración de pedidos) que se conecte a Firebase y escuche los cambios en los pedidos de su tienda.

### Paso 1: Incluir el SDK de Firebase

Asegúrese de tener acceso a las librerías de Firebase en su proyecto. La forma más sencilla es a través de un script en su HTML:

```html
<!-- Incluir los SDK de Firebase -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
```

### Paso 2: Script para Escuchar Pedidos Completados

El siguiente código es un ejemplo de cómo conectarse y escuchar los pedidos que se marcan como completados.

```javascript
document.addEventListener('DOMContentLoaded', function() {
  
  // 1. Usar las credenciales proporcionadas para inicializar Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyA27KSQo4tgrVNMurwrYO_B59-1njW3Qz8",
    authDomain: "studio-953389996-b1a64.firebaseapp.com",
    projectId: "studio-953389996-b1a64",
  };

  if (typeof firebase !== 'undefined') {
    // Inicializar la app de Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore(app);
    const auth = firebase.auth(app);

    // 2. Autenticación anónima para obtener permisos de lectura
    // Nuestras reglas de seguridad permiten la lectura de pedidos completados
    // a clientes autenticados de forma anónima, siempre que se filtre correctamente.
    auth.signInAnonymously()
      .then(() => {
        console.log('Autenticación anónima exitosa con Hilow Services.');
        
        // 3. Crear una consulta a la colección de pedidos de su tienda
        // Es CRÍTICO que el storeId sea 'comprarpopperonline.com'
        const storeId = 'comprarpopperonline.com';
        const ordersRef = db.collection('portals').doc(storeId).collection('orders');

        // 4. Crear un 'listener' que se active cuando un pedido cambie a 'completed'
        // Este filtro es OBLIGATORIO para que nuestras reglas de seguridad le den acceso.
        const completedOrdersQuery = ordersRef.where('status', '==', 'completed');

        completedOrdersQuery.onSnapshot(
          (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added' || change.type === 'modified') {
                const orderData = change.doc.data();
                const orderId = orderData.orderId; // Ej: 'CPO_ORDER_12345'
                
                console.log(`¡Pedido completado detectado!: ${orderId}`);
                
                // --- ¡ACCIÓN REQUERIDA! ---
                // Aquí es donde usted debe llamar a su propia lógica de negocio.
                // Por ejemplo, marcar el pedido como pagado en su base de datos.
                // updateYourSystemOrderStatus(orderId, 'pagado');
              }
            });
          },
          (error) => {
            console.error("Error al escuchar pedidos de Hilow: ", error.message);
            // Esto puede ocurrir si el filtro de la consulta es incorrecto
            // o si hay un problema de permisos.
          }
        );

        // (Opcional) Listener para renovaciones de suscripción
        const renewalOrdersQuery = ordersRef.where('status', '==', 'renewal_succeeded');
        renewalOrdersQuery.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added' || change.type === 'modified') {
                  const orderData = change.doc.data();
                  console.log(`¡Renovación de suscripción exitosa detectada!: ${orderData.orderId}`);
                  // Aquí podría activar la lógica para extender la suscripción del cliente.
              }
            });
        });


      })
      .catch((error) => {
        console.error('Error en la autenticación anónima con Hilow:', error);
      });

  } else {
    console.error('El SDK de Firebase no se ha cargado. No se pueden recibir notificaciones de pedidos.');
  }
});
```

### Resumen de la Lógica

1.  **Conexión:** Su frontend se conecta a nuestra base de datos de Firebase usando las credenciales proporcionadas.
2.  **Autenticación:** Se realiza una autenticación anónima y silenciosa para obtener los permisos de lectura necesarios.
3.  **Consulta:** Se crea una consulta específica que solo busca pedidos para `comprarpopperonline.com` cuyo estado sea `completed`. Nuestras reglas de seguridad en el backend **solo** permitirán la ejecución de esta consulta exacta.
4.  **Escucha (Listener):** El `onSnapshot` actúa como un "oído" permanente. En el momento en que nuestro sistema (tras un pago exitoso en Stripe) actualiza el estado de un pedido a `completed`, su `onSnapshot` se activará instantáneamente.
5.  **Acción:** Dentro del `onSnapshot`, usted recibe los datos del pedido y puede ejecutar su propia lógica para actualizar su base de datos.

Si tiene alguna pregunta durante la implementación, no dude en contactarnos.
