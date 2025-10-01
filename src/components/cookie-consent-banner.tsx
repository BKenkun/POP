
'use client';

import { useEffect, useState } from 'react';
import { useCookieConsent } from '@/context/cookie-context';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Shield, BarChart2, Megaphone } from 'lucide-react';
import { Separator } from './ui/separator';

export default function CookieConsentBanner() {
  const { consent, setConsent } = useCookieConsent();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState(consent);

  useEffect(() => {
    setPreferences(consent);
  }, [consent]);

  const handleAcceptAll = () => {
    setConsent({ necessary: true, analytics: true, marketing: true });
  };

  const handleRejectAll = () => {
    setConsent({ necessary: true, analytics: false, marketing: false });
  };
  
  const handleSavePreferences = () => {
    setConsent(preferences);
    setIsOpen(false);
  }

  if (!isClient || consent.necessary) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm border-t border-border p-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
              <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="text-sm">
                  <h3 className="font-semibold text-foreground">Este sitio web utiliza cookies</h3>
                  <p className="text-muted-foreground">Usamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. Puedes gestionar tus preferencias en cualquier momento.</p>
              </div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <Button variant="ghost" onClick={() => setIsOpen(true)}>Personalizar</Button>
            <Button variant="outline" onClick={handleRejectAll}>Rechazar</Button>
            <Button onClick={handleAcceptAll}>Aceptar Todas</Button>
          </div>
        </div>
      </div>
      
       <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Preferencias de Cookies</DialogTitle>
                  <DialogDescription>
                      Gestiona qué cookies permites en nuestro sitio. Las cookies necesarias no se pueden desactivar.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                      <Label htmlFor="necessary-cookies" className="flex items-center gap-2 font-bold">
                        <Shield className="h-5 w-5 text-primary" />
                        <span>Técnicas (Siempre activas)</span>
                      </Label>
                      <Switch id="necessary-cookies" checked disabled />
                  </div>
                  <Separator />
                   <div className="flex items-center justify-between p-3 rounded-lg border">
                      <Label htmlFor="analytics-cookies" className="flex items-center gap-2 font-semibold">
                         <BarChart2 className="h-5 w-5 text-primary" />
                        <span>Análisis</span>
                      </Label>
                      <Switch
                          id="analytics-cookies"
                          checked={preferences.analytics}
                          onCheckedChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
                      />
                  </div>
                   <div className="flex items-center justify-between p-3 rounded-lg border">
                      <Label htmlFor="marketing-cookies" className="flex items-center gap-2 font-semibold">
                        <Megaphone className="h-5 w-5 text-primary" />
                        <span>Marketing</span>
                      </Label>
                      <Switch
                          id="marketing-cookies"
                          checked={preferences.marketing}
                          onCheckedChange={(checked) => setPreferences({ ...preferences, marketing: checked })}
                      />
                  </div>
              </div>
              <DialogFooter>
                  <Button onClick={handleSavePreferences}>Guardar Preferencias</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
