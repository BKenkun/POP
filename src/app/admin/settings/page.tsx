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
    async function loadSettings() {
      try {
        if (!user) throw new Error('Administrator session required');
        const result = await getPacklinkSettings();
        if (active && result) setSettings({ ...defaults, ...result });
      } catch (error) {
        console.error('[PACKLINK_SETTINGS] Could not load settings', error);
        if (active) toast({ title: 'Could not load settings', description: 'Showing default values. Check permissions and try again.', variant: 'destructive' });
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadSettings();
    return () => { active = false; };
  }, [toast, user]);

  const update = (key: keyof PacklinkAdminSettings, value: string) => setSettings(current => ({
    ...current, [key]: ['weightKg', 'lengthCm', 'widthCm', 'heightCm'].includes(key) ? Number(value) : value,
  }));

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await savePacklinkSettings(settings);
      toast({ title: 'Settings saved', description: 'Upcoming shipping calculations will use this data.' });
    } catch (error) {
      toast({ title: 'Could not save', description: error instanceof Error ? error.message : 'Make sure you are logged in as an administrator.', variant: 'destructive' });
    } finally { setSaving(false); }
  }

  const field = (label: string, key: keyof PacklinkAdminSettings, type = 'text') => (
    <div className="space-y-2" key={key}><Label htmlFor={key}>{label}</Label>
      <Input id={key} type={type} value={String(settings[key])} onChange={(e) => update(key, e.target.value)} />
    </div>
  );

  return <div className="mx-auto max-w-4xl space-y-6">
    <div><h1 className="text-3xl font-bold">Store Settings</h1>
      <p className="text-muted-foreground">Manage Packlink PRO warehouse settings without modifying code.</p></div>
    <Card><CardHeader>
      <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" />Packlink PRO · Shipment Origin</CardTitle>
      <CardDescription>These details apply to quotes and new shipments. Previous orders will retain their data.</CardDescription>
    </CardHeader><CardContent className="space-y-5">
      {loading ? <div className="flex items-center gap-2 py-8"><Loader2 className="h-5 w-5 animate-spin" />Loading settings…</div> : <>
        <div className="grid gap-4 md:grid-cols-2">
          {field('Sender name or company', 'senderName')}{field('Address', 'street')}
          {field('City', 'city')}{field('Postal code', 'postalCode')}
          <div className="space-y-2"><Label htmlFor="country">Warehouse country</Label>
            <select id="country" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={settings.country} onChange={(e) => update('country', e.target.value)}>
              <option value="ES">Spain (test)</option><option value="FR">France (main warehouse)</option><option value="PT">Portugal</option>
            </select></div>
          {field('Sender phone', 'phone', 'tel')}{field('Sender email', 'email', 'email')}
        </div>
        <div className="border-t pt-5"><h3 className="mb-4 font-semibold">Default package</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {field('Weight (kg)', 'weightKg', 'number')}{field('Length (cm)', 'lengthCm', 'number')}
            {field('Width (cm)', 'widthCm', 'number')}{field('Height (cm)', 'heightCm', 'number')}
          </div></div>
        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">The API key remains protected in Google Cloud Secret Manager. The destination is entered by each customer at checkout.</div>
        <Button onClick={handleSave} disabled={saving || !user} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Saving…' : 'Save settings'}
        </Button>
      </>}
    </CardContent></Card>
  </div>;
}
