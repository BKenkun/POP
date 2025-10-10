
import { getAllAdminCustomers } from "@/app/actions/admin-data";
import CustomersClientPage from "./customers-client-page";

// Define a type for the user data we expect from the server action
export interface Customer {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    disabled: boolean;
    creationTime: string; // ISO string
}

// --- Componente Contenedor (Servidor) ---
// Responsabilidad: Obtener y sanear los datos de los clientes.
export default async function AdminCustomersPage() {
  // 1. Obtenemos los datos en el servidor y nos aseguramos de que son seguros.
  const allCustomers = await getAllAdminCustomers();

  // 2. Pasamos los datos "limpios" (serializados) a un componente de cliente para su presentación.
  return <CustomersClientPage initialCustomers={allCustomers} />;
}
