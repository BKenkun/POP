
# Arquitectura y Guía de Implementación del E-commerce

## Introducción

Este documento es un manual de arquitectura del sitio, concebido para ser una fuente de verdad para los programadores. Su objetivo es garantizar la consistencia, facilitar el mantenimiento y orientar la implementación de nuevas funcionalidades.

Actúa como un mapa de la arquitectura técnica, detallando el stack tecnológico (Next.js, Firebase, Genkit), los principales patrones de código y ejemplos de implementación para las funcionalidades más importantes.

---

## Guía de Estilo y Sistema de Diseño

### Paleta de Colores
*La paleta de colores principal definida en `globals.css` usando variables CSS HSL.*

**Técnico:** Los colores se aplican usando clases de Tailwind CSS que se corresponden con estas variables (ej. `bg-primary`, `text-destructive`).

```css
--primary: 45 95% 51%;      // Amarillo/Ámbar vibrante
--destructive: 0 84.2% 60.2%; // Rojo para ofertas/alertas
--secondary: 210 40% 96.1%;   // Gris azulado claro
--accent: 0 84.2% 60.2%;      // Mismo que destructive, para énfasis
--background: 0 0% 100%;       // Fondo principal (blanco)
--foreground: 240 10% 3.9%;  // Texto principal (casi negro)
```

### Tipografía
*La fuente principal del sitio es Inter, configurada en `src/app/layout.tsx`.*

**Técnico:** Se usa `next/font` para optimizar la carga de la fuente. Las clases `font-headline` y `font-body` se asignan a la misma variable de CSS (`--font-inter`) en `tailwind.config.ts`, manteniendo la consistencia.

```javascript
// En src/app/layout.tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
```

### Iconografia y Gráficos
*La biblioteca `lucide-react` es usada para iconos y un SVG personalizado es usado para el logótipo.*

**Técnico:** Los iconos se importan directamente desde `lucide-react`. El logo (`src/components/logo.tsx`) es un componente SVG multicapa que permite el theming (cambia de color en modo oscuro/claro) al usar variables de CSS para sus colores.

```jsx
import { Home, ShoppingCart } from 'lucide-react';
// ...
<Button>
  <ShoppingCart className="mr-2" /> Añadir
</Button>
```

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

## Páginas Principales

### Página Inicial
*La página de bienvenida con productos en destaque y acceso a las secciones principales.*

**Técnico:** Utiliza `onSnapshot` de Firebase para cargar y escuchar cambios en los productos en tiempo real. `useMemo` se encarga de filtrar eficientemente los productos por categorías ('Novedades', 'Ofertas', etc.) sin recalcular en cada render.

```javascript
// En src/app/page.tsx
useEffect(() => {
  const q = query(collection(db, 'products'), where('active', '!=', false));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // ... actualiza el estado de los productos
  });
  return () => unsubscribe();
}, []);
```

### Catálogo de Productos
*Muestra todos los productos con filtros por marca, tamaño, composición y búsqueda.*

**Técnico:** El componente `ProductFilters` gestiona el estado de los filtros (`useState`) y la lógica de filtrado y ordenación (`useMemo`). La URL se actualiza con los parámetros de filtro (`useRouter`, `useSearchParams`) para que los enlaces se puedan compartir.

```javascript
// En src/app/products/filters.tsx
const params = new URLSearchParams(searchParams.toString());
params.delete(key);
values.forEach(value => params.append(key, value));
router.replace(`${pathname}?${params.toString()}`);
```

### Detalle del Producto
*Vista detallada de un producto con una galería, informaciones y productos relacionados (ejemplo con "Rush Original").*

**Técnico:** Carga los datos de un único producto desde Firestore usando `onSnapshot`. El estado del cliente (cantidad) se maneja con `useState`. La lógica para añadir al carrito (`ProductInfo`) se comunica con el `CartContext`.

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

### Proceso de Checkout
*Un flujo de checkout de 4 pasos. Requiere artículos en el carrito para funcionar.*

**Fase 1: Confirmar Carrito.** El usuario revisa los productos y puede ajustar cantidades o eliminar artículos usando la lógica del `CartContext`.

**Fase 2: Tus Datos.** Se solicita la información de envío. Si el usuario está autenticado, puede seleccionar una de sus direcciones guardadas. Una `Server Action` (`updateUser`) se encarga de guardar una nueva dirección si el usuario lo solicita.

**Fase 3: Método de Pago.** El usuario elige entre "Contrareembolso" y "Pago por adelantado". Un `useMemo` (`finalTotals`) recalcula el total del pedido en tiempo real basándose en el método seleccionado.

**Fase 4: Revisión y Confirmación Final.** Si el método es "crypto", se llama a la `Server Action` `createNowPaymentsInvoice` que devuelve una URL de pago. Para los demás métodos, se crea un nuevo documento en la colección `orders` de Firestore con todos los detalles del pedido usando `addDoc`.

---

## Suscripción "Dosis Mensual" (con NOWPayments)

### Flujo de Inicio de Suscripción
*Página de destino y proceso de pago inicial para adherirse al club de suscripción.*

**1. Página de Aterrizaje (`/subscription`):**
- **Archivo:** `src/app/subscription/page.tsx`
- **Función:** El botón principal 'Unirme al Club' invoca a la `Server Action` `createNowPaymentsInvoice`.

**2. Server Action (`createNowPaymentsInvoice`):**
- **Archivo:** `src/app/actions/nowpayments.ts`
- **Función:** Es el intermediario seguro entre nuestra aplicación y la API de NOWPayments. Utiliza la `NOWPAYMENTS_API_KEY` guardada en las variables de entorno del servidor.
- **Acción:** Realiza una petición `POST` a la API de NOWPayments (`https://api.nowpayments.io/v1/invoice`) para crear una factura de pago único.

```javascript
// En src/app/subscription/page.tsx
const result = await createNowPaymentsInvoice({
  price_amount: 44, // Precio de la suscripción
  price_currency: 'eur',
  order_id: `sub_${user.uid}_${Date.now()}`, // ID único para la transacción
  order_description: 'Suscripción Club Dosis Mensual'
});
```

**3. Redirección al Pago:**
- La `Server Action` devuelve un objeto con una URL de pago (`invoice_url`) a la que se redirige automáticamente al usuario.

```javascript
// En src/app/subscription/page.tsx
if (result.success && result.invoice_url) {
  window.location.href = result.invoice_url;
}
```

### Gestión y Cancelación de Suscripción
*Un panel para los suscriptores personalizaren su caja y gestionaren su adhesión.*

**1. Panel de Suscriptor (`/account/subscription`):**
- **Archivo:** `src/app/account/subscription/page.tsx`
- **Función:** Esta página es accesible solo para usuarios con una suscripción activa (`isSubscribed` en `AuthContext`). Contiene el botón 'Gestionar mi Suscripción' para la cancelación.

**2. Server Action de Cancelación (`cancelNowPaymentsSubscription`):**
- **Archivo:** `src/app/actions/manage-subscription.ts`
- **Función:** Lógica segura para cancelar una suscripción en NOWPayments. Primero obtiene un token JWT de NOWPayments y luego realiza una petición `DELETE` al endpoint de suscripciones, incluyendo el ID de la suscripción del usuario.
- Si la cancelación es exitosa, actualiza el estado del usuario en Firestore (`isSubscribed: false`).

```javascript
// En src/app/actions/manage-subscription.ts
async function getNowPaymentsJwt(): Promise<string> {
  const response = await fetch(`${NOWPAYMENTS_API_URL}/auth`, { ... });
  // ...
  return data.token;
}
```

### Webhook de Notificaciones (IPN)
*Endpoint que a NOWPayments usa para notificar o servidor sobre eventos de subscrição.*

**Archivo:** `src/app/api/nowpayments/subscription-webhook/route.ts`

**Función:** Endpoint de API que recibe peticiones `POST` desde los servidores de NOWPayments para gestionar eventos de suscripción (pagos recurrentes, fallos, etc.).

**Seguridad:** En producción, este endpoint debe verificar la firma (`x-nowpayments-sig`) para asegurar que la petición es legítima.

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

### Gestión de Pedidos
**Técnico:** Usa `Tabs` para filtrar pedidos por estado. Los datos se obtienen una vez (`getDocs`) y se filtran en el cliente. Cada fila enlaza a la página de detalle del pedido pasando la ruta del documento como parámetro URL.

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

---

## Páginas Informativas y Legales

### Blog
**Técnico:** Contenido estático hardcodeado en `src/lib/posts.ts`. Es una página renderizada en el servidor (Server Component) para un SEO óptimo.

### Contacto
**Técnico:** Un formulario controlado por el cliente que simula el envío de un email.

### Envío y Tarifas
**Técnico:** Página de contenido estático.

### Términos y Condiciones
**Técnico:** Página de contenido estático.
