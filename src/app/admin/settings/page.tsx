'use client';

// Modificado por: Webmaster Freddy Poleo

import { useEffect, useState } from 'react';
import { getPacklinkSettings, savePacklinkSettings, type PacklinkAdminSettings } from '@/app/actions/packlink-settings';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Truck } from 'lucide-react';

const defaults: PacklinkAdminSettings = {
  senderName: 'enrique espin cosme', street: 'biologo konrad lorenz, 6 3d', city: 'Alicante',
  postalCode: '03015', country: 'ES', phone: '+34 686 35 15 72',
  email: 'info@comprarpopperonline.com', weightKg: 1, lengthCm: 15, widthCm: 8, heightCm: 6,
};

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PacklinkAdminSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getPacklinkSettings().then((result) => { if (active && result) setSettings({ ...defaults, ...result }); })
      .catch((error) => {
        console.error('[PACKLINK_SETTINGS] No se pudo cargar la configuración', error);
        if (active) toast({ title: 'No se pudo cargar la configuración', description: 'Se muestran los valores iniciales. Comprueba los permisos y vuelve a intentarlo.', variant: 'destructive' });
      }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [toast]);

  const update = (key: keyof PacklinkAdminSettings, value: string) => setSettings(current => ({
    ...current, [key]: ['weightKg', 'lengthCm', 'widthCm', 'heightCm'].includes(key) ? Number(value) : value,
  }));

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await savePacklinkSettings(settings, await user.getIdToken());
      toast({ title: 'Configuración guardada', description: 'Los próximos cálculos de envío usarán estos datos.' });
    } catch (error) {
      toast({ title: 'No se pudo guardar', description: error instanceof Error ? error.message : 'Comprueba que has iniciado sesión como administrador.', variant: 'destructive' });
    } finally { setSaving(false); }
  }

  const field = (label: string, key: keyof PacklinkAdminSettings, type = 'text') => (
    <div className="space-y-2" key={key}><Label htmlFor={key}>{label}</Label>
      <Input id={key} type={type} value={String(settings[key])} onChange={(e) => update(key, e.target.value)} />
    </div>
  );

  return <div className="mx-auto max-w-4xl space-y-6">
    <div><h1 className="text-3xl font-bold">Configuración de la tienda</h1>
      <p className="text-muted-foreground">Cambia el almacén de Packlink PRO sin modificar código.</p></div>
    <Card><CardHeader>
      <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" />Packlink PRO · Origen de los envíos</CardTitle>
      <CardDescription>Estos datos se aplican a cotizaciones y nuevos envíos. Los pedidos anteriores conservarán sus datos.</CardDescription>
    </CardHeader><CardContent className="space-y-5">
      {loading ? <div className="flex items-center gap-2 py-8"><Loader2 className="h-5 w-5 animate-spin" />Cargando configuración…</div> : <>
        <div className="grid gap-4 md:grid-cols-2">
          {field('Nombre del remitente o empresa', 'senderName')}{field('Dirección', 'street')}
          {field('Ciudad', 'city')}{field('Código postal', 'postalCode')}
          <div className="space-y-2"><Label htmlFor="country">País del almacén</Label>
            <select id="country" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={settings.country} onChange={(e) => update('country', e.target.value)}>
              <option value="ES">España (pruebas)</option><option value="FR">Francia (almacén definitivo)</option><option value="PT">Portugal</option>
            </select></div>
          {field('Teléfono del remitente', 'phone', 'tel')}{field('Correo del remitente', 'email', 'email')}
        </div>
        <div className="border-t pt-5"><h3 className="mb-4 font-semibold">Paquete predeterminado</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {field('Peso (kg)', 'weightKg', 'number')}{field('Largo (cm)', 'lengthCm', 'number')}
            {field('Ancho (cm)', 'widthCm', 'number')}{field('Alto (cm)', 'heightCm', 'number')}
          </div></div>
        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">La clave API permanece protegida en Google Cloud Secret Manager. El destino lo introduce cada cliente en el checkout.</div>
        <Button onClick={handleSave} disabled={saving || !user} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Guardando…' : 'Guardar configuración'}
        </Button>
      </>}
    </CardContent></Card>
  </div>;
}
