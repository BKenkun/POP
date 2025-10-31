
import { getAllCustomers } from '@/app/actions/admin-data';
import AdminCustomersClientPage from './customers-client-page';

// --- Componente Contenedor (Servidor) ---
// Responsabilidad: Obtener y sanear los datos de los clientes.
export default async function AdminCustomersPage() {
  const customers = await getAllCustomers();
  
  return <AdminCustomersClientPage initialCustomers={customers} />;
}
