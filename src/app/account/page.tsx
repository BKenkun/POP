
'use client';

import { useAuth } from "@/context/auth-context";
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Placeholder for order type
interface Order {
    id: string;
    date: string;
    status: string;
    total: string;
}

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const [userName, setUserName] = useState(user?.displayName || user?.email?.split('@')[0] || "Usuario");
  const userEmail = user?.email || "No email provided";

  // Placeholder data for recent order, you can replace this with real data fetching
  const recentOrder: Order | null = null; // Set to null initially or fetch real data

  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
        const data = doc.data();
        if (data?.displayName) {
          setUserName(data.displayName);
        }
      });
      return () => unsub();
    }
  }, [user]);

  return (
    <div className="space-y-6">
        <div className="space-y-1">
            <h2 className="text-2xl font-bold">Panel de Usuario</h2>
            <p className="text-muted-foreground">
                Bienvenido de nuevo, {userName}. Aquí tienes un resumen de tu actividad.
            </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
            <CardHeader>
                <CardTitle>Información de Perfil</CardTitle>
                <CardDescription>Tus datos personales.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <p><span className="font-semibold">Nombre:</span> {userName}</p>
                <p><span className="font-semibold">Email:</span> {userEmail}</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Último Pedido</CardTitle>
                 <CardDescription>Resumen de tu compra más reciente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {recentOrder ? (
                    <>
                        <p><span className="font-semibold">Pedido Nº:</span> {recentOrder.id}</p>
                        <p><span className="font-semibold">Fecha:</span> {recentOrder.date}</p>
                        <p><span className="font-semibold">Total:</span> {recentOrder.total}</p>
                        <p><span className="font-semibold">Estado:</span> <span className="text-green-600 font-medium">{recentOrder.status}</span></p>
                    </>
                ) : (
                    <p className="text-muted-foreground">No tienes pedidos recientes.</p>
                )}
            </CardContent>
            </Card>
        </div>
    </div>
  )
}
