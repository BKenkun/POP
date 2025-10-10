
import { getAllAdminCustomers } from "@/app/actions/admin-data";
import CustomersClientPage from "./customers-client-page";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Define a type for the user data we expect from the server action
export interface Customer {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    disabled: boolean;
    creationTime: string; // ISO string
}

async function CustomerList() {
    const allCustomers = await getAllAdminCustomers();
    return <CustomersClientPage initialCustomers={allCustomers} />;
}

// --- Componente Contenedor (Servidor) ---
// Responsabilidad: Obtener y sanear los datos de los clientes.
export default async function AdminCustomersPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clientes</h1>
      </div>
      <Suspense fallback={
        <div className="flex items-center justify-center h-60">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }>
        <CustomerList />
      </Suspense>
    </div>
  )
}
