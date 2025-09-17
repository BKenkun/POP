
'use client';

import { useAuth } from "@/context/auth-context";
import { CardTitle, CardDescription, CardHeader, CardContent, Card, CardFooter } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatPrice } from "@/lib/utils";
import { Gift, HeartPulse, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccountDashboardPage() {
  const { user, isSubscribed } = useAuth();
  const [userName, setUserName] = useState(user?.displayName || user?.email?.split('@')[0] || "Usuario");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const userEmail = user?.email || "No email provided";

  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
        const data = doc.data();
        if (data?.displayName) {
          setUserName(data.displayName);
        }
        if (data?.loyaltyPoints) {
            setLoyaltyPoints(data.loyaltyPoints);
        }
      });
      return () => unsub();
    }
  }, [user]);
  
  // 100 points = 2€ discount
  const pointsValue = (loyaltyPoints / 100) * 200;

  return (
    <div className="space-y-6">
        <div className="space-y-1">
            <h2 className="text-2xl font-bold">Panel de Usuario</h2>
            <p className="text-muted-foreground">
                Bienvenido de nuevo, {userName}. Aquí tienes un resumen de tu actividad.
            </p>
        </div>

        {isSubscribed && (
            <Card className="border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500"/>
                        <span>¡Formas parte del Club Dosis Mensual!</span>
                    </CardTitle>
                    <CardDescription>
                        Tu suscripción está activa. Gestiona tus preferencias y revisa tu próximo envío.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild>
                        <Link href="/account/subscription">Gestionar mi Suscripción</Link>
                    </Button>
                </CardFooter>
            </Card>
        )}

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
                <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary"/>
                    Puntos de Fidelidad
                </CardTitle>
                 <CardDescription>Gana puntos con cada compra.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-center">
               <p className="text-4xl font-bold text-primary">{loyaltyPoints}</p>
               <p className="font-semibold text-muted-foreground">Puntos Acumulados</p>
               <p className="text-sm">
                Tu saldo equivale a un descuento de <span className="font-bold">{formatPrice(pointsValue)}</span>.
               </p>
            </CardContent>
            </Card>
        </div>
    </div>
  )
}
