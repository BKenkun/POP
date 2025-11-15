
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Home, ShoppingCart, User, FileText, KeyRound, PackagePlus, Wand2, Palette, Code, CheckCircle, ExternalLink, Brush, Type, Feather, BadgePercent, Gift, Truck, UserPlus as UserPlusIcon, Shield, Database, Download } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Logo } from '@/components/logo';
import { useTranslation } from '@/context/language-context';

const CHECKLIST_STORAGE_KEY = 'site_documentation_checklist';

export default function SiteDocumentationPage() {
  const { t } = useTranslation();
  const [checkedState, setCheckedState] = useState<{[key: string]: boolean}>({});
  
  const sections = [
    {
    title: t('docs.style_guide_title'),
    icon: Palette,
    features: [
      {
        name: t('docs.colors_title'),
        id: 'style-colors',
        path: '#',
        description: t('docs.colors_desc'),
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
        name: t('docs.typography_title'),
        id: 'style-typography',
        path: '#',
        description: t('docs.typography_desc'),
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
        name: t('docs.icons_title'),
        id: 'style-icons',
        path: '#',
        description: t('docs.icons_desc'),
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
      title: t('docs.brand_assets_title'),
      icon: Feather,
      features: [
          {
              name: t('docs.logo_title'),
              id: 'brand-logo',
              path: '#',
              description: t('docs.logo_desc'),
              details: [
                  `**Previsualización:** El logo utiliza un diseño multicapa para crear un efecto de "sticker" con extrusión. Está diseñado para adaptarse a los modos claro y oscuro del sitio.`,
                  `<div class="my-4 p-4 border rounded-lg flex justify-center items-center bg-muted"><Logo class="h-16" /></div>`,
                  `**Descarga SVG (Vectorial):** El botón "Descargar Logo (SVG)" genera un archivo \`.svg\` directamente en tu navegador. La función \`handleDownloadLogo\` crea una cadena de texto con el código SVG, incluyendo los estilos CSS y la URL de la fuente de Google (con el carácter '&' correctamente escapado como '&amp;'). Luego, crea un "Blob" (un objeto de archivo en memoria) de tipo \`image/svg+xml\` y genera una URL temporal para iniciar la descarga. Este método es ideal para obtener el archivo vectorial original para usar en software de diseño.`,
                  `**Descarga PNG (Imagen):** El botón "Descargar Logo (PNG)" utiliza una técnica de renderizado en el navegador para convertir el SVG en una imagen PNG. La función \`handleDownloadPng\` sigue estos pasos:<br>
                   1. **Crea un Canvas:** Genera un elemento \`<canvas>\` de HTML en memoria. Este elemento actúa como un lienzo digital invisible.<br>
                   2. **Carga el SVG en una Imagen:** El código SVG del logo se convierte en un Blob y se carga en un objeto \`Image()\`.<br>
                   3. **Dibuja en el Canvas:** Una vez que la imagen SVG se ha cargado, se "dibuja" sobre el canvas con unas dimensiones de alta resolución (1100x170px) para asegurar la calidad.<br>
                   4. **Exporta a PNG:** Se llama al método \`canvas.toDataURL('image/png')\`, que convierte el contenido del canvas en una cadena de texto Base64 que representa el archivo PNG.<br>
                   5. **Inicia la Descarga:** Finalmente, se crea un enlace temporal con esta URL de datos y se simula un clic en él para que el navegador inicie la descarga del archivo \`popper-online-logo.png\`.`
              ]
          }
      ]
  },
  {
      title: t('docs.data_arch_title'),
      icon: Database,
      features: [
           {
                name: t('docs.data_flow_title'),
                id: 'arch-data-flow',
                path: '#',
                description: t('docs.data_flow_desc'),
                details: [
                    "**1. El Modelo: Cliente Directo a Base de Datos**<br/>A diferencia de una arquitectura tradicional que usa una API REST como intermediaria, esta aplicación adopta un enfoque más moderno y directo. El panel de administración (que se ejecuta en el navegador del administrador) utiliza el **SDK de cliente de Firebase** para comunicarse directamente con la base de datos de Firestore. Esto elimina la necesidad de escribir y mantener un backend completo para las operaciones CRUD (Crear, Leer, Actualizar, Borrar).",
                    "**2. ¿Cómo es seguro este modelo? El rol de las Reglas de Seguridad**<br/>La seguridad no recae en un endpoint de servidor oculto, sino en las **Reglas de Seguridad de Firestore** (\`firestore.rules\`), que actúan como un vigilante inteligente en la nube. Antes de permitir cualquier operación de lectura o escritura, Firestore evalúa estas reglas. Para la gestión de productos, la regla clave es:<br/><pre><code class='language-javascript'>match /products/{productId} {<br/>  allow read: if true;<br/>  allow write: if isAdmin();<br/>}<br/><br/>function isAdmin() {<br/>  return request.auth != null && request.auth.token.email == 'maryandpopper@gmail.com';<br/>}</code></pre><br/>- **\`allow read: if true;\`**: Permite que cualquier persona (clientes, visitantes) lea la información de los productos, algo necesario para una tienda online.<br/>- **\`allow write: if isAdmin();\`**: **Esta es la clave de la seguridad**. Solo permite operaciones de escritura (crear, editar, borrar) si la petición proviene de un usuario autenticado cuyo token de autenticación (\`request.auth.token\`) contiene el email \`maryandpopper@gmail.com\`. Cualquier otro intento de escritura es rechazado automáticamente por la base de datos.",
                    "**3. Flujo de Escritura (Crear o Modificar un Producto)**<br/>Cuando el administrador guarda un producto desde el panel:<br/>a. **Componente de UI**: Se utiliza el formulario \`ProductForm\` (\`src/app/admin/products/_components/product-form.tsx\`).<br/>b. **Validación**: Los datos se validan en el navegador usando \`react-hook-form\` y \`zod\` para asegurar que todo es correcto antes de enviar.<br/>c. **Llamada a Firestore**: La función \`handleSave\` en las páginas \`new\` o \`edit\` llama directamente a las funciones del SDK de Firebase:<br/>- **Para crear un producto nuevo:**<br/><pre><code class='language-javascript'>// En: src/app/admin/products/new/page.tsx<br/>import { doc, setDoc } from 'firebase/firestore';<br/><br/>const productRef = doc(db, 'products', data.id);<br/>await setDoc(productRef, productData); // Crea el documento.</code></pre><br/>- **Para modificar un producto existente:**<br/><pre><code class='language-javascript'>// En: src/app/admin/products/edit/[id]/page.tsx<br/>import { doc, updateDoc } from 'firebase/firestore';<br/><br/>const productRef = doc(db, 'products', product.id);<br/>await updateDoc(productRef, productData); // Actualiza el documento.</code></pre>",
                    "**4. Flujo de Lectura (Leer los Productos)**<br/>Para mostrar los productos en el panel de administración, se sigue un patrón similar de comunicación directa:<br/>a. **Suscripción en Tiempo Real**: La aplicación utiliza la función \`onSnapshot\` de Firebase en el componente \`AdminProductsPage\` (\`src/app/admin/products/page.tsx\`).<br/>b. **Funcionamiento**: \`onSnapshot\` abre una conexión persistente con Firestore. En lugar de solo 'pedir' los datos una vez, 'escucha' cualquier cambio en la colección de productos. Si se añade, modifica o elimina un producto (incluso desde otro dispositivo), Firestore envía automáticamente los datos actualizados al cliente, y la interfaz se actualiza en tiempo real gracias a la reactividad de React.",
                ]
           }
      ]
  },
    {
    title: t('docs.business_logic_title'),
    icon: Wand2,
    features: [
       {
        name: t('docs.age_gate_title'),
        id: 'logic-age-gate',
        path: '#',
        description: t('docs.age_gate_desc'),
        details: [
          '**Funcionalidad:** Un popup modal que bloquea el acceso al sitio hasta que el usuario confirma ser mayor de 18 años, utilizando su fecha de nacimiento.',
          '**Técnico:** El componente \`AgeVerificationPopup\` (\`src/components/age-verification-popup.tsx\`) se renderiza en el \`AppLayout\`. Usa \`localStorage\` para recordar si un usuario ya ha sido verificado, evitando que el popup aparezca en cada visita. Si no hay confirmación previa, el popup aparece 500ms después de cargar la página para no ser demasiado abrupto. La validación de la fecha se realiza en tiempo real con \`useMemo\`. Si el usuario es menor de edad, se le muestra un error y el botón de "Entrar" permanece deshabilitado. Si hace clic en "Salir", es redirigido a google.com.',
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
          '**Estético:** Es un \`Dialog\` modal no descartable (el usuario no puede cerrarlo haciendo clic fuera o pulsando Escape). Presenta el logo y campos de entrada claros para la fecha de nacimiento.',
        ],
      },
      {
        name: t('docs.sales_notifications_title'),
        id: 'logic-sales-notifications',
        path: '#',
        description: t('docs.sales_notifications_desc'),
        details: [
            "**Técnico:** El componente \`SalesNotification\` (\`src/components/sales-notification.tsx\`) ahora tiene una lógica híbrida. Utiliza \`onSnapshot\` de Firebase para escuchar la \`collectionGroup\` 'orders' en tiempo real. Cuando se detecta un nuevo pedido, se interrumpe el ciclo de notificaciones falsas y se muestra una notificación con los datos reales. Tras mostrar la notificación real, se reanuda el ciclo de notificaciones simuladas (que usan \`setTimeout\` con un delay aleatorio) para asegurar que la tienda siempre parezca activa.",
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
            "**Estético:** Las notificaciones aparecen en la esquina inferior izquierda. Usan el estilo por defecto de \`Toast\` con un icono de \`ShoppingCart\` para dar contexto visual."
        ]
      },
       {
        name: t('docs.welcome_popup_title'),
        id: 'logic-welcome-popup',
        path: '#',
        description: t('docs.welcome_popup_desc'),
        details: [
            "**Técnico:** El componente \`WelcomePopup\` (\`src/components/welcome-popup.tsx\`) usa \`localStorage\` para registrar si un usuario ya ha visto el popup. Solo se muestra si no hay registro previo o si ha pasado más de 24 horas. El formulario se integra con Klaviyo a través de la API Route \`/api/subscribe\`.",
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
            "**Estético:** Es un \`Dialog\` modal que se muestra 2 segundos después de cargar la página. Usa un icono de \`Percent\` para captar la atención."
        ]
      },
       {
        name: t('docs.volume_discounts_title'),
        id: 'logic-volume-discounts',
        path: '/cart',
        description: t('docs.volume_discounts_desc'),
        details: [
            "**Técnico:** La lógica de cálculo se encuentra en \`CartContext\` (\`src/context/cart-context.tsx\`). Un \`useMemo\` recalcula el descuento (\`volumeDiscount\`) cada vez que cambia el número de artículos en el carrito (\`cartCount\`). En el \`checkout-client-page.tsx\`, este descuento solo se aplica al total si el método de pago no es contrareembolso.",
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
            "**Estético:** En el carrito (\`CartSheet\`) y en el checkout, el descuento se muestra claramente en rojo, tachando el subtotal original. En el checkout, la interfaz reacciona al método de pago seleccionado para mostrar u ocultar el descuento y el coste de envío."
        ]
      },
       {
        name: t('docs.loyalty_points_title'),
        id: 'logic-loyalty-points',
        path: '/account',
        description: t('docs.loyalty_points_desc'),
        details: [
            "**Técnico:** Al confirmar un pedido en \`checkout-client-page.tsx\`, se llama a la \`Server Action\` \`updateUser\` con la acción \`update-points\`. La acción calcula los puntos a añadir (1 punto por cada 10€ de compra) y utiliza \`increment\` de Firestore para una actualización atómica y segura.",
            `
<pre><code class="language-javascript">
// En src/app/checkout/checkout-client-page.tsx
const pointsToAdd = Math.floor(finalTotals.total / 1000);
if (pointsToAdd > 0) {
  await updateUser('update-points', { pointsToAdd });
}
</code></pre>
            `,
            "**Estético:** El saldo de puntos se muestra de forma prominente en el panel de cuenta del usuario (\`/account\`) dentro de una \`Card\` dedicada, junto con su equivalencia en euros."
        ]
      },
    ]
  },
  {
    title: t('docs.main_pages_title'),
    icon: Home,
    features: [
      {
        name: t('docs.home_page_title'),
        id: 'page-home',
        path: '/',
        description: t('docs.home_page_desc'),
        details: [
            "**Técnico:** Utiliza \`onSnapshot\` de Firebase para cargar y escuchar cambios en los productos en tiempo real. \`useMemo\` se encarga de filtrar eficientemente los productos por categorías ('Novedades', 'Ofertas', etc.) sin recalcular en cada render.",
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
            "**Estético:** El diseño se basa en un \`grid\` responsivo. Las \`ProductCard\` muestran un efecto de \`hover\` sutil y usan \`next/image\` con un proxy (\`/api/image-proxy\`) para optimizar y cachear las imágenes de Firebase Storage."
        ]
      },
      {
        name: t('docs.products_page_title'),
        id: 'page-products',
        path: '/products',
        description: t('docs.products_page_desc'),
        details: [
            "**Técnico:** El componente \`ProductFilters\` gestiona el estado de los filtros (\`useState\`) y la lógica de filtrado y ordenación (\`useMemo\`). La URL se actualiza con los parámetros de filtro (\`useRouter\`, \`useSearchParams\`) para que los enlaces se puedan compartir.",
            `
<pre><code class="language-javascript">
// En src/app/products/filters.tsx
const params = new URLSearchParams(searchParams.toString());
params.delete(key);
values.forEach(value => params.append(key, value));
router.replace(\`\${pathname}?\${params.toString()}\`);
</code></pre>
            `,
            "**Estético:** Se usa un \`Accordion\` de ShadCN para organizar los filtros. La parrilla de productos (\`ProductGrid\`) muestra un mensaje claro cuando no hay resultados. El componente \`Suspense\` muestra un esqueleto de carga (\`Skeleton\`) mientras se obtienen los datos."
        ]
      },
      {
        name: t('docs.product_detail_page_title'),
        id: 'page-product-detail',
        path: '/product/rush-original-10ml',
        description: t('docs.product_detail_page_desc'),
        details: [
            "**Técnico:** Carga los datos de un único producto desde Firestore usando \`onSnapshot\`. El estado del cliente (cantidad) se maneja con \`useState\`. La lógica para añadir al carrito (\`ProductInfo\`) se comunica con el \`CartContext\`.",
            "**Estético:** \`ProductGallery\` permite cambiar la imagen principal. \`ProductDetails\` utiliza un componente de \`Tabs\` para separar la descripción de los detalles técnicos. El carrusel de \`RelatedProducts\` está implementado con \`Embla Carousel\`."
        ]
      },
    ]
  },
  {
    title: t('docs.ecommerce_features_title'),
    icon: ShoppingCart,
    features: [
       {
        name: t('docs.pack_builder_title'),
        id: 'feature-pack-builder',
        path: '/create-pack',
        description: t('docs.pack_builder_desc'),
        details: [
            "**Técnico:** La lógica de precios es manejada por un flujo de Genkit (\`calculatePackPriceFlow\`) que calcula el descuento dinámicamente. El estado del pack se gestiona en el cliente (\`useState\`), y un \`useEffect\` con \`setTimeout\` (debounce) llama al flujo de IA para evitar peticiones excesivas.",
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
        name: t('docs.cart_title'),
        id: 'feature-cart',
        path: '#',
        description: t('docs.cart_desc'),
        details: [
          '**Funcionalidad:** Muestra los productos añadidos, permite ajustar cantidades o eliminarlos. Recalcula el subtotal y el descuento por volumen en tiempo real.',
          '**Técnico:** Implementado como un \`Contexto de React\` (\`CartContext\`) que vive en \`src/context/cart-context.tsx\`. Este contexto maneja un estado (\`cartItems\`) que es un array de productos con su cantidad. Las funciones \`addToCart\`, \`updateQuantity\` y \`removeFromCart\` manipulan este estado. El contexto no es persistente; se reinicia si el usuario recarga la página.',
          '**Lógica de Precios:** En el carrito se muestra de forma estimada el descuento por volumen (si aplica por pago anticipado) y los costes de envío. Esta estimación incentiva al usuario a completar la compra. La lógica de precios final y definitiva, que diferencia entre pago anticipado y contra-reembolso, se aplica en la página de checkout para proporcionar un feedback interactivo y claro al usuario.',
          '**Estético:** Utiliza un componente \`Sheet\` de ShadCN para deslizarse desde la derecha. Muestra el ahorro potencial del pago por adelantado y si el pedido califica para envío gratuito, incentivando al usuario a continuar con la compra.'
        ]
      },
       {
        name: t('docs.checkout_title'),
        id: 'feature-checkout',
        path: '/checkout',
        description: t('docs.checkout_desc'),
        details: [
          '**Fase 1: Confirmar Carrito.** El usuario revisa los productos, puede ajustar cantidades usando el \`QuantitySelector\` o eliminar artículos. La lógica del \`CartContext\` (\`updateQuantity\`, \`removeFromCart\`) actualiza el estado. El subtotal y el posible descuento por volumen se muestran para dar una primera estimación.',
          '**Fase 2: Tus Datos.** Se solicita la información de envío. Si el usuario está autenticado (\`useAuth\`), puede seleccionar una de sus direcciones guardadas (obtenidas del \`userDoc\`) o rellenar el formulario. Un \`RadioGroup\` permite cambiar entre direcciones. La validación se hace con \`react-hook-form\` y \`zod\`. Una \`Server Action\` (\`updateUser\`) se encarga de guardar una nueva dirección si el usuario lo solicita.',
          '**Fase 3: Método de Pago.** El usuario elige entre dos categorías: "Contrareembolso" y "Pago por adelantado". **Aquí reside la lógica de precios clave:** un \`useMemo\` (\`finalTotals\`) recalcula el total del pedido en tiempo real basándose en el método seleccionado. Si es "Pago por adelantado", se aplica el \`volumeDiscount\` del \`CartContext\` y el envío es gratuito. Si es "Contrareembolso", el descuento se elimina y se suma el \`SHIPPING_COST\`. Esta interacción proporciona un feedback instantáneo sobre los beneficios de cada opción.',
          '**Fase 4: Revisión y Confirmación Final.** Se presenta un resumen completo y final. Al hacer clic en "Confirmar Pedido", se ejecuta la lógica final: si el método es "crypto", se llama a la \`Server Action\` \`createNowPaymentsInvoice\` que devuelve una URL de pago a la que se redirige al usuario. Para los demás métodos, se crea un nuevo documento en la colección \`orders\` de Firestore con todos los detalles del pedido usando \`addDoc\`.',
        ],
      },
    ]
  },
  {
    title: t('docs.subscription_title'),
    icon: PackagePlus,
    features: [
      {
        name: t('docs.subscription_start_title'),
        id: 'subscription-start',
        path: '/subscription',
        description: t('docs.subscription_start_desc'),
        details: [
          "**1. Página de Aterrizaje (`/subscription`):**<br/>- **Archivo:** `src/app/subscription/page.tsx`<br/>- **Función:** Muestra los beneficios del club y el precio. El botón principal 'Unirme al Club' es el punto de entrada al flujo de pago.<br/>- **Lógica Clave:** Al hacer clic en el botón, se llama a la función `handleSubscribe`. Esta función primero verifica si el usuario está autenticado. Si lo está, invoca a la `Server Action` `createNowPaymentsInvoice`.",
          "**2. Server Action (`createNowPaymentsInvoice`):**<br/>- **Archivo:** `src/app/actions/nowpayments.ts`<br/>- **Función:** Es el intermediario seguro entre nuestra aplicación y la API de NOWPayments. Recibe los detalles del pago (precio, moneda, etc.) desde la página de suscripción.<br/>- **Seguridad:** Utiliza la `NOWPAYMENTS_API_KEY` guardada en las variables de entorno del servidor, por lo que la clave nunca se expone en el navegador.<br/>- **Acción:** Realiza una petición `POST` a la API de NOWPayments (`https://api.nowpayments.io/v1/invoice`) para crear una factura de pago único.<br/><pre><code class='language-javascript'>// En src/app/subscription/page.tsx<br/>const result = await createNowPaymentsInvoice({<br/>  price_amount: 44, // Precio de la suscripción<br/>  price_currency: 'eur',<br/>  order_id: `sub_${user.uid}_${Date.now()}`, // ID único para la transacción<br/>  order_description: 'Suscripción Club Dosis Mensual'<br/>});</code></pre>",
          "**3. Redirección al Pago:**<br/>- La `Server Action` devuelve un objeto con una URL de pago (`invoice_url`).<br/>- El código en la página de suscripción recibe esta URL y redirige automáticamente al usuario a la pasarela de pago de NOWPayments.<br/><pre><code class='language-javascript'>// En src/app/subscription/page.tsx<br/>if (result.success && result.invoice_url) {<br/>  window.location.href = result.invoice_url;<br/>}</code></pre>",
          "**4. Páginas de Retorno (`/account/subscription/...`):**<br/>- **Archivos:** `success/page.tsx`, `failed/page.tsx`, `partial/page.tsx`<br/>- **Función:** NOWPayments redirige al usuario a una de estas páginas según el resultado del pago (`success_url`, `cancel_url` que se configuran en la petición a la API, aunque actualmente se usa un `success_url` genérico). Estas páginas simplemente muestran un mensaje informativo al usuario. La lógica de negocio real (como activar la suscripción en la base de datos) se manejaría a través de webhooks.",
        ]
      },
      {
        name: t('docs.subscription_management_title'),
        id: 'subscription-management',
        path: '/account/subscription',
        description: t('docs.subscription_management_desc'),
        details: [
          "**1. Panel de Suscriptor (`/account/subscription`):**<br/>- **Archivo:** `src/app/account/subscription/page.tsx`<br/>- **Función:** Esta página es accesible solo para usuarios con una suscripción activa (`isSubscribed` en `AuthContext`). Les permite seleccionar los productos para su caja mensual (lógica simulada en `src/lib/subscription.ts`).<br/>- **Lógica de Cancelación:** Contiene el botón 'Gestionar mi Suscripción', que abre un diálogo para confirmar la cancelación.",
          "**2. Server Action de Cancelación (`cancelNowPaymentsSubscription`):**<br/>- **Archivo:** `src/app/actions/manage-subscription.ts`<br/>- **Función:** Contiene la lógica segura para cancelar una suscripción en NOWPayments.<br/>- **Autenticación con NOWPayments:** A diferencia de la creación de facturas, la cancelación requiere un **token JWT**. La `Server Action` primero obtiene este token enviando el email y la contraseña de la cuenta de NOWPayments (guardados en variables de entorno) al endpoint de autenticación de NOWPayments.<br/><pre><code class='language-javascript'>// En src/app/actions/manage-subscription.ts<br/>async function getNowPaymentsJwt(): Promise<string> {<br/>  const response = await fetch(`${NOWPAYMENTS_API_URL}/auth`, { ... });<br/>  // ...<br/>  return data.token;<br/>}</code></pre>",
          "**3. Ejecución de la Cancelación:**<br/>- Una vez obtenido el JWT, la `Server Action` realiza una petición `DELETE` al endpoint de suscripciones de NOWPayments, incluyendo el ID de la suscripción del usuario (que se obtiene de su documento en Firestore) y el token JWT para la autorización.<br/>- Si la cancelación es exitosa, la `Server Action` actualiza el estado del usuario en Firestore (`isSubscribed: false`) y devuelve un mensaje de éxito.",
        ]
      },
      {
        name: t('docs.subscription_webhook_title'),
        id: 'subscription-webhook',
        path: '/api/nowpayments/subscription-webhook',
        description: t('docs.subscription_webhook_desc'),
        details: [
          "**Archivo:** `src/app/api/nowpayments/subscription-webhook/route.ts`",
          "**Función:** Este es un endpoint de API que **recibe** peticiones `POST` desde los servidores de NOWPayments. Es fundamental para la gestión a largo plazo de las suscripciones (pagos recurrentes, fallos, etc.).",
          "**Seguridad:** En un entorno de producción, este endpoint **debe verificar la firma** (`x-nowpayments-sig`) que envía NOWPayments en las cabeceras para asegurarse de que la petición es legítima. Actualmente, esta verificación es un placeholder.",
          "**Lógica Actual:** El webhook simplemente registra en la consola el cuerpo de la notificación que recibe. No ejecuta ninguna lógica de negocio, pero es el punto de partida para construir la automatización de pagos recurrentes en el futuro.",
        ]
      },
    ]
  },
  {
    title: t('docs.auth_title'),
    icon: User,
    features: [
      {
        name: t('docs.login_title'),
        id: 'auth-login',
        path: '/login',
        description: t('docs.login_desc'),
        details: [
            "**Técnico:** Utiliza \`signInWithEmailAndPassword\` de Firebase. Una vez autenticado, se obtiene el \`idToken\` del usuario y se envía a la API Route \`/api/login\`, que crea una **session cookie** segura (\`httpOnly\`). Esta cookie es crucial para autenticar al usuario en las \`Server Actions\` y en el lado del servidor.",
            "**Diferenciación de Roles y Redirección:** La lógica de redirección post-login es clave. El sistema comprueba el email del usuario: si es \`maryandpopper@gmail.com\`, lo identifica como administrador y lo redirige a \`/admin\`. Los usuarios normales son dirigidos a \`/account\` o a la página que intentaban visitar. Esta diferenciación de rol (\`isAdmin\` en \`AuthContext\`) permite a la interfaz adaptarse, mostrando u ocultando elementos como el enlace al 'Panel de Admin' en los menús.",
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
            "**Estético:** El formulario de login es simple y se presenta en una \`Card\`. La interfaz de la cuenta (\`AccountSidebar\`, \`FloatingAccountButton\`) es dinámica, mostrando opciones de administrador solo a los usuarios con ese rol, creando una experiencia coherente y segura.",
        ]
      },
      { name: t('docs.register_title'), id: 'auth-register', path: '/register', description: t('docs.register_desc'), details: ["**Técnico:** Usa \`createUserWithEmailAndPassword\`. Al registrarse, crea un nuevo documento para el usuario en la colección \`users\` de Firestore con valores iniciales.", "**Estético:** Similar al login, un formulario claro con validación de contraseña para asegurar que coincidan."] },
      { name: t('docs.account_dashboard_title'), id: 'auth-account-dashboard', path: '/account', description: t('docs.account_dashboard_desc'), details: ["**Técnico:** Protegido por el \`AccountLayout\`, que redirige a los usuarios no autenticados. Muestra datos del \`AuthContext\`, como \`loyaltyPoints\` e \`isSubscribed\`.", "**Estético:** Usa \`Cards\` para segmentar la información: perfil, puntos y gestión de la suscripción/admin."] },
      { name: t('docs.orders_title'), id: 'auth-orders', path: '/account/orders', description: t('docs.orders_desc'), details: ["**Técnico:** Realiza una consulta a Firestore (\`collection(db, 'users', user.uid, 'orders')\`) para obtener y mostrar los pedidos del usuario en tiempo real con \`onSnapshot\`.", "**Estético:** Muestra los pedidos en una \`Table\` con \`Badges\` de colores para indicar el estado de cada pedido."] },
      { name: t('docs.addresses_title'), id: 'auth-addresses', path: '/account/addresses', description: t('docs.addresses_desc'), details: ["**Técnico:** Permite al usuario realizar operaciones CRUD en sus direcciones. Las actualizaciones se envían a la \`Server Action\` \`updateUser\`.", "**Estético:** Utiliza un \`Dialog\` con \`react-hook-form\` para añadir/editar direcciones y un \`AlertDialog\` para confirmar la eliminación."] },
    ]
  },
  {
    title: t('docs.admin_panel_title'),
    icon: KeyRound,
    features: [
        { name: t('docs.admin_dashboard_title'), id: 'admin-dashboard', path: '/admin', description: t('docs.admin_dashboard_desc'), details: ["**Técnico:** Protegido por \`AdminLayout\`, que comprueba el email del usuario. Obtiene todos los pedidos y usuarios con \`collectionGroup\` y \`onSnapshot\` para calcular métricas. \`OverviewChart\` usa \`recharts\` para visualizar los datos.", "**Estético:** Interfaz densa en información con \`Cards\` de estadísticas, un gráfico de líneas y listas de pedidos/clientes recientes."] },
        { name: t('docs.admin_orders_title'), id: 'admin-orders', path: '/admin/orders', description: t('docs.admin_orders_desc'), details: ["**Técnico:** Usa \`Tabs\` para filtrar pedidos por estado. Los datos se obtienen una vez (\`getDocs\`) y se filtran en el cliente para mejorar el rendimiento. Cada fila enlaza a la página de detalle del pedido pasando la ruta del documento como parámetro URL.", "**Estético:** Diseño de \`Tabs\` claro y funcional. La tabla incluye acciones rápidas para ver o gestionar el envío."] },
        {
          name: t('docs.admin_products_crud_title'),
          id: 'admin-products-crud-detail',
          path: '/admin/products',
          description: t('docs.admin_products_crud_desc'),
          details: [
              'La creación y edición de productos, aunque son dos acciones distintas, están diseñadas de forma muy eficiente para compartir la máxima cantidad de código posible. Así es como funciona el flujo completo, desde que haces clic hasta que los datos se guardan en la base de datos:',
              '**1. Puntos de Entrada Separados:**<br/>- **Crear Producto:** Al hacer clic en "Nuevo Producto" en \`/admin/products\`, eres dirigido a la página \`/admin/products/new\`.<br/>- **Editar Producto:** Al hacer clic en "Editar" en un producto existente, eres dirigido a una página dinámica como \`/admin/products/edit/[id-del-producto]\`.',
              '**2. El Componente Central: \`ProductForm\`**<br/>- Ambas páginas (\`new\` y \`edit\`) renderizan el mismo componente: \`src/app/admin/products/_components/product-form.tsx\`. Este es el corazón de la funcionalidad.<br/>- **En modo "Crear"**: El formulario se renderiza vacío, listo para que introduzcas los datos de un nuevo producto.<br/>- **En modo "Editar"**: La página de edición primero obtiene los datos del producto correspondiente desde Firestore y se los pasa al \`ProductForm\`, que se rellena con la información existente.',
              '**3. Validación en el Navegador (Client-Side)**<br/>- **Tecnología**: El formulario utiliza la librería **\`react-hook-form\`** para gestionar el estado de todos los campos y **\`zod\`** para definir un esquema de validación estricto.<br/>- **Funcionamiento**: Mientras escribes, \`react-hook-form\` controla los datos. Al intentar guardar, \`zod\` comprueba que todos los campos cumplan las reglas (ej. que el nombre no esté vacío, que el precio sea un número, que la URL sea válida, etc.). Si algo falla, muestra un mensaje de error junto al campo correspondiente sin necesidad de comunicarse con el servidor.',
              '**4. Comunicación con la Base de Datos (Client-Side)**<br/>- Cuando haces clic en el botón **"Guardar Producto"**, se activa la función \`handleSave\` dentro de la página correspondiente (\`new/page.tsx\` o \`edit/[id]/page.tsx\`).<br/>- Aquí ocurre la magia. En lugar de enviar los datos a un endpoint de API o una Server Action, la aplicación utiliza el **SDK de cliente de Firebase** para hablar directamente con la base de datos de Firestore.',
              '**- Si estás Creando un Producto Nuevo:**<br/>- Se llama a la función \`setDoc()\` de Firebase.<br/><pre><code class="language-javascript">// Código clave en new/page.tsx:<br/>import { doc, setDoc } from \\\'firebase/firestore\\\';<br/><br/>const productRef = doc(db, \\\'products\\\', data.id); // Crea una referencia a un nuevo documento.<br/>await setDoc(productRef, productData); // Escribe los datos en ese documento.</code></pre>',
              '**- Si estás Editando un Producto Existente:**<br/>- Se llama a la función \`updateDoc()\` de Firebase.<br/><pre><code class="language-javascript">// Código clave en edit/[id]/page.tsx:<br/>import { doc, updateDoc } from \\\'firebase/firestore\\\';<br/><br/>const productRef = doc(db, \\\'products\\\', product.id); // Apunta al documento existente.<br/>await updateDoc(productRef, productData); // Actualiza los campos de ese documento.</code></pre>',
              '**5. ¿Cómo es esto seguro? El Rol de \`firestore.rules\`**<br/>- Esta comunicación directa desde el navegador solo es posible porque nuestras **reglas de seguridad de Firestore** actúan como un vigilante en la nube.<br/>- La regla que hemos definido para la colección de productos es:<br/><pre><code class="language-javascript">match /products/{productId} {<br/>  allow write: if isAdmin();<br/>}</code></pre><br/>- **Traducción**: "Solo permite una operación de escritura (crear, editar, borrar) en la colección \`products\` si el usuario que la solicita está autenticado y su email es \`maryandpopper@gmail.com\`".<br/>- Si cualquier otra persona intentara ejecutar ese mismo código desde la consola de su navegador, Firestore rechazaría la petición con un error \`permission-denied\`.',
              'Este enfoque es moderno, rápido y seguro, combinando la agilidad del desarrollo en el cliente con la robusta seguridad de las reglas de Firebase en el servidor.'
          ]
        },
        {
          name: t('docs.admin_products_fields_title'),
          id: 'admin-products-fields',
          path: '/admin/products/new',
          description: t('docs.admin_products_fields_desc'),
          details: [
            '**- Descripción Larga:** Un editor de texto enriquecido (Rich Text Editor) basado en **Tiptap**. Permite dar formato al texto (negrita, cursiva, encabezados, listas) y cambiar colores. El contenido se guarda como una **cadena de texto HTML** en la base de datos, lo que permite renderizarlo con su formato en la página de detalle del producto.',
            '**- Inventario y Precios:** Este grupo de campos gestiona la parte comercial y logística del producto.',
            '  - **SKU (Stock Keeping Unit):** Un código de referencia único para el producto. **Generación Automática:** Al crear un nuevo producto, el sistema genera automáticamente un SKU aleatorio para agilizar el proceso, aunque el sistema debería validar que no haya duplicados. **Edición Manual:** Este campo es totalmente editable, permitiéndote asignar códigos personalizados si lo necesitas.',
            '  - **Precio Estándar y Precio de Oferta:** La lógica de precios es dual. El campo principal es \`price\` (precio en céntimos). Cuando se introduce un valor en el campo \`Precio de Oferta\`, el valor del \`Precio Estándar\` se mueve al campo \`originalPrice\`, y el campo \`price\` se actualiza con el nuevo valor de oferta. Si se borra el precio de oferta, el sistema revierte \`originalPrice\` al campo \`price\`. <pre><code class="language-javascript">// Lógica en product-form.tsx\\nif (salePrice > 0 && !currentOriginalPrice) {\\n  form.setValue(\\\'originalPrice\\\', currentPrice);\\n}\\nform.setValue(\\\'price\\\', salePrice);</code></pre>',
            '  - **Stock Disponible:** Controla la cantidad de unidades disponibles. Si es \`0\`, el producto se muestra como "Agotado" y no se puede añadir al carrito. El \`QuantitySelector\` también usa este valor como límite máximo.',
            '**- Etiquetas:** \`Etiquetas Visibles\` (se muestran como badges en la tarjeta del producto, ej: "Nuevo"), \`Categorías Internas\` (para control lógico, ej: "novedad", "mas-vendido", "pack").'
          ]
        },
        { name: t('docs.admin_web_customization_title'), id: 'admin-web', path: '/admin/web', description: t('docs.admin_web_customization_desc'), details: ["**Técnico:** Lee y escribe en un archivo JSON en el servidor (\`src/lib/site-settings.json\`) usando \`Server Actions\`. Este archivo actúa como una bandera de características simple.", "**Estético:** Interfaz simple con \`Switch\` para activar o desactivar la funcionalidad de suscripción en toda la web."] },
    ]
  },
  {
    title: t('docs.info_pages_title'),
    icon: FileText,
    features: [
      { name: t('docs.info_blog_title'), id: 'info-blog', path: '/blog', description: t('docs.info_blog_desc'), details: ["**Técnico:** Contenido estático hardcodeado en \`src/lib/posts.ts\`. Es una página renderizada en el servidor (Server Component) para un SEO óptimo.", "**Estético:** Diseño clásico de blog con tarjetas de previsualización que incluyen imagen, título, extracto y fecha."] },
      { name: t('docs.info_contact_title'), id: 'info-contact', path: '/contacto', description: t('docs.info_contact_desc'), details: ["**Técnico:** Un formulario controlado por el cliente que simula el envío de un email. No realiza una acción real de servidor.", "**Estético:** Diseño a dos columnas que presenta la información de contacto junto al formulario."] },
      { name: t('docs.info_shipping_title'), id: 'info-shipping', path: '/envio-tarifas', description: t('docs.info_shipping_desc'), details: ["**Técnico:** Página de contenido estático.", "**Estético:** Utiliza \`Tables\` para presentar las tarifas de forma clara y \`Alerts\` para destacar información importante."] },
      { name: t('docs.info_terms_title'), id: 'info-terms', path: '/terminos-y-condiciones', description: t('docs.info_terms_desc'), details: ["**Técnico:** Página de contenido estático.", "**Estético:** Texto largo formateado dentro de una \`Card\` con estilos \`prose\` para mejorar la legibilidad."] },
    ]
  },
];


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
  
  const getLogoSvgString = () => {
    // Correctly escape ampersands for XML/SVG
    return `
      <svg viewBox="0 -15 1100 170" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@900&amp;display=swap');
                .logo-text {
                    font-family: 'Inter', sans-serif;
                    font-size: 120px;
                    font-weight: 900;
                    text-anchor: middle;
                    dominant-baseline: central;
                    letter-spacing: -0.01em;
                }
            </style>
        </defs>
        <g transform="skewX(-15) translate(40, 0)">
            <text x="500" y="85" class="logo-text" fill="none" stroke="white" stroke-width="20" stroke-linejoin="round">POPPER ONLINE</text>
            <text x="502" y="87" class="logo-text" fill="#FFC107">POPPER ONLINE</text>
            <text x="500" y="85" class="logo-text" fill="none" stroke="#FFC107" stroke-width="3" stroke-linejoin="miter">POPPER ONLINE</text>
            <text x="500" y="85" class="logo-text" fill="#F44336">POPPER ONLINE</text>
        </g>
      </svg>
    `;
  }

  const handleDownloadLogo = () => {
    const svgString = getLogoSvgString();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'popper-online-logo.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadPng = () => {
    const svgString = getLogoSvgString();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
        // Set canvas dimensions based on SVG viewbox for high quality
        canvas.width = 1100;
        canvas.height = 170;

        // Draw the image onto the canvas
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        // Trigger PNG download
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = 'popper-online-logo.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    img.onerror = (e) => {
        console.error("Error loading SVG into image for PNG conversion:", e);
        URL.revokeObjectURL(url);
    };

    img.src = url;
  };


  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">{t('docs.title')}</h1>
        <div className="prose prose-lg dark:prose-invert max-w-3xl mx-auto text-foreground/80">
            <p dangerouslySetInnerHTML={{ __html: t('docs.subtitle1') }} />
            <p dangerouslySetInnerHTML={{ __html: t('docs.subtitle2') }} />
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
                                {t('docs.try_it_button')}
                                <ExternalLink className="ml-2 h-4 w-4"/>
                            </Link>
                        </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 ml-8 sm:ml-0">{feature.description}</p>
                  
                  <Accordion type="single" collapsible className="w-full mt-2">
                    <AccordionItem value="item-1" className="border-b-0">
                      <AccordionTrigger className="text-sm py-2 hover:no-underline text-muted-foreground">{t('docs.implementation_details_button')}</AccordionTrigger>
                      <AccordionContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 space-y-2 pl-4 border-l-2 ml-2 border-primary/50">
                           {feature.details.map((detail, i) => {
                                if (detail.startsWith('<div')) {
                                    return <div key={i} dangerouslySetInnerHTML={{ __html: detail }} />;
                                }
                                return <div key={i} dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                           })}
                           {feature.id === 'brand-logo' && (
                                <div className="flex items-center gap-2">
                                    <Button onClick={handleDownloadLogo}>
                                        <Download className="mr-2 h-4 w-4" />
                                        {t('docs.download_svg_button')}
                                    </Button>
                                    <Button onClick={handleDownloadPng} variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        {t('docs.download_png_button')}
                                    </Button>
                                </div>
                           )}
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

    