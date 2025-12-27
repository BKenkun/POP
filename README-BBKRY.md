
# Arquitectura y Guía de Implementación del E-commerce

## Introducción

Este documento es un manual de identidad y arquitectura del sitio, concebido para ser la fuente de verdad para programadores, diseñadores y gestores de contenido. Su objetivo es garantizar la consistencia, facilitar la mantenimiento y orientar la implementación de nuevas funcionalidades.

Para los **diseñadores**, define el sistema de design visual: la paleta de colores, la tipografia y los componentes de la interfaz. Para los **programadores**, actúa como un mapa da arquitectura técnica, detallando el stack tecnológico (Next.js, Firebase, Genkit), los principales patrones de código y ejemplos de implementación para las funcionalidades más importantes.

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
*A fonte principal do site é a Inter, configurada em `src/app/layout.tsx`.*

**Técnico:** Se usa `next/font` para optimizar la carga de la fuente. Las clases `font-headline` y `font-body` se asignan a la misma variable de CSS (`--font-inter`) en `tailwind.config.ts`, manteniendo la consistencia.

```javascript
// En src/app/layout.tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
```

### Iconografia e Gráficos
*A biblioteca `lucide-react` é usada para ícones e um SVG personalizado é usado para o logótipo.*

**Técnico:** Los iconos se importan directamente desde `lucide-react`. El logo (`src/components/logo.tsx`) es un componente SVG multicapa que permite el theming (cambia de color en modo oscuro/claro) al usar variables de CSS para sus colores.

```jsx
import { Home, ShoppingCart } from 'lucide-react';
// ...
<Button>
  <ShoppingCart className="mr-2" /> Añadir
</Button>
```

---

## Ativos de Marca e Recursos Visuais

### Logótipo Principal
*O logótipo oficial "Popper Online" em formato SVG e PNG, otimizado para web e design gráfico.*

**Previsualización:** El logo utiliza un diseño multicapa para crear un efecto de "sticker" con extrusión. Está diseñado para adaptarse a los modos claro y oscuro del sitio.

<div class="my-4 p-4 border rounded-lg flex justify-center items-center bg-muted"><Logo class="h-16" /></div>

**Descarga SVG (Vectorial):** El botón "Descargar Logo (SVG)" genera un archivo `.svg` directamente en tu navegador. La función `handleDownloadLogo` crea una cadena de texto con el código SVG, incluyendo los estilos CSS y la URL de la fuente de Google (con el carácter '&' correctamente escapado como '&amp;'). Luego, crea un "Blob" (un objeto de archivo en memoria) de tipo `image/svg+xml` y genera una URL temporal para iniciar la descarga. Este método es ideal para obtener el archivo vectorial original para usar en software de diseño.

**Descarga PNG (Imagen):** El botón "Descargar Logo (PNG)" utiliza una técnica de renderizado en el navegador para convertir el SVG en una imagen PNG. La función `handleDownloadPng` sigue estos pasos:
 1. **Crea un Canvas:** Genera un elemento `<canvas>` de HTML en memoria. Este elemento actúa como un lienzo digital invisible.
 2. **Carga el SVG en una Imagen:** El código SVG del logo se convierte en un Blob y se carga en un objeto `Image()`.
 3. **Dibuja en el Canvas:** Una vez que la imagen SVG se ha cargado, se "dibuja" sobre el canvas con unas dimensiones de alta resolución (1100x170px) para asegurar la calidad.
 4. **Exporta a PNG:** Se llama al método `canvas.toDataURL('image/png')`, que convierte el contenido del canvas en una cadena de texto Base64 que representa el archivo PNG.
 5. **Inicia la Descarga:** Finalmente, se crea un enlace temporal con esta URL de datos y se simula un clic en él para que el navegador inicie la descarga del archivo `popper-online-logo.png`.

---

## Arquitectura de Dados e Comunicação

### Comunicação Cliente-Servidor para Produtos (Leitura/Escrita)
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

## Lógica de Negócio e Marketing

### Verificação de Idade (Popup Modal)
*Um popup modal que bloqueia o acesso ao site até o utilizador verificar que tem mais de 18 anos.*

**Funcionalidad:** Un popup modal que bloquea el acceso al sitio hasta que el usuario confirma ser mayor de 18 años, utilizando su fecha de nacimiento.

**Técnico:** El componente `AgeVerificationPopup` (`src/components/age-verification-popup.tsx`) se renderiza en el `AppLayout`. Usa `localStorage` para recordar si un usuario ya ha sido verificado, evitando que el popup aparezca en cada visita. Si no hay confirmación previa, el popup aparece 500ms después de cargar la página para no ser demasiado abrupto. La validación de la fecha se realiza en tiempo real con `useMemo`. Si el usuario es menor de edad, se le muestra un error y el botón de "Entrar" permanece deshabilitado. Si hace clic en "Salir", es redirigido a google.com.

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

**Estético:** Es un `Dialog` modal no descartable (el usuario no puede cerrarlo haciendo clic fuera o pulsando Escape). Presenta el logo y campos de entrada claros para la fecha de nacimiento.

### Notificações de Vendas Híbridas (Reais e Simuladas)
*Popups que mostram compras para gerar confiança. Prioriza compras reais e preenche as lacunas com notificações simuladas.*

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

**Estético:** Las notificaciones aparecen en la esquina inferior izquierda. Usan el estilo por defecto de `Toast` con un icono de `ShoppingCart` para dar contexto visual.

### Popup de Boas-Vindas com Desconto
*Um popup que oferece 10% de desconto em troca da subscrição da newsletter. Aparece apenas a novos visitantes ou após 24h.*

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

**Estético:** Es un `Dialog` modal que se muestra 2 segundos después de cargar la página. Usa un icono de `Percent` para captar la atención.

### Política de Descontos por Volume
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

**Estético:** En el carrito (`CartSheet`) y en el checkout, el descuento se muestra claramente en rojo, tachando el subtotal original. En el checkout, la interfaz reacciona al método de pago seleccionado para mostrar u ocultar el descuento y el coste de envío.

### Sistema de Pontos de Fidelidade
*Os utilizadores ganham pontos com cada compra, que podem ser trocados por descontos futuros.*

**Técnico:** Al confirmar un pedido en `checkout-client-page.tsx`, se llama a la `Server Action` `updateUser` con la acción `update-points`. La acción calcula los puntos a añadir (1 punto por cada 10€ de compra) y utiliza `increment` de Firestore para una actualización atómica y segura.

```javascript
// En src/app/checkout/checkout-client-page.tsx
const pointsToAdd = Math.floor(finalTotals.total / 1000);
if (pointsToAdd > 0) {
  await updateUser('update-points', { pointsToAdd });
}
```

**Estético:** El saldo de puntos se muestra de forma prominente en el panel de cuenta del usuario (`/account`) dentro de una `Card` dedicada, junto con su equivalencia en euros.

---

## Páginas Principais

### Página Inicial
*A página de boas-vindas com produtos em destaque e acesso às secções principais.*

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

**Estético:** El diseño se basa en un `grid` responsivo. Las `ProductCard` muestran un efecto de `hover` sutil y usan `next/image` con un proxy (`/api/image-proxy`) para optimizar y cachear las imágenes de Firebase Storage.

### Catálogo de Produtos
*Mostra todos os produtos com filtros por marca, tamanho, composição e pesquisa.*

**Técnico:** El componente `ProductFilters` gestiona el estado de los filtros (`useState`) y la lógica de filtrado y ordenación (`useMemo`). La URL se actualiza con los parámetros de filtro (`useRouter`, `useSearchParams`) para que los enlaces se puedan compartir.

```javascript
// En src/app/products/filters.tsx
const params = new URLSearchParams(searchParams.toString());
params.delete(key);
values.forEach(value => params.append(key, value));
router.replace(`${pathname}?${params.toString()}`);
```

**Estético:** Se usa un `Accordion` de ShadCN para organizar los filtros. La parrilla de productos (`ProductGrid`) muestra un mensaje claro cuando no hay resultados. El componente `Suspense` muestra un esqueleto de carga (`Skeleton`) mientras se obtienen los datos.

### Detalhe do Produto
*Vista detalhada de um produto com uma galeria, informações e produtos relacionados (exemplo com "Rush Original").*

**Técnico:** Carga los datos de un único producto desde Firestore usando `onSnapshot`. El estado del cliente (cantidad) se maneja con `useState`. La lógica para añadir al carrito (`ProductInfo`) se comunica con el `CartContext`.

**Estético:** `ProductGallery` permite cambiar la imagen principal. `ProductDetails` utiliza un componente de `Tabs` para separar la descripción de los detalles técnicos. El carrusel de `RelatedProducts` está implementado con `Embla Carousel`.

---

## Funcionalidades de E-commerce

### Construtor de Packs
*Uma ferramenta para os clientes criarem o seu próprio pack de produtos com descontos de volume.*

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

**Estético:** La interfaz está dividida en tres columnas: filtros, selección de productos y resumen del pack. El resumen se actualiza en tiempo real mostrando el ahorro y el precio final.

### Carrinho de Compras
*O carrinho é um painel lateral. Clique no ícone flutuante do carrinho para o abrir após adicionar um produto.*

**Funcionalidad:** Muestra los productos añadidos, permite ajustar cantidades o eliminarlos. Recalcula el subtotal y el descuento por volumen en tiempo real.

**Técnico:** Implementado como un `Contexto de React` (`CartContext`) que vive en `src/context/cart-context.tsx`. Este contexto maneja un estado (`cartItems`) que es un array de productos con su cantidad. Las funciones `addToCart`, `updateQuantity` y `removeFromCart` manipulan este estado. El contexto no es persistente; se reinicia si el usuario recarga la página.

**Lógica de Precios:** En el carrito se muestra de forma estimada el descuento por volumen (si aplica por pago anticipado) y los costes de envío. Esta estimación incentiva al usuario a completar la compra. La lógica de precios final y definitiva, que diferencia entre pago anticipado y contra-reembolso, se aplica en la página de checkout para proporcionar un feedback interactivo y claro al usuario.

**Estético:** Utiliza un componente `Sheet` de ShadCN para deslizarse desde la derecha. Muestra el ahorro potencial del pago por adelantado y si el pedido califica para envío gratuito, incentivando al usuario a continuar con la compra.

### Processo de Checkout
*Um fluxo de checkout de 4 passos. Requer itens no carrinho para funcionar.*

**Fase 1: Confirmar Carrito.** El usuario revisa los productos, puede ajustar cantidades usando el `QuantitySelector` o eliminar artículos. La lógica del `CartContext` (`updateQuantity`, `removeFromCart`) actualiza el estado. El subtotal y el posible descuento por volumen se muestran para dar una primera estimación.

**Fase 2: Tus Datos.** Se solicita la información de envío. Si el usuario está autenticado (`useAuth`), puede seleccionar una de sus direcciones guardadas (obtenidas del `userDoc`) o rellenar el formulario. Un `RadioGroup` permite cambiar entre direcciones. La validación se hace con `react-hook-form` y `zod`. Una `Server Action` (`updateUser`) se encarga de guardar una nueva dirección si el usuario lo solicita.

**Fase 3: Método de Pago.** El usuario elige entre dos categorías: "Contrareembolso" y "Pago por adelantado". **Aquí reside la lógica de precios clave:** un `useMemo` (`finalTotals`) recalcula el total del pedido en tiempo real basándose en el método seleccionado. Si es "Pago por adelantado", se aplica el `volumeDiscount` del `CartContext` y el envío es gratuito. Si es "Contrareembolso", el descuento se elimina y se suma el `SHIPPING_COST`. Esta interacción proporciona un feedback instantáneo sobre los beneficios de cada opción.

**Fase 4: Revisión y Confirmación Final.** Se presenta un resumen completo y final. Al hacer clic en "Confirmar Pedido", se ejecuta la lógica final: si el método es "crypto", se llama a la `Server Action` `createNowPaymentsInvoice` que devuelve una URL de pago a la que se redirige al usuario. Para los demás métodos, se crea un nuevo documento en la colección `orders` de Firestore con todos los detalles del pedido usando `addDoc`.

---

## Subscrição "Dose Mensal" (com NOWPayments)

### Fluxo de Início de Subscrição
*Página de destino e processo de pagamento inicial para aderir ao clube de subscrição.*

**1. Página de Aterrizaje (`/subscription`):**
- **Archivo:** `src/app/subscription/page.tsx`
- **Función:** Muestra los beneficios del club y el precio. El botón principal 'Unirme al Club' es el punto de entrada al flujo de pago.
- **Lógica Clave:** Al hacer clic en el botón, se llama a la función `handleSubscribe`. Esta función primero verifica si el usuario está autenticado. Si lo está, invoca a la `Server Action` `createNowPaymentsInvoice`.

**2. Server Action (`createNowPaymentsInvoice`):**
- **Archivo:** `src/app/actions/nowpayments.ts`
- **Función:** Es el intermediario seguro entre nuestra aplicación y la API de NOWPayments. Recibe los detalles del pago (precio, moneda, etc.) desde la página de suscripción.
- **Seguridad:** Utiliza la `NOWPAYMENTS_API_KEY` guardada en las variables de entorno del servidor, por lo que la clave nunca se expone en el navegador.
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
- La `Server Action` devuelve un objeto con una URL de pago (`invoice_url`).
- El código en la página de suscripción recibe esta URL y redirige automáticamente al usuario a la pasarela de pago de NOWPayments.

```javascript
// En src/app/subscription/page.tsx
if (result.success && result.invoice_url) {
  window.location.href = result.invoice_url;
}
```

**4. Páginas de Retorno (`/account/subscription/...`):**
- **Archivos:** `success/page.tsx`, `failed/page.tsx`, `partial/page.tsx`
- **Función:** NOWPayments redirige al usuario a una de estas páginas según el resultado del pago (`success_url`, `cancel_url` que se configuran en la petición a la API, aunque actualmente se usa un `success_url` genérico). Estas páginas simplemente muestran un mensaje informativo al usuario. La lógica de negocio real (como activar la suscripción en la base de datos) se manejaría a través de webhooks.

### Gestão e Cancelamento de Subscrição
*Um painel para os subscritores personalizarem a sua caixa e gerirem a sua adesão.*

**1. Panel de Suscriptor (`/account/subscription`):**
- **Archivo:** `src/app/account/subscription/page.tsx`
- **Función:** Esta página es accesible solo para usuarios con una suscripción activa (`isSubscribed` en `AuthContext`). Les permite seleccionar los productos para su caja mensual (lógica simulada en `src/lib/subscription.ts`).
- **Lógica de Cancelación:** Contiene el botón 'Gestionar mi Suscripción', que abre un diálogo para confirmar la cancelación.

**2. Server Action de Cancelación (`cancelNowPaymentsSubscription`):**
- **Archivo:** `src/app/actions/manage-subscription.ts`
- **Función:** Contiene la lógica segura para cancelar una suscripción en NOWPayments.
- **Autenticación con NOWPayments:** A diferencia de la creación de facturas, la cancelación requiere un **token JWT**. La `Server Action` primero obtiene este token enviando el email y la contraseña de la cuenta de NOWPayments (guardados en variables de entorno) al endpoint de autenticación de NOWPayments.

```javascript
// En src/app/actions/manage-subscription.ts
async function getNowPaymentsJwt(): Promise<string> {
  const response = await fetch(`${NOWPAYMENTS_API_URL}/auth`, { ... });
  // ...
  return data.token;
}
```

**3. Ejecución de la Cancelación:**
- Una vez obtenido el JWT, la `Server Action` realiza una petición `DELETE` al endpoint de suscripciones de NOWPayments, incluyendo el ID de la suscripción del usuario (que se obtiene de su documento en Firestore) y el token JWT para la autorización.
- Si la cancelación es exitosa, la `Server Action` actualiza el estado del usuario en Firestore (`isSubscribed: false`) y devuelve un mensaje de éxito.

### Webhook de Notificações (IPN)
*Endpoint que a NOWPayments usa para notificar o servidor sobre eventos de subscrição.*

**Archivo:** `src/app/api/nowpayments/subscription-webhook/route.ts`

**Función:** Este es un endpoint de API que **recibe** peticiones `POST` desde los servidores de NOWPayments. Es fundamental para la gestión a largo plazo de las suscripciones (pagos recurrentes, fallos, etc.).

**Seguridad:** En un entorno de producción, este endpoint **debe verificar la firma** (`x-nowpayments-sig`) que envía NOWPayments en las cabeceras para asegurarse de que la petición es legítima. Actualmente, esta verificación es un placeholder.

**Lógica Actual:** El webhook simplemente registra en la consola el cuerpo de la notificación que recibe. No ejecuta ninguna lógica de negocio, pero es el punto de partida para construir la automatización de pagos recurrentes en el futuro.

---

## Conta de Utilizador e Autenticação

### Iniciar Sessão
*Formulário para utilizadores existentes acederem à sua conta, com lógica de redirecionamento baseada no papel.*

**Técnico:** Utiliza `signInWithEmailAndPassword` de Firebase. Una vez autenticado, se obtiene el `idToken` del usuario y se envía a la API Route `/api/login`, que crea una **session cookie** segura (`httpOnly`). Esta cookie es crucial para autenticar al usuario en las `Server Actions` y en el lado del servidor.

**Diferenciación de Roles y Redirección:** La lógica de redirección post-login es clave. El sistema comprueba el email del usuario: si es `maryandpopper@gmail.com`, lo identifica como administrador y lo redirige a `/admin`. Los usuarios normales son dirigidos a `/account` o a la página que intentaban visitar. Esta diferenciación de rol (`isAdmin` en `AuthContext`) permite a la interfaz adaptarse, mostrando u ocultando elementos como el enlace al 'Panel de Admin' en los menús.

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

**Estético:** El formulario de login es simple y se presenta en una `Card`. La interfaz de la cuenta (`AccountSidebar`, `FloatingAccountButton`) es dinámica, mostrando opciones de administrador solo a los usuarios con ese rol, creando una experiencia coherente y segura.

### Registo de Novo Utilizador
*Formulário para novos utilizadores criarem uma conta.*

**Técnico:** Usa `createUserWithEmailAndPassword`. Al registrarse, crea un nuevo documento para el usuario en la colección `users` de Firestore con valores iniciales.

**Estético:** Similar al login, un formulario claro con validación de contraseña para asegurar que coincidan.

### Painel de Controlo da Conta
*O painel principal do utilizador com um resumo da sua atividade. Requer início de sessão.*

**Técnico:** Protegido por el `AccountLayout`, que redirige a los usuarios no autenticados. Muestra datos del `AuthContext`, como `loyaltyPoints` e `isSubscribed`.

**Estético:** Usa `Cards` para segmentar la información: perfil, puntos y gestión de la suscripción/admin.

### As Minhas Encomendas
*Histórico de todas as encomendas feitas pelo utilizador.*

**Técnico:** Realiza una consulta a Firestore (`collection(db, 'users', user.uid, 'orders')`) para obtener y mostrar los pedidos del usuario en tiempo real con `onSnapshot`.

**Estético:** Muestra los pedidos en una `Table` con `Badges` de colores para indicar el estado de cada pedido.

### As Minhas Moradas
*Gestão de moradas de envio e faturação guardadas.*

**Técnico:** Permite al usuario realizar operaciones CRUD en sus direcciones. Las actualizaciones se envían a la `Server Action` `updateUser`.

**Estético:** Utiliza un `Dialog` con `react-hook-form` para añadir/editar direcciones y un `AlertDialog` para confirmar la eliminación.

---

## Painel de Administração

### Painel de Administração
*Painel principal com estatísticas. Requer início de sessão como administrador (maryandpopper@gmail.com).*

**Técnico:** Protegido por `AdminLayout`, que comprueba el email del usuario. Obtiene todos los pedidos y usuarios con `collectionGroup` y `onSnapshot` para calcular métricas. `OverviewChart` usa `recharts` para visualizar los datos.

**Estético:** Interfaz densa en información con `Cards` de estadísticas, un gráfico de líneas y listas de pedidos/clientes recientes.

### Gestão de Encomendas
*Ver e gerir todas as encomendas da loja.*

**Técnico:** Usa `Tabs` para filtrar pedidos por estado. Los datos se obtienen una vez (`getDocs`) y se filtran en el cliente para mejorar el rendimiento. Cada fila enlaza a la página de detalle del pedido pasando la ruta del documento como parámetro URL.

**Estético:** Diseño de `Tabs` claro y funcional. La tabla incluye acciones rápidas para ver o gestionar el envío.

### Gestão de Produtos: "Adicionar" e "Editar" em detalhe
*Fluxo técnico completo sobre como os produtos são criados e editados a partir do painel de administração.*

La creación y edición de productos, aunque son dos acciones distintas, están diseñadas de forma muy eficiente para compartir la máxima cantidad de código posible. Así es como funciona el flujo completo, desde que haces clic hasta que los datos se guardan en la base de datos:

**1. Puntos de Entrada Separados:**
- **Crear Producto:** Al hacer clic en "Nuevo Producto" en `/admin/products`, eres dirigido a la página `/admin/products/new`.
- **Editar Producto:** Al hacer clic en "Editar" en un producto existente, eres dirigido a una página dinámica como `/admin/products/edit/[id-del-producto]`.

**2. El Componente Central: `ProductForm`**
- Ambas páginas (`new` y `edit`) renderizan el mismo componente: `src/app/admin/products/_components/product-form.tsx`. Este es el corazón de la funcionalidad.
- **En modo "Crear"**: El formulario se renderiza vacío, listo para que introduzcas los datos de un nuevo producto.
- **En modo "Editar"**: La página de edición primero obtiene los datos del producto correspondiente desde Firestore y se los pasa al `ProductForm`, que se rellena con la información existente.

**3. Validación en el Navegador (Client-Side)**
- **Tecnología**: El formulario utiliza la librería **`react-hook-form`** para gestionar el estado de todos los campos y **`zod`** para definir un esquema de validación estricto.
- **Funcionamiento**: Mientras escribes, `react-hook-form` controla los datos. Al intentar guardar, `zod` comprueba que todos los campos cumplan las reglas (ej. que el nombre no esté vacío, que el precio sea un número, que la URL sea válida, etc.). Si algo falla, muestra un mensaje de error junto al campo correspondiente sin necesidad de comunicarse con el servidor.

**4. Comunicación con la Base de Datos (Client-Side)**
- Cuando haces clic en el botón **"Guardar Producto"**, se activa la función `handleSave` dentro de la página correspondiente (`new/page.tsx` o `edit/[id]/page.tsx`).
- Aquí ocurre la magia. En lugar de enviar los datos a un endpoint de API o una Server Action, la aplicación utiliza el **SDK de cliente de Firebase** para hablar directamente con la base de datos de Firestore.

**- Si estás Creando un Producto Nuevo:**
- Se llama a la función `setDoc()` de Firebase.
```javascript
// Código clave en new/page.tsx:
import { doc, setDoc } from 'firebase/firestore';

const productRef = doc(db, 'products', data.id); // Crea una referencia a un nuevo documento.
await setDoc(productRef, productData); // Escribe los datos en ese documento.
```

**- Si estás Editando un Producto Existente:**
- Se llama a la función `updateDoc()` de Firebase.
```javascript
// Código clave en edit/[id]/page.tsx:
import { doc, updateDoc } from 'firebase/firestore';

const productRef = doc(db, 'products', product.id); // Apunta al documento existente.
await updateDoc(productRef, productData); // Actualiza los campos de ese documento.
```

**5. ¿Cómo es esto seguro? El Rol de `firestore.rules`**
- Esta comunicación directa desde el navegador solo es posible porque nuestras **reglas de seguridad de Firestore** actúan como un vigilante en la nube.
- La regla que hemos definido para la colección de productos es:

```javascript
match /products/{productId} {
  allow write: if isAdmin();
}
```

- **Traducción**: "Solo permite una operación de escritura (crear, editar, borrar) en la colección `products` si el usuario que la solicita está autenticado y su email es `maryandpopper@gmail.com`".
- Si cualquier otra persona intentara ejecutar ese mismo código desde la consola de su navegador, Firestore rechazaría la petición con un error `permission-denied`.

Este enfoque es moderno, rápido y seguro, combinando la agilidad del desarrollo en el cliente con la robusta seguridad de las reglas de Firebase en el servidor.

### Guia de Campos de Produto e Lógica de Preços
*Adicionar, editar, arquivar e eliminar produtos do catálogo.*

**- Descripción Larga:** Un editor de texto enriquecido (Rich Text Editor) basado en **Tiptap**. Permite dar formato al texto (negrita, cursiva, encabezados, listas) y cambiar colores. El contenido se guarda como una **cadena de texto HTML** en la base de datos, lo que permite renderizarlo con su formato en la página de detalle del producto.

**- Inventario y Precios:** Este grupo de campos gestiona la parte comercial y logística del producto.
  - **SKU (Stock Keeping Unit):** Un código de referencia único para el producto. **Generación Automática:** Al crear un nuevo producto, el sistema genera automáticamente un SKU aleatorio para agilizar el proceso, aunque el sistema debería validar que no haya duplicados. **Edición Manual:** Este campo es totalmente editable, permitiéndote asignar códigos personalizados si lo necesitas.
  - **Precio Estándar y Precio de Oferta:** La lógica de precios es dual. El campo principal es `price` (precio en céntimos). Cuando se introduce un valor en el campo `Precio de Oferta`, el valor del `Precio Estándar` se mueve al campo `originalPrice`, y el campo `price` se actualiza con el nuevo valor de oferta. Si se borra el precio de oferta, el sistema revierte `originalPrice` al campo `price`. 
```javascript
// Lógica en product-form.tsx
if (salePrice > 0 && !currentOriginalPrice) {
  form.setValue('originalPrice', currentPrice);
}
form.setValue('price', salePrice);
```
  - **Stock Disponible:** Controla la cantidad de unidades disponibles. Si es `0`, el producto se muestra como "Agotado" y no se puede añadir al carrito. El `QuantitySelector` también usa este valor como límite máximo.

**- Etiquetas:** `Etiquetas Visibles` (se muestran como badges en la tarjeta del producto, ej: "Nuevo"), `Categorías Internas` (para control lógico, ej: "novedad", "mas-vendido", "pack").

### Personalização Web
*Ativar ou desativar funcionalidades chave, como a subscrição.*

**Técnico:** Lee y escribe en un archivo JSON en el servidor (`src/lib/site-settings.json`) usando `Server Actions`. Este archivo actúa como una bandera de características simple.

**Estético:** Interfaz simple con `Switch` para activar o desactivar la funcionalidad de suscripción en toda la web.

---

## Páginas Informativas e Legais

### Blog
*Lista de artigos e notícias.*

**Técnico:** Contenido estático hardcodeado en `src/lib/posts.ts`. Es una página renderizada en el servidor (Server Component) para un SEO óptimo.

**Estético:** Diseño clásico de blog con tarjetas de previsualización que incluyen imagen, título, extracto y fecha.

### Contacto
*Formulário de contacto e informações legais da empresa.*

**Técnico:** Un formulario controlado por el cliente que simula el envío de un email. No realiza una acción real de servidor.

**Estético:** Diseño a dos columnas que presenta la información de contacto junto al formulario.

### Envio e Tarifas
*Detalhes sobre as políticas e custos de envio.*

**Técnico:** Página de contenido estático.

**Estético:** Utiliza `Tables` para presentar las tarifas de forma clara y `Alerts` para destacar información importante.

### Termos e Condições
*Termos e condições gerais de contrato e venda.*

**Técnico:** Página de contenido estático.

**Estético:** Texto largo formateado dentro de una `Card` con estilos `prose` para mejorar la legibilidad.
