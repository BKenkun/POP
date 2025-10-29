
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Home, ShoppingCart, User, FileText, KeyRound, PackagePlus, Wand2, Palette, Code, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    title: 'Páginas Principales',
    icon: Home,
    features: [
      { 
        name: 'Página de Inicio', 
        path: '/', 
        description: 'La página de bienvenida con productos destacados y acceso a las principales secciones.',
        details: [
            "**Técnico:** Utiliza `onSnapshot` de Firebase para cargar y escuchar cambios en los productos en tiempo real. `useMemo` se encarga de filtrar eficientemente los productos por categorías ('Novedades', 'Ofertas', etc.) sin recalcular en cada render.",
            "**Estético:** El diseño se basa en un `grid` responsivo que se adapta de 3 columnas en escritorio a 1 en móvil. Las tarjetas de producto (`ProductCard`) muestran un efecto de `hover` sutil y usan `next/image` para optimizar la carga de imágenes."
        ]
      },
      { 
        name: 'Catálogo de Productos', 
        path: '/products', 
        description: 'Muestra todos los productos con filtros por marca, tamaño, composición y búsqueda.',
        details: [
            "**Técnico:** El componente `ProductFilters` gestiona el estado de los filtros (`useState`) y la lógica de filtrado y ordenación (`useMemo`). La URL se actualiza con los parámetros de filtro (`useRouter`, `useSearchParams`) para que los enlaces se puedan compartir.",
            "**Estético:** Se usa un `Accordion` de ShadCN para organizar los filtros de forma compacta. La parrilla de productos (`ProductGrid`) muestra un mensaje claro cuando no hay resultados. El componente `Suspense` muestra un esqueleto de carga (`Skeleton`) mientras se obtienen los datos."
        ]
      },
      { 
        name: 'Detalle de Producto', 
        path: '/product/rush-original-10ml', 
        description: 'Vista detallada de un producto con galería, información y productos relacionados (ejemplo con "Rush Original").',
        details: [
            "**Técnico:** Carga los datos de un único producto desde Firestore usando `onSnapshot`. El estado del cliente (cantidad, selección de imagen) se maneja con `useState`. La lógica para añadir al carrito reside en el componente `ProductInfo` y se comunica con el `CartContext`.",
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
        path: '/create-pack', 
        description: 'Herramienta para que los clientes creen su propio pack de productos con descuentos por volumen.',
        details: [
            "**Técnico:** La lógica de precios es manejada por un flujo de Genkit (`calculatePackPriceFlow`) que calcula el descuento dinámicamente. El estado del pack se gestiona en el cliente (`useState`), y un `useEffect` con `setTimeout` (debounce) llama al flujo de IA para evitar peticiones excesivas.",
            "**Estético:** La interfaz está dividida en tres columnas: filtros, selección de productos y resumen del pack. El resumen se actualiza en tiempo real mostrando el ahorro y el precio final."
        ]
      },
      { 
        name: 'Carrito de la Compra', 
        path: '#', 
        description: 'El carrito es un panel lateral. Haz clic en el icono del carrito flotante para abrirlo después de añadir un producto.',
        details: [
            "**Técnico:** Implementado como un Contexto de React (`CartContext`) que gestiona el estado global del carrito. Esto permite que cualquier componente pueda añadir productos o consultar el estado del carrito. Los datos no son persistentes entre sesiones (se borran al recargar).",
            "**Estético:** Se presenta como un panel `Sheet` que se desliza desde la derecha, proporcionando una experiencia fluida sin abandonar la página actual."
        ]
      },
      { 
        name: 'Proceso de Pago (Checkout)', 
        path: '/checkout', 
        description: 'Flujo de pago en 4 pasos. Requiere tener productos en el carrito para funcionar.',
        details: [
            "**Técnico:** Utiliza un formulario multi-paso controlado por `useState`. La validación de datos se realiza con `react-hook-form` y `zod`. La creación del pedido en Firestore y la llamada a NOWPayments se gestionan a través de `Server Actions` para mayor seguridad.",
            "**Estético:** Un componente `Stepper` visual indica el progreso del usuario. Los métodos de pago se presentan de forma clara usando `RadioGroup`, y los campos de dirección se rellenan automáticamente si el usuario ha guardado direcciones."
        ]
      },
    ]
  },
  {
    title: 'Suscripción "Dosis Mensual"',
    icon: PackagePlus,
    features: [
        { 
            name: 'Página de Aterrizaje del Club', 
            path: '/subscription', 
            description: 'Página informativa para que los usuarios se unan al club de suscripción. El botón "Unirme al Club" inicia el proceso de pago.',
             details: [
                "**Técnico:** El botón 'Unirme' llama a la `Server Action` `createNowPaymentsSubscription`, que se comunica con la API de NOWPayments para generar una URL de pago de suscripción única para el usuario. La lógica verifica la sesión del usuario antes de proceder.",
                "**Estético:** Diseño atractivo con `Cards` para resaltar los beneficios, iconos de `lucide-react` y una imagen destacada para atraer al usuario. El botón de acción principal tiene un color y tamaño prominentes."
            ]
        },
        { 
            name: 'Gestión de la Suscripción', 
            path: '/account/subscription', 
            description: 'Panel para suscriptores donde personalizan su caja mensual y gestionan su membresía.',
            details: [
                "**Técnico:** La página obtiene los productos (poppers y accesorios) de Firestore en tiempo real. La selección del usuario se guarda localmente (simulado con `localStorage` en `src/lib/subscription.ts`) y se podría migrar a Firestore. El botón de cancelar llama a la `Server Action` `cancelNowPaymentsSubscription`.",
                "**Estético:** `SubscriptionTimeline` es un componente visual que muestra el estado del ciclo mensual. `MonthlyBoxSelector` utiliza `Dialogs` para la selección de productos, mostrando `ProductCard` dentro de la ventana emergente."
            ]
        },
    ]
  },
  {
    title: 'Cuenta de Usuario y Autenticación',
    icon: User,
    features: [
      { name: 'Inicio de Sesión', path: '/login', description: 'Formulario para que los usuarios existentes accedan a su cuenta.', details: ["**Técnico:** Utiliza Firebase Auth (`signInWithEmailAndPassword`). Tras un inicio de sesión exitoso, llama a la API Route `/api/login` para crear una `session-cookie` segura (`httpOnly`), permitiendo la autenticación en Server Actions y otras partes del servidor.", "**Estético:** Un formulario simple y centrado dentro de una `Card`, con opción para mostrar/ocultar la contraseña."] },
      { name: 'Registro de Nuevo Usuario', path: '/register', description: 'Formulario para que nuevos usuarios creen una cuenta.', details: ["**Técnico:** Usa `createUserWithEmailAndPassword`. Al registrarse, crea un nuevo documento para el usuario en la colección `users` de Firestore con valores iniciales (puntos de fidelidad, etc.).", "**Estético:** Similar al login, un formulario claro con validación de contraseña para asegurar que coincidan."] },
      { name: 'Panel de Cuenta', path: '/account', description: 'Dashboard principal del usuario con resumen de su actividad. Requiere iniciar sesión.', details: ["**Técnico:** Protegido por el `AccountLayout`, que redirige a los usuarios no autenticados. Muestra datos del `AuthContext`, como `loyaltyPoints` e `isSubscribed`. El toggle 'Navegar como cliente' usa `localStorage` para persistir el estado.", "**Estético:** Usa `Cards` para segmentar la información: perfil, puntos y gestión de la suscripción/admin."] },
      { name: 'Mis Pedidos', path: '/account/orders', description: 'Historial de todos los pedidos realizados por el usuario.', details: ["**Técnico:** Realiza una consulta a Firestore (`collection(db, 'users', user.uid, 'orders')`) para obtener y mostrar los pedidos del usuario en tiempo real con `onSnapshot`.", "**Estético:** Muestra los pedidos en una `Table` con `Badges` de colores para indicar el estado de cada pedido."] },
      { name: 'Mis Direcciones', path: '/account/addresses', description: 'Gestión de direcciones de envío y facturación guardadas.', details: ["**Técnico:** Permite al usuario realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en sus direcciones. Las actualizaciones se envían a la `Server Action` `updateUser`, que modifica el documento del usuario en Firestore.", "**Estético:** Utiliza un `Dialog` con un formulario de `react-hook-form` para añadir/editar direcciones y un `AlertDialog` para confirmar la eliminación."] },
    ]
  },
  {
    title: 'Panel de Administración',
    icon: KeyRound,
    features: [
        { name: 'Dashboard de Admin', path: '/admin', description: 'Panel principal con estadísticas. Requiere iniciar sesión como admin (maryandpopper@gmail.com).', details: ["**Técnico:** Protegido por `AdminLayout`, que comprueba el email del usuario. Obtiene todos los pedidos y usuarios con `collectionGroup` y `onSnapshot` para calcular métricas en tiempo real. `OverviewChart` usa `recharts` para visualizar los datos.", "**Estético:** Interfaz densa en información con `Cards` de estadísticas, un gráfico de líneas y listas de pedidos/clientes recientes."] },
        { name: 'Gestión de Pedidos', path: '/admin/orders', description: 'Visualiza y gestiona todos los pedidos de la tienda.', details: ["**Técnico:** Usa `Tabs` para filtrar pedidos por estado (Nuevos, En Reparto, etc.). Los datos se obtienen una vez (`getDocs`) para mejorar el rendimiento. Cada fila enlaza a la página de detalle del pedido pasando la ruta del documento como parámetro URL para una carga rápida.", "**Estético:** Diseño de `Tabs` claro y funcional. La tabla incluye acciones rápidas para ver o gestionar el envío."] },
        { name: 'Gestión de Productos', path: '/admin/products', description: 'Añade, edita y gestiona el catálogo de productos.', details: ["**Técnico:** Realiza operaciones CRUD completas en la colección `products` de Firestore. `updateDoc` se usa para archivar/activar y `deleteDoc` para eliminar. El formulario (`ProductForm`) es un componente reutilizable para crear y editar.", "**Estético:** La tabla de productos incluye `Switch` para cambiar el estado de `active` y un `DropdownMenu` para las acciones (Editar, Archivar, Eliminar)."] },
        { name: 'Personalización Web', path: '/admin/web', description: 'Activa o desactiva funcionalidades clave de la web, como la suscripción.', details: ["**Técnico:** Lee y escribe en un archivo JSON en el servidor (`src/lib/site-settings.json`) usando `Server Actions` (`getSiteSettings` y `updateSiteSettings`). Este archivo actúa como una bandera de características simple.", "**Estético:** Interfaz simple con `Switch` para activar o desactivar la funcionalidad de suscripción en toda la web."] },
    ]
  },
  {
    title: 'Páginas Informativas y Legales',
    icon: FileText,
    features: [
      { name: 'Blog', path: '/blog', description: 'Listado de artículos y noticias.', details: ["**Técnico:** Contenido estático hardcodeado en `src/lib/posts.ts`. Es una página renderizada en el servidor (Server Component) para un SEO óptimo.", "**Estético:** Diseño clásico de blog con tarjetas de previsualización que incluyen imagen, título, extracto y fecha."] },
      { name: 'Contacto', path: '/contacto', description: 'Formulario de contacto e información legal de la empresa.', details: ["**Técnico:** Un formulario controlado por el cliente que simula el envío de un email. No realiza una acción real de servidor, solo muestra una notificación de éxito.", "**Estético:** Diseño a dos columnas que presenta la información de contacto junto al formulario para fácil acceso."] },
      { name: 'Envíos y Tarifas', path: '/envio-tarifas', description: 'Detalles sobre las políticas y costes de envío.', details: ["**Técnico:** Página de contenido estático.", "**Estético:** Utiliza `Tables` para presentar las tarifas de forma clara y `Alerts` para destacar la información importante."] },
      { name: 'Términos y Condiciones', path: '/terminos-y-condiciones', description: 'Condiciones generales de contratación y venta.', details: ["**Técnico:** Página de contenido estático.", "**Estético:** Texto largo formateado dentro de una `Card` con estilos `prose` para mejorar la legibilidad."] },
    ]
  },
];

export default function SiteDocumentationPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Documentación del Sitio Web</h1>
        <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
          Esta página sirve como una guía central para revisar y probar todas las funcionalidades implementadas en la aplicación. Marca las casillas para llevar un control de tu revisión.
        </p>
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
              {section.features.map((feature, index) => (
                <div key={feature.name} className="p-4 border rounded-lg hover:bg-secondary/50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                       <Checkbox id={`check-${section.title}-${index}`} className="h-5 w-5"/>
                       <Label htmlFor={`check-${section.title}-${index}`} className="text-base font-semibold">{feature.name}</Label>
                    </div>
                    <Button asChild variant="outline" size="sm" className="shrink-0">
                      <Link href={feature.path} target={feature.path !== '#' ? '_blank' : undefined} rel="noopener noreferrer">
                        Probar
                        <ExternalLink className="ml-2 h-4 w-4"/>
                      </Link>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 ml-8 sm:ml-0">{feature.description}</p>
                  
                  <Accordion type="single" collapsible className="w-full mt-2">
                    <AccordionItem value="item-1" className="border-b-0">
                      <AccordionTrigger className="text-sm py-2 hover:no-underline text-muted-foreground">Ver detalles técnicos y estéticos</AccordionTrigger>
                      <AccordionContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 space-y-2 pl-4 border-l-2 ml-2 border-primary/50">
                           {feature.details.map((detail, i) => (
                               <p key={i} dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
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

