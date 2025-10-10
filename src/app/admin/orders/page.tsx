
import OrdersClientPage from './orders-client-page';

// --- Componente Contenedor (Servidor) ---
// Responsabilidad: Renderizar el componente de cliente que se encargará de obtener sus propios datos.
export default async function AdminOrdersPage() {
  // Ya no obtenemos los datos aquí. El componente cliente lo hará.
  return <OrdersClientPage />;
}
