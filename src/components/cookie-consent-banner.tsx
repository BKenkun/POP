
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
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize preferences for the dialog. Default to all true for a better UX, encouraging acceptance.
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // When opening the dialog, if consent has been set previously, show the saved state.
  // Otherwise, show the default (all true).
  useEffect(() => {
      if (isOpen) {
          if(consent.necessary) { // If consent has been given previously
            setPreferences(consent);
          } else { // First time opening the dialog
            setPreferences({ necessary: true, analytics: true, marketing: true });
          }
      }
  }, [isOpen, consent]);

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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm border-t border-border p-2">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Cookie className="h-5 w-5 text-primary flex-shrink-0" />
              <p>Utilizamos cookies para mejorar tu experiencia. Puedes gestionar tus preferencias.</p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>Personalizar</Button>
            <Button variant="outline" size="sm" onClick={handleRejectAll}>Rechazar</Button>
            <Button size="sm" onClick={handleAcceptAll}>Aceptar Todas</Button>
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
