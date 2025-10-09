
'use client';

import { useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { CardTitle, CardDescription, CardHeader, CardContent, Card, CardFooter } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { doc } from "firebase/firestore";
import { formatPrice } from "@/lib/utils";
import { Gift, HeartPulse, CheckCircle, PackagePlus, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccountDashboardPage() {
  const { user, isSubscribed, loyaltyPoints } = useAuth();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "users", user.uid);
  }, [user, firestore]);

  const { data: userData } = useDoc<{ displayName: string }>(userDocRef);

  const userName = userData?.displayName || user?.displayName || user?.email?.split('@')[0] || "Usuario";
  const userEmail = user?.email || "No email provided";
  
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
            <Card className="border-primary border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <PackagePlus className="h-6 w-6"/>
                        <span>Gestionar Dosis Mensual</span>
                    </CardTitle>
                    <CardDescription>
                       Eres miembro del Club. Personaliza tu caja de este mes y gestiona tu suscripción.
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                    <p className="font-semibold">
                        Estado: <span className="text-green-600 font-bold">Activa</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Tu próxima caja está esperando a que la personalices.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button asChild>
                        <Link href="/account/subscription">
                            <Settings className="mr-2" />
                            Personalizar mi caja de este mes
                        </Link>
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
