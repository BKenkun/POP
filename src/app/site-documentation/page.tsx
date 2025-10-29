

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Home, ShoppingCart, User, FileText, KeyRound, PackagePlus, Wand2, Palette, Code, CheckCircle, ExternalLink, Brush, Type, Feather, BadgePercent, Gift, Truck, UserPlus as UserPlusIcon, Shield } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const sections = [
  {
    title: 'Guía de Estilo y Sistema de Diseño',
    icon: Palette,
    features: [
      {
        name: 'Paleta de Colores',
        id: 'style-colors',
        path: '#',
        description: 'La paleta de colores principal definida en `globals.css` usando variables HSL de CSS.',
        details: [
          `**Técnico:** Los colores se aplican usando clases de Tailwind CSS que se corresponden con estas variables (ej. \`bg-primary\`, \`text-destructive\`).`,
          `
<pre><code class="language-css">
--primary: 45 95% 51%;      // Amarillo/Ámbar vibrante
--destructive: 0 84.2% 60.2%; // Rojo para ofertas/alertas
--secondary: 210 40% 96.1%;   // Gris azulado claro
--accent: 0 84.2% 60.2%;      // Mismo que destructive, para énfasis
--background: 0 0% 100%;       // Fondo principal (blanco)
--foreground: 240 10% 3.9%;  // Texto principal (casi negro)
</code></pre>
          `
        ]
      },
      {
        name: 'Tipografía',
        id: 'style-typography',
        path: '#',
        description: 'La fuente principal de la web es Inter, configurada en `src/app/layout.tsx`.',
        details: [
            "**Técnico:** Se usa `next/font` para optimizar la carga de la fuente. Las clases `font-headline` y `font-body` se asignan a la misma variable de CSS (`--font-inter`) en `tailwind.config.ts`, manteniendo la consistencia.",
            `
<pre><code class="language-javascript">
// En src/app/layout.tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
</code></pre>
            `
        ]
      },
      {
        name: 'Iconografía y Gráficos',
        id: 'style-icons',
        path: '#',
        description: 'Se utiliza la librería `lucide-react` para iconos y un SVG personalizado para el logo.',
        details: [
            "**Técnico:** Los iconos se importan directamente desde `lucide-react`. El logo (`src/components/logo.tsx`) es un componente SVG multicapa que permite el theming (cambia de color en modo oscuro/claro) al usar variables de CSS para sus colores.",
            `
<pre><code class="language-jsx">
import { Home, ShoppingCart } from 'lucide-react';
// ...
<Button>
  <ShoppingCart className="mr-2" /> Añadir
</Button>
</code></pre>
            `
        ]
      }
    ]
  },
    {
    title: 'Lógica de Negocio y Marketing',
    icon: Wand2,
    features: [
       {
        name: 'Verificación de Edad (Popup Modal)',
        id: 'logic-age-gate',
        path: '#',
        description: 'Un popup modal que bloquea el acceso a la web hasta que el usuario verifica que es mayor de 18 años.',
        details: [
          '**Funcionalidad:** Un popup modal que bloquea el acceso al sitio hasta que el usuario confirma ser mayor de 18 años, utilizando su fecha de nacimiento.',
          '**Técnico:** El componente `AgeVerificationPopup` (`src/components/age-verification-popup.tsx`) se renderiza en el `AppLayout`. Usa `localStorage` para recordar si un usuario ya ha sido verificado, evitando que el popup aparezca en cada visita. Si no hay confirmación previa, el popup aparece 500ms después de cargar la página para no ser demasiado abrupto. La validación de la fecha se realiza en tiempo real con `useMemo`. Si el usuario es menor de edad, se le muestra un error y el botón de "Entrar" permanece deshabilitado. Si hace clic en "Salir", es redirigido a google.com.',
          `
<pre><code class="language-javascript">
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
</code></pre>
            `,
          '**Estético:** Es un `Dialog` modal no descartable (el usuario no puede cerrarlo haciendo clic fuera o pulsando Escape). Presenta el logo y campos de entrada claros para la fecha de nacimiento.',
        ],
      },
      {
        name: 'Notificaciones de Ventas Híbridas (Reales y Simuladas)',
        id: 'logic-sales-notifications',
        path: '#',
        description: 'Popups que muestran compras para generar confianza. Prioriza las compras reales y rellena los huecos con notificaciones simuladas.',
        details: [
            "**Técnico:** El componente `SalesNotification` (`src/components/sales-notification.tsx`) ahora tiene una lógica híbrida. Utiliza `onSnapshot` de Firebase para escuchar la `collectionGroup` 'orders' en tiempo real. Cuando se detecta un nuevo pedido, se interrumpe el ciclo de notificaciones falsas y se muestra una notificación con los datos reales. Tras mostrar la notificación real, se reanuda el ciclo de notificaciones simuladas (que usan `setTimeout` con un delay aleatorio) para asegurar que la tienda siempre parezca activa.",
            `
<pre><code class="language-javascript">
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
</code></pre>
            `,
            "**Estético:** Las notificaciones aparecen en la esquina inferior izquierda. Usan el estilo por defecto de `Toast` con un icono de `ShoppingCart` para dar contexto visual."
        ]
      },
       {
        name: 'Popup de Bienvenida con Descuento',
        id: 'logic-welcome-popup',
        path: '#',
        description: 'Un popup que ofrece un 10% de descuento a cambio de la suscripción al boletín. Aparece solo a nuevos visitantes o después de 24h.',
        details: [
            "**Técnico:** El componente `WelcomePopup` (`src/components/welcome-popup.tsx`) usa `localStorage` para registrar si un usuario ya ha visto el popup. Solo se muestra si no hay registro previo o si ha pasado más de 24 horas. El formulario se integra con Klaviyo a través de la API Route `/api/subscribe`.",
            `
<pre><code class="language-javascript">
// En src/components/welcome-popup.tsx
useEffect(() => {
  const lastVisit = localStorage.getItem('lastPopperStoreVisit');
  const now = new Date().getTime();
  if (!lastVisit || (now - parseInt(lastVisit, 10)) > (24 * 60 * 60 * 1000)) {
    setTimeout(() => setIsOpen(true), 2000);
    localStorage.setItem('lastPopperStoreVisit', now.toString());
  }
}, []);
</code></pre>
            `,
            "**Estético:** Es un `Dialog` modal que se muestra 2 segundos después de cargar la página. Usa un icono de `Percent` para captar la atención."
        ]
      },
       {
        name: 'Política de Descuentos por Volumen',
        id: 'logic-volume-discounts',
        path: '/cart',
        description: 'Sistema de descuentos automáticos en el carrito basado en la cantidad de productos. No se aplica a pagos contra-reembolso.',
        details: [
            "**Técnico:** La lógica de cálculo se encuentra en `CartContext` (`src/context/cart-context.tsx`). Un `useMemo` recalcula el descuento (`volumeDiscount`) cada vez que cambia el número de artículos en el carrito (`cartCount`). En el `checkout-client-page.tsx`, este descuento solo se aplica al total si el método de pago no es contrareembolso.",
            `
<pre><code class="language-javascript">
// En src/context/cart-context.tsx
const volumeDiscount = useMemo(() => {
  let discountPercent = 0;
  if (cartCount >= 200) { discountPercent = 0.29; }
  // ... más rangos
  return Math.round(cartTotal * discountPercent);
}, [cartCount, cartTotal]);
</code></pre>
            `,
            "**Estético:** En el carrito (`CartSheet`) y en el checkout, el descuento se muestra claramente en rojo, tachando el subtotal original. En el checkout, la interfaz reacciona al método de pago seleccionado para mostrar u ocultar el descuento y el coste de envío."
        ]
      },
       {
        name: 'Sistema de Puntos de Fidelidad',
        id: 'logic-loyalty-points',
        path: '/account',
        description: 'Los usuarios ganan puntos por cada compra, que pueden ser canjeados por descuentos futuros.',
        details: [
            "**Técnico:** Al confirmar un pedido en `checkout-client-page.tsx`, se llama a la `Server Action` `updateUser` con la acción `update-points`. La acción calcula los puntos a añadir (1 punto por cada 10€ de compra) y utiliza `increment` de Firestore para una actualización atómica y segura.",
            `
<pre><code class="language-javascript">
// En src/app/checkout/checkout-client-page.tsx
const pointsToAdd = Math.floor(finalTotals.total / 1000);
if (pointsToAdd > 0) {
  await updateUser('update-points', { pointsToAdd });
}
</code></pre>
            `,
            "**Estético:** El saldo de puntos se muestra de forma prominente en el panel de cuenta del usuario (`/account`) dentro de una `Card` dedicada, junto con su equivalencia en euros."
        ]
      },
    ]
  },
  {
    title: 'Páginas Principales',
    icon: Home,
    features: [
      {
        name: 'Página de Inicio',
        id: 'page-home',
        path: '/',
        description: 'La página de bienvenida con productos destacados y acceso a las principales secciones.',
        details: [
            "**Técnico:** Utiliza `onSnapshot` de Firebase para cargar y escuchar cambios en los productos en tiempo real. `useMemo` se encarga de filtrar eficientemente los productos por categorías ('Novedades', 'Ofertas', etc.) sin recalcular en cada render.",
            `
<pre><code class="language-javascript">
// En src/app/page.tsx
useEffect(() => {
  const q = query(collection(db, 'products'), where('active', '!=', false));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // ... actualiza el estado de los productos
  });
  return () => unsubscribe();
}, []);
</code></pre>
            `,
            "**Estético:** El diseño se basa en un `grid` responsivo. Las `ProductCard` muestran un efecto de `hover` sutil y usan `next/image` con un proxy (`/api/image-proxy`) para optimizar y cachear las imágenes de Firebase Storage."
        ]
      },
      {
        name: 'Catálogo de Productos',
        id: 'page-products',
        path: '/products',
        description: 'Muestra todos los productos con filtros por marca, tamaño, composición y búsqueda.',
        details: [
            "**Técnico:** El componente `ProductFilters` gestiona el estado de los filtros (`useState`) y la lógica de filtrado y ordenación (`useMemo`). La URL se actualiza con los parámetros de filtro (`useRouter`, `useSearchParams`) para que los enlaces se puedan compartir.",
            `
<pre><code class="language-javascript">
// En src/app/products/filters.tsx
const params = new URLSearchParams(searchParams.toString());
params.delete(key);
values.forEach(value => params.append(key, value));
router.replace(\`\${pathname}?\${params.toString()}\`);
</code></pre>
            `,
            "**Estético:** Se usa un `Accordion` de ShadCN para organizar los filtros. La parrilla de productos (`ProductGrid`) muestra un mensaje claro cuando no hay resultados. El componente `Suspense` muestra un esqueleto de carga (`Skeleton`) mientras se obtienen los datos."
        ]
      },
      {
        name: 'Detalle de Producto',
        id: 'page-product-detail',
        path: '/product/rush-original-10ml',
        description: 'Vista detallada de un producto con galería, información y productos relacionados (ejemplo con "Rush Original").',
        details: [
            "**Técnico:** Carga los datos de un único producto desde Firestore usando `onSnapshot`. El estado del cliente (cantidad) se maneja con `useState`. La lógica para añadir al carrito (`ProductInfo`) se comunica con el `CartContext`.",
            "**Estético:** `ProductGallery` permite cambiar la imagen principal. `ProductDetails` utiliza un componente de `Tabs` para separar la descripción de los detalles técnicos. El carrusel de `RelatedProducts` está implementado con `Embla Carousel`."
        ]
      },
    ]
  },
  {
    title: 'Funcionalidades E-commerce',
    icon: ShoppingCart,
    features: [
       {
        name: 'Creador de Packs',
        id: 'feature-pack-builder',
        path: '/create-pack',
        description: 'Herramienta para que los clientes creen su propio pack de productos con descuentos por volumen.',
        details: [
            "**Técnico:** La lógica de precios es manejada por un flujo de Genkit (`calculatePackPriceFlow`) que calcula el descuento dinámicamente. El estado del pack se gestiona en el cliente (`useState`), y un `useEffect` con `setTimeout` (debounce) llama al flujo de IA para evitar peticiones excesivas.",
            `
<pre><code class="language-javascript">
// En src/ai/flows/calculate-pack-price-flow.ts
const calculatePackPriceFlow = ai.defineFlow(
  { ... },
  async (items) => {
    const originalTotal = ...;
    const discountPercent = ...;
    return { originalTotal, discountedTotal, savings };
  }
);
</code></pre>
            `,
            "**Estético:** La interfaz está dividida en tres columnas: filtros, selección de productos y resumen del pack. El resumen se actualiza en tiempo real mostrando el ahorro y el precio final."
        ]
      },
      {
        name: 'Carrito de la Compra',
        id: 'feature-cart',
        path: '#',
        description: 'El carrito es un panel lateral. Haz clic en el icono del carrito flotante para abrirlo después de añadir un producto.',
        details: [
          '**Funcionalidad:** Muestra los productos añadidos, permite ajustar cantidades o eliminarlos. Recalcula el subtotal y el descuento por volumen en tiempo real.',
          '**Técnico:** Implementado como un `Contexto de React` (`CartContext`) que vive en `src/context/cart-context.tsx`. Este contexto maneja un estado (`cartItems`) que es un array de productos con su cantidad. Las funciones `addToCart`, `updateQuantity` y `removeFromCart` manipulan este estado. El contexto no es persistente; se reinicia si el usuario recarga la página.',
          '**Lógica de Precios:** En el carrito se muestra de forma estimada el descuento por volumen (si aplica por pago anticipado) y los costes de envío. Esta estimación incentiva al usuario a completar la compra. La lógica de precios final y definitiva, que diferencia entre pago anticipado y contra-reembolso, se aplica en la página de checkout para proporcionar un feedback interactivo y claro al usuario.',
          '**Estético:** Utiliza un componente `Sheet` de ShadCN para deslizarse desde la derecha. Muestra el ahorro potencial del pago por adelantado y si el pedido califica para envío gratuito, incentivando al usuario a continuar con la compra.'
        ]
      },
       {
        name: 'Proceso de Pago (Checkout)',
        id: 'feature-checkout',
        path: '/checkout',
        description: 'Flujo de pago en 4 pasos. Requiere tener productos en el carrito para funcionar.',
        details: [
          '**Fase 1: Confirmar Carrito.** El usuario revisa los productos, puede ajustar cantidades usando el `QuantitySelector` o eliminar artículos. La lógica del `CartContext` (`updateQuantity`, `removeFromCart`) actualiza el estado. El subtotal y el posible descuento por volumen se muestran para dar una primera estimación.',
          '**Fase 2: Tus Datos.** Se solicita la información de envío. Si el usuario está autenticado (`useAuth`), puede seleccionar una de sus direcciones guardadas (obtenidas del `userDoc`) o rellenar el formulario. Un `RadioGroup` permite cambiar entre direcciones. La validación se hace con `react-hook-form` y `zod`. Una `Server Action` (`updateUser`) se encarga de guardar una nueva dirección si el usuario lo solicita.',
          '**Fase 3: Método de Pago.** El usuario elige entre dos categorías: "Contrareembolso" y "Pago por adelantado". **Aquí reside la lógica de precios clave:** un `useMemo` (`finalTotals`) recalcula el total del pedido en tiempo real basándose en el método seleccionado. Si es "Pago por adelantado", se aplica el `volumeDiscount` del `CartContext` y el envío es gratuito. Si es "Contrareembolso", el descuento se elimina y se suma el `SHIPPING_COST`. Esta interacción proporciona un feedback instantáneo sobre los beneficios de cada opción.',
          '**Fase 4: Revisión y Confirmación Final.** Se presenta un resumen completo y final. Al hacer clic en "Confirmar Pedido", se ejecuta la lógica final: si el método es "crypto", se llama a la `Server Action` `createNowPaymentsInvoice` que devuelve una URL de pago a la que se redirige al usuario. Para los demás métodos, se crea un nuevo documento en la colección `orders` de Firestore con todos los detalles del pedido usando `addDoc`.',
        ],
      },
    ]
  },
  {
    title: 'Suscripción "Dosis Mensual"',
    icon: PackagePlus,
    features: [
        {
            name: 'Página de Aterrizaje del Club',
            id: 'feature-subscription-landing',
            path: '/subscription',
            description: 'Página informativa para que los usuarios se unan al club de suscripción. El botón "Unirme al Club" inicia el proceso de pago.',
             details: [
                "**Técnico:** El botón 'Unirme' llama a la `Server Action` `createNowPaymentsSubscription`, que se comunica con la API de NOWPayments para generar una URL de pago de suscripción única para el usuario.",
                `
<pre><code class="language-javascript">
// En src/app/subscription/page.tsx
const result = await createNowPaymentsSubscription(user.email);
if (result.success && result.invoice_url) {
  window.location.href = result.invoice_url;
}
</code></pre>
                `,
                "**Estético:** Diseño atractivo con `Cards` para resaltar los beneficios, iconos de `lucide-react` y una imagen destacada para atraer al usuario."
            ]
        },
        {
            name: 'Gestión de la Suscripción',
            id: 'feature-subscription-management',
            path: '/account/subscription',
            description: 'Panel para suscriptores donde personalizan su caja mensual y gestionan su membresía.',
            details: [
                "**Técnico:** La página obtiene los productos de Firestore en tiempo real. La selección del usuario se guarda en `localStorage` (simulado). El botón de cancelar llama a la `Server Action` `cancelNowPaymentsSubscription`, que incluye la autenticación JWT requerida por NOWPayments.",
                "**Estético:** `SubscriptionTimeline` es un componente visual que muestra el estado del ciclo mensual. `MonthlyBoxSelector` utiliza `Dialogs` para la selección de productos."
            ]
        },
    ]
  },
  {
    title: 'Cuenta de Usuario y Autenticación',
    icon: User,
    features: [
      {
        name: 'Inicio de Sesión',
        id: 'auth-login',
        path: '/login',
        description: 'Formulario para que los usuarios existentes accedan a su cuenta, con lógica de redirección basada en rol.',
        details: [
            "**Técnico:** Utiliza `signInWithEmailAndPassword` de Firebase. Una vez autenticado, se obtiene el `idToken` del usuario y se envía a la API Route `/api/login`, que crea una **session cookie** segura (`httpOnly`). Esta cookie es crucial para autenticar al usuario en las `Server Actions` y en el lado del servidor.",
            "**Diferenciación de Roles y Redirección:** La lógica de redirección post-login es clave. El sistema comprueba el email del usuario: si es `maryandpopper@gmail.com`, lo identifica como administrador y lo redirige a `/admin`. Los usuarios normales son dirigidos a `/account` o a la página que intentaban visitar. Esta diferenciación de rol (`isAdmin` en `AuthContext`) permite a la interfaz adaptarse, mostrando u ocultando elementos como el enlace al 'Panel de Admin' en los menús.",
            `
<pre><code class="language-javascript">
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
</code></pre>
            `,
            "**Estético:** El formulario de login es simple y se presenta en una `Card`. La interfaz de la cuenta (`AccountSidebar`, `FloatingAccountButton`) es dinámica, mostrando opciones de administrador solo a los usuarios con ese rol, creando una experiencia coherente y segura.",
        ]
      },
      { name: 'Registro de Nuevo Usuario', id: 'auth-register', path: '/register', description: 'Formulario para que nuevos usuarios creen una cuenta.', details: ["**Técnico:** Usa `createUserWithEmailAndPassword`. Al registrarse, crea un nuevo documento para el usuario en la colección `users` de Firestore con valores iniciales.", "**Estético:** Similar al login, un formulario claro con validación de contraseña para asegurar que coincidan."] },
      { name: 'Panel de Cuenta', id: 'auth-account-dashboard', path: '/account', description: 'Dashboard principal del usuario con resumen de su actividad. Requiere iniciar sesión.', details: ["**Técnico:** Protegido por el `AccountLayout`, que redirige a los usuarios no autenticados. Muestra datos del `AuthContext`, como `loyaltyPoints` e `isSubscribed`.", "**Estético:** Usa `Cards` para segmentar la información: perfil, puntos y gestión de la suscripción/admin."] },
      { name: 'Mis Pedidos', id: 'auth-orders', path: '/account/orders', description: 'Historial de todos los pedidos realizados por el usuario.', details: ["**Técnico:** Realiza una consulta a Firestore (`collection(db, 'users', user.uid, 'orders')`) para obtener y mostrar los pedidos del usuario en tiempo real con `onSnapshot`.", "**Estético:** Muestra los pedidos en una `Table` con `Badges` de colores para indicar el estado de cada pedido."] },
      { name: 'Mis Direcciones', id: 'auth-addresses', path: '/account/addresses', description: 'Gestión de direcciones de envío y facturación guardadas.', details: ["**Técnico:** Permite al usuario realizar operaciones CRUD en sus direcciones. Las actualizaciones se envían a la `Server Action` `updateUser`.", "**Estético:** Utiliza un `Dialog` con `react-hook-form` para añadir/editar direcciones y un `AlertDialog` para confirmar la eliminación."] },
    ]
  },
  {
    title: 'Panel de Administración',
    icon: KeyRound,
    features: [
        { name: 'Dashboard de Admin', id: 'admin-dashboard', path: '/admin', description: 'Panel principal con estadísticas. Requiere iniciar sesión como admin (maryandpopper@gmail.com).', details: ["**Técnico:** Protegido por `AdminLayout`, que comprueba el email del usuario. Obtiene todos los pedidos y usuarios con `collectionGroup` y `onSnapshot` para calcular métricas. `OverviewChart` usa `recharts` para visualizar los datos.", "**Estético:** Interfaz densa en información con `Cards` de estadísticas, un gráfico de líneas y listas de pedidos/clientes recientes."] },
        { name: 'Gestión de Pedidos', id: 'admin-orders', path: '/admin/orders', description: 'Visualiza y gestiona todos los pedidos de la tienda.', details: ["**Técnico:** Usa `Tabs` para filtrar pedidos por estado. Los datos se obtienen una vez (`getDocs`) y se filtran en el cliente para mejorar el rendimiento. Cada fila enlaza a la página de detalle del pedido pasando la ruta del documento como parámetro URL.", "**Estético:** Diseño de `Tabs` claro y funcional. La tabla incluye acciones rápidas para ver o gestionar el envío."] },
        {
          name: 'Gestión de Productos: "Añadir" y "Editar" al detalle',
          id: 'admin-products-crud-detail',
          path: '/admin/products',
          description: 'Flujo técnico completo sobre cómo se crean y editan los productos desde el panel de administración.',
          details: [
              'La creación y edición de productos, aunque son dos acciones distintas, están diseñadas de forma muy eficiente para compartir la máxima cantidad de código posible. Así es como funciona el flujo completo, desde que haces clic hasta que los datos se guardan en la base de datos:',
              '**1. Puntos de Entrada Separados:**<br/>- **Crear Producto:** Al hacer clic en "Nuevo Producto" en `/admin/products`, eres dirigido a la página `/admin/products/new`.<br/>- **Editar Producto:** Al hacer clic en "Editar" en un producto existente, eres dirigido a una página dinámica como `/admin/products/edit/[id-del-producto]`.',
              '**2. El Componente Central: `ProductForm`**<br/>- Ambas páginas (`new` y `edit`) renderizan el mismo componente: `src/app/admin/products/_components/product-form.tsx`. Este es el corazón de la funcionalidad.<br/>- **En modo "Crear"**: El formulario se renderiza vacío, listo para que introduzcas los datos de un nuevo producto.<br/>- **En modo "Editar"**: La página de edición primero obtiene los datos del producto correspondiente desde Firestore y se los pasa al `ProductForm`, que se rellena con la información existente.',
              '**3. Validación en el Navegador (Client-Side)**<br/>- **Tecnología**: El formulario utiliza la librería **`react-hook-form`** para gestionar el estado de todos los campos y **`zod`** para definir un esquema de validación estricto.<br/>- **Funcionamiento**: Mientras escribes, `react-hook-form` controla los datos. Al intentar guardar, `zod` comprueba que todos los campos cumplan las reglas (ej. que el nombre no esté vacío, que el precio sea un número, que la URL sea válida, etc.). Si algo falla, muestra un mensaje de error junto al campo correspondiente sin necesidad de comunicarse con el servidor.',
              '**4. Comunicación con la Base de Datos (Client-Side)**<br/>- Cuando haces clic en el botón **"Guardar Producto"**, se activa la función `handleSave` dentro de la página correspondiente (`new/page.tsx` o `edit/[id]/page.tsx`).<br/>- Aquí ocurre la magia. En lugar de enviar los datos a un endpoint de API o una Server Action, la aplicación utiliza el **SDK de cliente de Firebase** para hablar directamente con la base de datos de Firestore.',
              '**- Si estás Creando un Producto Nuevo:**<br/>- Se llama a la función `setDoc()` de Firebase.<br/><pre><code class="language-javascript">// Código clave en new/page.tsx:<br/>import { doc, setDoc } from \'firebase/firestore\';<br/><br/>const productRef = doc(db, \'products\', data.id); // Crea una referencia a un nuevo documento.<br/>await setDoc(productRef, productData); // Escribe los datos en ese documento.</code></pre>',
              '**- Si estás Editando un Producto Existente:**<br/>- Se llama a la función `updateDoc()` de Firebase.<br/><pre><code class="language-javascript">// Código clave en edit/[id]/page.tsx:<br/>import { doc, updateDoc } from \'firebase/firestore\';<br/><br/>const productRef = doc(db, \'products\', product.id); // Apunta al documento existente.<br/>await updateDoc(productRef, productData); // Actualiza los campos de ese documento.</code></pre>',
              '**5. ¿Cómo es esto seguro? El Rol de `firestore.rules`**<br/>- Esta comunicación directa desde el navegador solo es posible porque nuestras **reglas de seguridad de Firestore** actúan como un vigilante en la nube.<br/>- La regla que hemos definido para la colección de productos es:<br/><pre><code class="language-javascript">match /products/{productId} {<br/>  allow write: if isAdmin();<br/>}</code></pre><br/>- **Traducción**: "Solo permite una operación de escritura (crear, editar, borrar) en la colección `products` si el usuario que la solicita está autenticado y su email es `maryandpopper@gmail.com`".<br/>- Si cualquier otra persona intentara ejecutar ese mismo código desde la consola de su navegador, Firestore rechazaría la petición con un error `permission-denied`.',
              'Este enfoque es moderno, rápido y seguro, combinando la agilidad del desarrollo en el cliente con la robusta seguridad de las reglas de Firebase en el servidor.'
          ]
        },
        {
          name: 'Guía de Campos de Producto y Lógica de Precios',
          id: 'admin-products-fields',
          path: '/admin/products/new',
          description: 'Añade, edita, archiva y elimina productos del catálogo.',
          details: [
            '**- Descripción Larga:** Un editor de texto enriquecido (Rich Text Editor) basado en **Tiptap**. Permite dar formato al texto (negrita, cursiva, encabezados, listas) y cambiar colores. El contenido se guarda como una **cadena de texto HTML** en la base de datos, lo que permite renderizarlo con su formato en la página de detalle del producto.',
            '**- Inventario y Precios:** Este grupo de campos gestiona la parte comercial y logística del producto.',
            '  - **SKU (Stock Keeping Unit):** Un código de referencia único para el producto. **Generación Automática:** Al crear un nuevo producto, el sistema genera automáticamente un SKU aleatorio para agilizar el proceso, aunque el sistema debería validar que no haya duplicados. **Edición Manual:** Este campo es totalmente editable, permitiéndote asignar códigos personalizados si lo necesitas.',
            '  - **Precio Estándar y Precio de Oferta:** La lógica de precios es dual. El campo principal es `price` (precio en céntimos). Cuando se introduce un valor en el campo `Precio de Oferta`, el valor del `Precio Estándar` se mueve al campo `originalPrice`, y el campo `price` se actualiza con el nuevo valor de oferta. Si se borra el precio de oferta, el sistema revierte `originalPrice` al campo `price`. <pre><code class="language-javascript">// Lógica en product-form.tsx\\nif (salePrice > 0 && !currentOriginalPrice) {\\n  form.setValue(\'originalPrice\', currentPrice);\\n}\\nform.setValue(\'price\', salePrice);</code></pre>',
            '  - **Stock Disponible:** Controla la cantidad de unidades disponibles. Si es `0`, el producto se muestra como "Agotado" y no se puede añadir al carrito. El `QuantitySelector` también usa este valor como límite máximo.',
            '**- Etiquetas:** `Etiquetas Visibles` (se muestran como badges en la tarjeta del producto, ej: "Nuevo"), `Categorías Internas` (para control lógico, ej: "novedad", "mas-vendido", "pack").'
          ]
        },
        { name: 'Personalización Web', id: 'admin-web', path: '/admin/web', description: 'Activa o desactiva funcionalidades clave, como la suscripción.', details: ["**Técnico:** Lee y escribe en un archivo JSON en el servidor (`src/lib/site-settings.json`) usando `Server Actions`. Este archivo actúa como una bandera de características simple.", "**Estético:** Interfaz simple con `Switch` para activar o desactivar la funcionalidad de suscripción en toda la web."] },
    ]
  },
  {
    title: 'Páginas Informativas y Legales',
    icon: FileText,
    features: [
      { name: 'Blog', id: 'info-blog', path: '/blog', description: 'Listado de artículos y noticias.', details: ["**Técnico:** Contenido estático hardcodeado en `src/lib/posts.ts`. Es una página renderizada en el servidor (Server Component) para un SEO óptimo.", "**Estético:** Diseño clásico de blog con tarjetas de previsualización que incluyen imagen, título, extracto y fecha."] },
      { name: 'Contacto', id: 'info-contact', path: '/contacto', description: 'Formulario de contacto e información legal de la empresa.', details: ["**Técnico:** Un formulario controlado por el cliente que simula el envío de un email. No realiza una acción real de servidor.", "**Estético:** Diseño a dos columnas que presenta la información de contacto junto al formulario."] },
      { name: 'Envíos y Tarifas', id: 'info-shipping', path: '/envio-tarifas', description: 'Detalles sobre las políticas y costes de envío.', details: ["**Técnico:** Página de contenido estático.", "**Estético:** Utiliza `Tables` para presentar las tarifas de forma clara y `Alerts` para destacar información importante."] },
      { name: 'Términos y Condiciones', id: 'info-terms', path: '/terminos-y-condiciones', description: 'Condiciones generales de contratación y venta.', details: ["**Técnico:** Página de contenido estático.", "**Estético:** Texto largo formateado dentro de una `Card` con estilos `prose` para mejorar la legibilidad."] },
    ]
  },
];

const CHECKLIST_STORAGE_KEY = 'site_documentation_checklist';

export default function SiteDocumentationPage() {
  const [checkedState, setCheckedState] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    try {
        const storedState = localStorage.getItem(CHECKLIST_STORAGE_KEY);
        if (storedState) {
            setCheckedState(JSON.parse(storedState));
        }
    } catch (e) {
        console.error("Could not load checklist state from localStorage", e);
    }
  }, []);

  const handleCheckedChange = (id: string, isChecked: boolean) => {
    const newState = { ...checkedState, [id]: isChecked };
    setCheckedState(newState);
    try {
        localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
        console.error("Could not save checklist state to localStorage", e);
    }
  };


  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Documentación del Sitio Web</h1>
        <div className="prose prose-lg dark:prose-invert max-w-3xl mx-auto text-foreground/80">
            <p>
                Esta página es un <strong>manual de identidad y arquitectura</strong> del sitio, diseñada para ser la fuente de verdad para desarrolladores, diseñadores y gestores de contenido. Su propósito es garantizar la coherencia, facilitar el mantenimiento y guiar la implementación de nuevas funcionalidades.
            </p>
            <p>
                Para los <strong>diseñadores</strong>, define el sistema de diseño visual: la paleta de colores, la tipografía y los componentes de interfaz. Para los <strong>desarrolladores</strong>, actúa como un mapa de la arquitectura técnica, detallando el stack tecnológico (Next.js, Firebase, Genkit), los patrones de código clave y ejemplos de implementación para las funcionalidades más importantes.
            </p>
        </div>
      </header>

      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <section.icon className="h-7 w-7 text-primary" />
              <span>{section.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {section.features.map((feature) => (
                <div key={feature.id} className="p-4 border rounded-lg hover:bg-secondary/50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                       <Checkbox 
                            id={feature.id} 
                            className="h-5 w-5"
                            checked={!!checkedState[feature.id]}
                            onCheckedChange={(isChecked) => handleCheckedChange(feature.id, !!isChecked)}
                        />
                       <Label htmlFor={feature.id} className="text-base font-semibold">{feature.name}</Label>
                    </div>
                    {feature.path !== '#' && (
                         <Button asChild variant="outline" size="sm" className="shrink-0">
                            <Link href={feature.path} target="_blank" rel="noopener noreferrer">
                                Probar
                                <ExternalLink className="ml-2 h-4 w-4"/>
                            </Link>
                        </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 ml-8 sm:ml-0">{feature.description}</p>
                  
                  <Accordion type="single" collapsible className="w-full mt-2">
                    <AccordionItem value="item-1" className="border-b-0">
                      <AccordionTrigger className="text-sm py-2 hover:no-underline text-muted-foreground">Ver detalles de implementación</AccordionTrigger>
                      <AccordionContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 space-y-2 pl-4 border-l-2 ml-2 border-primary/50">
                           {feature.details.map((detail, i) => (
                               <div key={i} dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                           ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}



