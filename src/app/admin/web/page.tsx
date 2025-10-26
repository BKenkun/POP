'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
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
          <p className="text-muted-foreground">Modifica la apariencia y el contenido de tu tienda online.</p>
        </div>
         <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Visibilidad de Funcionalidades</CardTitle>
            <CardDescription>
                Activa o desactiva secciones enteras de la web. Los cambios se aplicarán a todos los usuarios.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                    <Label htmlFor="subscription-toggle" className="text-base font-medium">
                        Función de Suscripción ("Dosis Mensual")
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        Si se desactiva, se ocultarán todos los enlaces y páginas relacionados con la suscripción del "Club Dosis Mensual".
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
    </div>
  );
}
