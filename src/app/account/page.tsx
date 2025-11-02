
'use client';

import { useAuth } from "@/context/auth-context";
import { CardTitle, CardDescription, CardHeader, CardContent, Card, CardFooter } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils";
import { Gift, PackagePlus, Settings, Shield, KeyRound, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';
import { getSiteSettings } from '../actions/site-settings';
import type { SiteSettings } from '../actions/site-settings';
import { useTranslation } from "@/context/language-context";

export default function AccountDashboardPage() {
  const { user, isSubscribed, loyaltyPoints, isAdmin, isViewingAsCustomer, setIsViewingAsCustomer } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSettings = async () => {
      const siteSettings = await getSiteSettings();
      setSettings(siteSettings);
    }
    fetchSettings();
  }, []);

  const userName = isAdmin ? "Administrador" : (user?.displayName || user?.email?.split('@')[0] || "Usuario");
  const userEmail = user?.email || "No email provided";
  
  const pointsValue = (loyaltyPoints / 100) * 200;

  // O "isAdmin" aqui refere-se ao estado real, não ao modo de visualização.
  const isActualAdmin = !!user && user.email === 'maryandpopper@gmail.com';

  return (
    <div className="space-y-6">
        <div className="space-y-1">
            <h2 className="text-2xl font-bold">{t('account.dashboard_title')}</h2>
            <p className="text-muted-foreground">
                {t('account.dashboard_welcome', { name: userName })}
            </p>
        </div>

        {isActualAdmin && (
             <Card className="border-amber-500 border-2 bg-amber-500/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-600">
                        <KeyRound className="h-6 w-6"/>
                        <span>Acceso de Administrador</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <p className="text-muted-foreground">
                       Has iniciado sesión como administrador. Desde aquí puedes acceder al panel de gestión o navegar por la tienda como un cliente normal.
                    </p>
                    <div className="flex items-center space-x-2 rounded-lg border p-3 shadow-sm">
                        <Eye className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="view-as-customer" className="flex-grow">Navegar como cliente</Label>
                        <Switch
                            id="view-as-customer"
                            checked={isViewingAsCustomer}
                            onCheckedChange={setIsViewingAsCustomer}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild>
                        <Link href="/admin" target="_blank">
                            <Shield className="mr-2" />
                            Ir al Panel de Administración
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        )}

        {isSubscribed && !isAdmin && settings?.showSubscriptionFeature && (
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
                <CardTitle>{t('account.dashboard_profile_title')}</CardTitle>
                <CardDescription>{t('account.dashboard_profile_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <p><span className="font-semibold">{t('account.dashboard_profile_name')}</span> {userName}</p>
                <p><span className="font-semibold">{t('account.dashboard_profile_email')}</span> {userEmail}</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary"/>
                    {t('account.dashboard_loyalty_title')}
                </CardTitle>
                 <CardDescription>{t('account.dashboard_loyalty_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-center">
               <p className="text-4xl font-bold text-primary">{loyaltyPoints}</p>
               <p className="font-semibold text-muted-foreground">{t('account.dashboard_loyalty_points')}</p>
               <p className="text-sm">
                {t('account.dashboard_loyalty_value', { price: formatPrice(pointsValue) })}
               </p>
            </CardContent>
            </Card>
        </div>
    </div>
  )
}
