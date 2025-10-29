
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, ShoppingCart, User, Lock, FileText, Settings, Truck, Package, PackagePlus, Mail, Newspaper, KeyRound, Bitcoin, Subscription } from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    title: 'Páginas Principales',
    icon: Home,
    features: [
      { name: 'Página de Inicio', path: '/', description: 'La página de bienvenida con productos destacados y acceso a las principales secciones.' },
      { name: 'Catálogo de Productos', path: '/products', description: 'Muestra todos los productos con filtros por marca, tamaño, composición y búsqueda.' },
      { name: 'Detalle de Producto', path: '/product/rush-original-10ml', description: 'Vista detallada de un producto con galería de imágenes, descripción y botón de compra (ejemplo con "Rush Original").' },
    ]
  },
  {
    title: 'Funcionalidades E-commerce',
    icon: ShoppingCart,
    features: [
      { name: 'Creador de Packs', path: '/create-pack', description: 'Herramienta para que los clientes creen su propio pack de productos con descuentos por volumen.' },
      { name: 'Carrito de la Compra', path: '#', description: 'El carrito es un panel lateral. Haz clic en el icono del carrito flotante para abrirlo después de añadir un producto.' },
      { name: 'Proceso de Pago (Checkout)', path: '/checkout', description: 'Flujo de pago en 4 pasos. Requiere tener productos en el carrito para funcionar.' },
    ]
  },
  {
    title: 'Suscripción "Dosis Mensual"',
    icon: PackagePlus,
    features: [
        { name: 'Página de Aterrizaje del Club', path: '/subscription', description: 'Página informativa para que los usuarios se unan al club de suscripción.' },
        { name: 'Gestión de la Suscripción', path: '/account/subscription', description: 'Panel para suscriptores donde personalizan su caja mensual y gestionan su membresía.' },
    ]
  },
  {
    title: 'Cuenta de Usuario y Autenticación',
    icon: User,
    features: [
      { name: 'Inicio de Sesión', path: '/login', description: 'Formulario para que los usuarios existentes accedan a su cuenta.' },
      { name: 'Registro de Nuevo Usuario', path: '/register', description: 'Formulario para que nuevos usuarios creen una cuenta.' },
      { name: 'Panel de Cuenta', path: '/account', description: 'Dashboard principal del usuario con resumen de su actividad. Requiere iniciar sesión.' },
      { name: 'Mis Pedidos', path: '/account/orders', description: 'Historial de todos los pedidos realizados por el usuario.' },
      { name: 'Detalle de un Pedido', path: '/account/orders/dummy-order-id', description: 'Ejemplo de la vista de un pedido específico (reemplaza "dummy-order-id" con un ID real).' },
      { name: 'Mis Direcciones', path: '/account/addresses', description: 'Gestión de direcciones de envío y facturación guardadas.' },
    ]
  },
  {
    title: 'Panel de Administración',
    icon: KeyRound,
    features: [
        { name: 'Dashboard de Admin', path: '/admin', description: 'Panel principal con estadísticas de la tienda. Requiere iniciar sesión como admin.' },
        { name: 'Gestión de Pedidos', path: '/admin/orders', description: 'Visualiza y gestiona todos los pedidos de la tienda.' },
        { name: 'Gestión de Envíos', path: '/admin/shipping', description: 'Panel para gestionar los pedidos que están en reparto.' },
        { name: 'Gestión de Productos', path: '/admin/products', description: 'Añade, edita y gestiona el catálogo de productos.' },
        { name: 'Gestión de Clientes', path: '/admin/customers', description: 'Consulta la lista de todos los usuarios registrados.' },
        { name: 'Personalización Web', path: '/admin/web', description: 'Activa o desactiva funcionalidades clave de la web, como la suscripción.' },
    ]
  },
  {
    title: 'Páginas Informativas y Legales',
    icon: FileText,
    features: [
      { name: 'Blog', path: '/blog', description: 'Listado de artículos y noticias.' },
      { name: 'Contacto', path: '/contacto', description: 'Formulario de contacto e información legal de la empresa.' },
      { name: 'Información sobre Poppers', path: '/popper-info', description: 'Guía detallada sobre los productos, efectos y seguridad.' },
      { name: 'Envíos y Tarifas', path: '/envio-tarifas', description: 'Detalles sobre las políticas y costes de envío.' },
      { name: 'Términos y Condiciones', path: '/terminos-y-condiciones', description: 'Condiciones generales de contratación y venta.' },
      { name: 'Política de Privacidad', path: '/privacidad', description: 'Información sobre cómo se gestionan los datos de los usuarios.' },
      { name: 'Política de Cookies', path: '/politica-cookies', description: 'Detalles sobre el uso de cookies en el sitio.' },
    ]
  },
];

export default function SiteDocumentationPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Documentación del Sitio Web</h1>
        <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
          Esta página sirve como una guía central para revisar y probar todas las funcionalidades implementadas en la aplicación.
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
              {section.features.map((feature) => (
                <div key={feature.name} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg hover:bg-secondary/50">
                  <div>
                    <h4 className="font-semibold">{feature.name}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-2 sm:mt-0">
                    <Link href={feature.path} target={feature.path !== '#' ? '_blank' : undefined}>
                      Probar
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
