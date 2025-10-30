'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Construction, PackagePlus } from 'lucide-react';
import { updateSiteSettings, getSiteSettings } from '@/app/actions/site-settings';
import type { SiteSettings } from '@/app/actions/site-settings';

export default function AdminWebPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const currentSettings = await getSiteSettings();
      setSettings(currentSettings);
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleToggleChange = (key: keyof SiteSettings, value: boolean) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const handleSaveChanges = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateSiteSettings(settings);
      toast({
        title: "Ajustes Guardados",
        description: "La configuración de la web ha sido actualizada.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }
  
  if (!settings) {
    return <div>Error al cargar la configuración.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Personalización de la Web</h1>
          <p className="text-muted-foreground">Activa y desactiva funcionalidades globales de tu tienda.</p>
        </div>
         <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><PackagePlus />Dosis Mensual</CardTitle>
            <CardDescription>
                Activa o desactiva la funcionalidad de suscripción mensual en toda la tienda.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                    <Label htmlFor="subscription-toggle" className="text-base font-medium">
                        Mostrar funcionalidad de "Dosis Mensual"
                    </Label>
                    <p className="text-sm text-muted-foreground">
                       Si está inactivo, los enlaces y páginas de suscripción no serán visibles para los clientes.
                    </p>
                </div>
                 <Switch
                    id="subscription-toggle"
                    checked={settings.showSubscriptionFeature}
                    onCheckedChange={(checked) => handleToggleChange('showSubscriptionFeature', checked)}
                />
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Construction />Modo "En Construcción"</CardTitle>
            <CardDescription>
                Activa una página de aterrizaje para ocultar la web al público mientras realizas cambios.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                    <Label htmlFor="construction-toggle" className="text-base font-medium">
                        Activar modo "En construcción"
                    </Label>
                    <p className="text-sm text-muted-foreground">
                       Los visitantes verán la página de mantenimiento. Los administradores podrán seguir navegando la web.
                    </p>
                </div>
                 <Switch
                    id="construction-toggle"
                    checked={settings.underConstruction}
                    onCheckedChange={(checked) => handleToggleChange('underConstruction', checked)}
                />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
