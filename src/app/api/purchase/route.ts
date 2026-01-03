# Arquitectura y Guía de Implementación del E-commerce

## Introducción

Este documento es un manual de arquitectura del sitio, concebido para ser una fuente de verdad para los programadores. Su objetivo es garantizar la consistencia, facilitar el mantenimiento y orientar la implementación de nuevas funcionalidades.

Actúa como un mapa de la arquitectura técnica, detallando el stack tecnológico (Next.js, Firebase, Genkit), los principales patrones de código y ejemplos de implementación para las funcionalidades más importantes.

---

## Arquitectura de Datos y Comunicación

### Comunicación Cliente-Servidor para Productos (Leitura/Escrita)
*Explicação técnica de como o painel de administração lê e guarda os dados dos produtos sem uma API REST tradicional.*

**1. El Modelo: Cliente Directo a Base de Datos**
A diferencia de una arquitectura tradicional que usa una API REST como intermediaria, esta aplicación adopta un enfoque más moderno y directo. El panel de administración (que se ejecuta en el navegador del administrador) utiliza el **SDK de cliente de Firebase** para comunicarse directamente con la base de datos de Firestore. Esto elimina la necesidad de escribir y mantener un backend completo para las operaciones CRUD (Crear, Leer, Actualizar, Borrar).

**2. ¿Cómo es seguro este modelo? El rol de las Reglas de Seguridad**
La seguridad no recae en un endpoint de servidor oculto, sino en las **Reglas de Seguridad de Firestore** (`firestore.rules`), que actúan como un vigilante inteligente en la nube. Antes de permitir cualquier operación de lectura o escritura, Firestore evalúa estas reglas. Para la gestión de productos, la regla clave es:

```javascript
match /products/{productId} {
  allow read: if true;
  allow write: if isAdmin();
}

function isAdmin() {
  return request.auth != null && request.auth.token.email == 'maryandpopper@gmail.com';
}
```

- **`allow read: if true;`**: Permite que cualquier persona (clientes, visitantes) lea la información de los productos, algo necesario para una tienda online.
- **`allow write: if isAdmin();`**: **Esta es la clave de la seguridad**. Solo permite operaciones de escritura (crear, editar, borrar) si la petición proviene de un usuario autenticado cuyo token de autenticación (`request.auth.token`) contiene el email `maryandpopper@gmail.com`. Cualquier otro intento de escritura es rechazado automáticamente por la base de datos.

**3. Flujo de Escritura (Crear o Modificar un Producto)**
Cuando el administrador guarda un producto desde el panel:
a. **Componente de UI**: Se utiliza el formulario `ProductForm` (`src/app/admin/products/_components/product-form.tsx`).
b. **Validación**: Los datos se validan en el navegador usando `react-hook-form` y `zod` para asegurar que todo es correcto antes de enviar.
c. **Llamada a Firestore**: La función `handleSave` en las páginas `new` o `edit` llama directamente a las funciones del SDK de Firebase:
- **Para crear un producto nuevo:**
```javascript
// En: src/app/admin/products/new/page.tsx
import { doc, setDoc } from 'firebase/firestore';

const productRef = doc(db, 'products', data.id);
await setDoc(productRef, productData); // Crea el documento.
```
- **Para modificar un producto existente:**
```javascript
// En: src/app/admin/products/edit/[id]/page.tsx
import { doc, updateDoc } from 'firebase/firestore';

const productRef = doc(db, 'products', product.id);
await updateDoc(productRef, productData); // Actualiza el documento.
```

**4. Flujo de Lectura (Leer los Productos)**
Para mostrar los productos en el panel de administración, se sigue un patrón similar de comunicación directa:
a. **Suscripción en Tiempo Real**: La aplicación utiliza la función `onSnapshot` de Firebase en el componente `AdminProductsPage` (`src/app/admin/products/page.tsx`).
b. **Funcionamiento**: `onSnapshot` abre una conexión persistente con Firestore. En lugar de solo 'pedir' los datos una vez, 'escucha' cualquier cambio en la colección de productos. Si se añade, modifica o elimina un producto (incluso desde otro dispositivo), Firestore envía automáticamente los datos actualizados al cliente, y la interfaz se actualiza en tiempo real gracias a la reactividad de React.

---

## Lógica de Negocio y Marketing

### Verificación de Edad (Popup Modal)
*Un popup modal que bloquea el acceso al sitio hasta que el usuario verifica que tiene más de 18 años.*

**Técnico:** El componente `AgeVerificationPopup` (`src/components/age-verification-popup.tsx`) se renderiza en el `AppLayout`. Usa `localStorage` para recordar si un usuario ya ha sido verificado, evitando que el popup aparezca en cada visita. Si no hay confirmación previa, el popup aparece 500ms después de cargar la página. La validación de la fecha se realiza en tiempo real con `useMemo`. Si el usuario es menor de edad, se le muestra un error y el botón de "Entrar" permanece deshabilitado. Si hace clic en "Salir", es redirigido a google.com.

```javascript
// En src/components/age-verification-popup.tsx
useEffect(() => {
  const isVerified = localStorage.getItem('age_verified');
  if (isVerified !== 'true') {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }
}, []);
```

### Notificaciones de Ventas Híbridas (Reales y Simuladas)
*Popups que muestran compras para generar confianza. Prioriza compras reales y preenche as lacunas com notificações simuladas.*

**Técnico:** El componente `SalesNotification` (`src/components/sales-notification.tsx`) ahora tiene una lógica híbrida. Utiliza `onSnapshot` de Firebase para escuchar la `collectionGroup` 'orders' en tiempo real. Cuando se detecta un nuevo pedido, se interrumpe el ciclo de notificaciones falsas y se muestra una notificación con los datos reales. Tras mostrar la notificación real, se reanuda el ciclo de notificaciones simuladas (que usan `setTimeout` con un delay aleatorio) para asegurar que la tienda siempre parezca activa.

```javascript
// En src/components/sales-notification.tsx
const ordersQuery = query(
  collectionGroup(db, 'orders'),
  orderBy('createdAt', 'desc'),
  where('createdAt', '>', Timestamp.now())
);

const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      // Interrumpe el timer de notificaciones falsas
      // Muestra la notificación REAL
      // Vuelve a programar la siguiente notificación falsa
    }
  });
});
```

### Popup de Bienvenida con Descuento
*Un popup que ofrece 10% de descuento en troca da subscrição da newsletter. Aparece apenas a novos visitantes ou após 24h.*

**Técnico:** El componente `WelcomePopup` (`src/components/welcome-popup.tsx`) usa `localStorage` para registrar si un usuario ya ha visto el popup. Solo se muestra si no hay registro previo o si ha pasado más de 24 horas. El formulario se integra con Klaviyo a través de la API Route `/api/subscribe`.

```javascript
// En src/components/welcome-popup.tsx
useEffect(() => {
  const lastVisit = localStorage.getItem('lastPopperStoreVisit');
  const now = new Date().getTime();
  if (!lastVisit || (now - parseInt(lastVisit, 10)) > (24 * 60 * 60 * 1000)) {
    setTimeout(() => setIsOpen(true), 2000);
    localStorage.setItem('lastPopperStoreVisit', now.toString());
  }
}, []);
```

### Política de Descuentos por Volumen
*Sistema de desconto automático no carrinho com base na quantidade de produtos. Não se aplica a pagamentos na entrega.*

**Técnico:** La lógica de cálculo se encuentra en `CartContext` (`src/context/cart-context.tsx`). Un `useMemo` recalcula el descuento (`volumeDiscount`) cada vez que cambia el número de artículos en el carrito (`cartCount`). En el `checkout-client-page.tsx`, este descuento solo se aplica al total si el método de pago no es contrareembolso.

```javascript
// En src/context/cart-context.tsx
const volumeDiscount = useMemo(() => {
  let discountPercent = 0;
  if (cartCount >= 200) { discountPercent = 0.29; }
  // ... más rangos
  return Math.round(cartTotal * discountPercent);
}, [cartCount, cartTotal]);
```

### Sistema de Puntos de Fidelidad
*Los usuarios ganan puntos con cada compra, que pueden ser canjeados por descuentos futuros.*

**Técnico:** Al confirmar un pedido en `checkout-client-page.tsx`, se llama a la `Server Action` `updateUser` con la acción `update-points`. La acción calcula los puntos a añadir (1 punto por cada 10€ de compra) y utiliza `increment` de Firestore para una actualización atómica y segura.

```javascript
// En src/app/checkout/checkout-client-page.tsx
const pointsToAdd = Math.floor(finalTotals.total / 1000);
if (pointsToAdd > 0) {
  await updateUser('update-points', { pointsToAdd });
}
```

---

## Funcionalidades de E-commerce

### Constructor de Packs
*Una herramienta para los clientes crearen el seu propio pack de productos con descuentos de volumen.*

**Técnico:** La lógica de precios es manejada por un flujo de Genkit (`calculatePackPriceFlow`) que calcula el descuento dinámicamente. El estado del pack se gestiona en el cliente (`useState`), y un `useEffect` con `setTimeout` (debounce) llama al flujo de IA para evitar peticiones excesivas.

```javascript
// En src/ai/flows/calculate-pack-price-flow.ts
const calculatePackPriceFlow = ai.defineFlow(
  { ... },
  async (items) => {
    const originalTotal = ...;
    const discountPercent = ...;
    return { originalTotal, discountedTotal, savings };
  }
);
```

### Carrito de Compras
*El carrito es un panel lateral. Haz clic en el icono flotante del carrito para abrirlo después de añadir un producto.*

**Técnico:** Implementado como un `Contexto de React` (`CartContext`) que vive en `src/context/cart-context.tsx`. Este contexto maneja un estado (`cartItems`) que es un array de productos con su cantidad. Las funciones `addToCart`, `updateQuantity` y `removeFromCart` manipulan este estado. El contexto no es persistente; se reinicia si el usuario recarga la página.

**Lógica de Precios:** En el carrito se muestra de forma estimada el descuento por volumen (si aplica por pago anticipado) y los costes de envío. La lógica de precios final y definitiva, que diferencia entre pago anticipado y contra-reembolso, se aplica en la página de checkout.

### Proceso de Checkout (Pago y Creación de Pedido)
*Un flujo de checkout multi-paso que culmina con la creación del pedido en la base de datos y la iniciación del pago a través de un intermediario.*

**Paso 1: Recopilación de Datos (`/checkout/checkout-client-page.tsx`)**
- El componente `checkout-client-page.tsx` gestiona el estado del flujo con un `useState` para el `step`.
- **Datos del Usuario y Dirección:** Se utiliza `react-hook-form` con `zod` para la validación del formulario de dirección. Si el usuario está autenticado (`useAuth`), puede seleccionar una dirección guardada.
- **Lógica de Precios Final:** Un `useMemo` (`finalTotals`) recalcula el total definitivo del pedido. Esta es la fase crítica donde se decide si aplicar el descuento por volumen basándose en el método de pago seleccionado.
- **Aplicación de Cupones:** Si el usuario introduce un código de cupón, la función `handleApplyCoupon` realiza una consulta a la colección `coupons` en Firestore para validar el código y aplicar el descuento correspondiente, actualizando el estado `couponDiscount`.

**Paso 2: Creación de Pedidos y Redirección a la Pasarela de Pago (`onFinalSubmit`)**
- Cuando el usuario llega al último paso y hace clic en "Pagar con Tarjeta", se invoca la función `onFinalSubmit`.
- **Creación del Pedido Local:** La aplicación crea un documento de pedido **directamente desde el cliente** en la colección `/users/{userId}/orders/{orderId}` de la base de datos **local**. Esto es seguro gracias a las reglas de Firestore que solo permiten a los usuarios escribir en su propia subcolección de pedidos. El estado inicial del pedido es `Pago Pendiente de Verificación`.
```javascript
// Fragmento de /app/checkout/checkout-client-page.tsx
const localOrderRef = doc(db, 'users', user.uid, 'orders', uniqueId);
await setDoc(localOrderRef, localOrderData);
```

- **Creación del Pedido en la Plataforma del Intermediario (Hilow):** Inmediatamente después, se crea un segundo documento de pedido, esta vez en la base de datos **externa** de Hilow, utilizando el cliente de Firestore específico (`hilowDb`).
```javascript
// Fragmento de /app/checkout/checkout-client-page.tsx
const storeId = 'comprarpopperonline.com';
const hilowOrderId = `CPO_${uniqueId}`;
const hilowOrderRef = doc(hilowDb, 'portals', storeId, 'orders', hilowOrderId);
await setDoc(hilowOrderRef, hilowOrderData);
```

**Paso 3: Redirección a la Pasarela de Pago**
- Una vez que ambos documentos de pedido han sido creados, el cliente es redirigido a la URL de pago del intermediario.
```javascript
// Fragmento de /app/checkout/checkout-client-page.tsx
const paymentUrl = `https://hilowglobal.com/pay/${hilowOrderId}`;
window.location.href = paymentUrl;
```
- **Confirmación en Tiempo Real:** En paralelo, un listener de larga duración (`/lib/firestore-listener.ts`) está escuchando en la base de datos externa de Hilow. Cuando el intermediario de pagos confirma la transacción, escribe un documento en esa base de datos. Nuestro listener detecta este cambio, extrae el `orderId`, y actualiza el pedido correspondiente en nuestra base de datos local a `Reserva Recibida`, además de enviar notificaciones (ej. a Klaviyo). Este sistema asíncrono garantiza la confirmación del pedido incluso si el usuario cierra la ventana de pago.

---

## Cuenta de Usuario y Autenticación

### Iniciar Sesión
*Formulario para usuarios existentes acederen à sua conta, com lógica de redirecionamento baseada no papel.*

**Técnico:** Utiliza `signInWithEmailAndPassword` de Firebase. Una vez autenticado, se obtiene el `idToken` del usuario y se envía a la API Route `/api/login`, que crea una **session cookie** segura (`httpOnly`).

**Diferenciación de Roles y Redirección:** El sistema comprueba el email del usuario: si es `maryandpopper@gmail.com`, lo identifica como administrador y lo redirige a `/admin`. Los usuarios normales son dirigidos a `/account`.

```javascript
// En src/app/login/login-form.tsx
const userCredential = await signInWithEmailAndPassword(...);
const idToken = await userCredential.user.getIdToken();
await fetch('/api/login', { body: JSON.stringify({ idToken }) });

const loggedInIsAdmin = userCredential.user.email === 'maryandpopper@gmail.com';
if (loggedInIsAdmin) {
  router.push('/admin');
} else {
  router.push(redirectUrl || '/account');
}
```

### Registro de Nuevo Usuario
**Técnico:** Usa `createUserWithEmailAndPassword`. Al registrarse, crea un nuevo documento para el usuario en la colección `users` de Firestore con valores iniciales.

### Panel de Control de la Cuenta
**Técnico:** Protegido por el `AccountLayout`, que redirige a los usuarios no autenticados. Muestra datos del `AuthContext`, como `loyaltyPoints` e `isSubscribed`.

### Mis Pedidos
**Técnico:** Realiza una consulta a Firestore (`collection(db, 'users', user.uid, 'orders')`) para obtener y mostrar los pedidos del usuario en tiempo real con `onSnapshot`.

### Mis Direcciones
**Técnico:** Permite al usuario realizar operaciones CRUD en sus direcciones. Las actualizaciones se envían a la `Server Action` `updateUser`.

---

## Panel de Administración

### Panel de Administración
*Painel principal com estatísticas. Requer início de sessão como administrador (maryandpopper@gmail.com).*

**Técnico:** Protegido por `AdminLayout`, que comprueba el email del usuario. Obtiene todos los pedidos y usuarios con `collectionGroup` y `onSnapshot` para calcular métricas. `OverviewChart` usa `recharts` para visualizar los datos.

### Gestión de Pedidos (Panel de Administración)
*Un sistema centralizado para visualizar, filtrar y actualizar el estado de todos los pedidos de la tienda.*

**Paso 1: Visualización de Todos los Pedidos (`/admin/orders`)**
- **Componente Principal:** `orders-client-page.tsx`.
- **Obtención de Datos:** Se utiliza una consulta `collectionGroup` sobre la colección `orders` de Firestore, ordenada por fecha. `onSnapshot` mantiene la lista actualizada en tiempo real.
- **Rendimiento:** Al ser una consulta de grupo, requiere un índice compuesto en Firestore, que debe ser creado desde la consola de Firebase. La consola suele sugerir el índice necesario si la consulta falla por primera vez.
- **Interfaz:** Los pedidos se muestran en un `Tabs` que los filtra localmente por estado (`Reserva Recibida`, `En Reparto`, etc.), lo que es eficiente y rápido para el usuario.

**Paso 2: Detalle y Actualización de un Pedido (`/admin/orders/[orderId]`)**
- **Paso de Datos:** Desde la tabla principal, cada fila de pedido tiene un enlace al detalle que pasa la ruta completa del documento de Firestore como un parámetro de URL (`/admin/orders/{id}?path={encodedPath}`). Esto permite al componente de detalle saber exactamente qué documento obtener, independientemente de si está en la subcolección de un usuario o de un invitado.
- **Componente de Detalle:** `order-details-client.tsx`.
- **Actualización de Estado:** El administrador puede cambiar el estado del pedido a través de un `Select`. Al guardar, se ejecuta la función `handleSaveChanges`.
```javascript
// Fragmento de /admin/orders/[orderId]/order-details-client.tsx
const handleSaveChanges = async () => {
    // ...
    const orderDocRef = doc(db, order.path);
    await updateDoc(orderDocRef, {
        status: order.status,
    });
    // ...
};
```
- **Integración con Notificaciones:** Después de actualizar el estado en Firestore, se invoca una `Server Action` (`trackOrderStatusUpdate`) que se comunica con la API de Klaviyo. Esto envía un email transaccional al cliente informándole del nuevo estado de su pedido (ej. "Tu pedido ha sido enviado").
```javascript
// Fragmento de /admin/orders/[orderId]/order-details-client.tsx
await trackOrderStatusUpdate(order, order.status);
```

**Paso 3: Gestión del Envío y Entrega (`/admin/shipping/[orderId]`)**
- **Flujo de Envío:** Desde el detalle del pedido, el botón "Gestionar Envío" actualiza el estado a `En Reparto` y redirige al administrador a la página de gestión de entrega.
- **Componente de Entrega:** `shipping-client.tsx`.
- **Recopilación de Prueba de Entrega:** Esta interfaz está diseñada para ser usada en un dispositivo móvil (como el del repartidor). Permite introducir el DNI de la persona que recibe el paquete y capturar su firma usando `react-signature-canvas`.
- **Confirmación o Incidencia:** El repartidor puede marcar el pedido como `Entregado` (guardando la firma y el DNI en el documento del pedido) o como `Incidencia` (si hay un problema). Ambas acciones actualizan el documento del pedido en Firestore.

### Gestión de Productos: "Añadir" y "Editar" en detalle
*Flujo técnico completo sobre cómo los productos son creados y editados desde el panel de administración.*

**1. Puntos de Entrada Separados:**
- **Crear Producto:** `/admin/products/new`.
- **Editar Producto:** `/admin/products/edit/[id-del-producto]`.

**2. Componente Central: `ProductForm`**
- Ambas páginas renderizan el mismo componente: `src/app/admin/products/_components/product-form.tsx`.
- En modo "Editar", la página primero obtiene los datos del producto desde Firestore y los pasa al formulario.

**3. Validación en el Navegador (Client-Side)**
- Se utiliza `react-hook-form` y `zod` para gestionar el estado de los campos y definir un esquema de validación. Al intentar guardar, `zod` comprueba que todos los campos cumplan las reglas.

**4. Comunicación con la Base de Datos (Client-Side)**
- En lugar de enviar los datos a un endpoint de API, la aplicación utiliza el **SDK de cliente de Firebase** para hablar directamente con Firestore.

**- Si se crea un producto nuevo:**
- Se llama a la función `setDoc()` de Firebase.
```javascript
// Código clave en new/page.tsx:
import { doc, setDoc } from 'firebase/firestore';

const productRef = doc(db, 'products', data.id); // Crea una referencia a un nuevo documento.
await setDoc(productRef, productData); // Escribe los datos en ese documento.
```

**- Si se edita un producto existente:**
- Se llama a la función `updateDoc()` de Firebase.
```javascript
// Código clave en edit/[id]/page.tsx:
import { doc, updateDoc } from 'firebase/firestore';

const productRef = doc(db, 'products', product.id); // Apunta al documento existente.
await updateDoc(productRef, productData); // Actualiza los campos de ese documento.
```

**5. Seguridad a través de `firestore.rules`**
- Esta comunicación directa es segura gracias a las **reglas de seguridad de Firestore**.

```javascript
match /products/{productId} {
  allow write: if isAdmin();
}
```

- **Traducción**: "Solo permite una operación de escritura en la colección `products` si el usuario que la solicita está autenticado y su email es `maryandpopper@gmail.com`".

### Guia de Campos de Produto e Lógica de Preços
*Adicionar, editar, arquivar e eliminar produtos do catálogo.*

**- Descripción Larga:** Un editor de texto enriquecido (Rich Text Editor) basado en **Tiptap**. El contenido se guarda como una **cadena de texto HTML** en la base de datos.

**- Inventario y Precios:**
  - **SKU (Stock Keeping Unit):** Un código de referencia único para el producto. Se genera automáticamente un SKU aleatorio al crear un nuevo producto.
  - **Precio Estándar y Precio de Oferta:** El campo principal es `price` (precio en céntimos). Cuando se introduce un valor en el campo `Precio de Oferta`, el valor del `Precio Estándar` se mueve al campo `originalPrice`, y el campo `price` se actualiza con el nuevo valor de oferta.
```javascript
// Lógica en product-form.tsx
if (salePrice > 0 && !currentOriginalPrice) {
  form.setValue('originalPrice', currentPrice);
}
form.setValue('price', salePrice);
```
  - **Stock Disponible:** Controla la cantidad de unidades disponibles.

**- Etiquetas:** `Etiquetas Visibles` (se muestran en la tarjeta del producto), `Categorías Internas` (para control lógico, ej: "novedad", "mas-vendido").

### Personalización Web
*Activar o desactivar funcionalidades clave, como la suscripción.*

**Técnico:** Lee y escribe en un archivo JSON en el servidor (`src/lib/site-settings.json`) usando `Server Actions`.