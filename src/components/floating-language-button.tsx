
"use client";

import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { useCookieConsent } from '@/context/cookie-context';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function FloatingLanguageButton() {
  const { toast, toasts } = useToast();
  const { consent } = useCookieConsent();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLanguageSelect = (lang: string) => {
    toast({
      title: "Idioma seleccionado",
      description: `Has seleccionado el idioma: ${lang}. La funcionalidad de traducción se implementará próximamente.`,
    });
  };
  
  const isBannerVisible = isClient && !consent.necessary;
  const isToastVisible = toasts.length > 0;

  return (
      <div className={cn(
        "fixed left-6 z-50 transition-all duration-300",
        isBannerVisible ? "bottom-[72px]" : "bottom-6",
        isToastVisible ? 'opacity-0 invisible' : 'opacity-100 visible'
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="relative h-10 w-10 rounded-full shadow-lg transition-all duration-300"
              aria-label="Select language"
            >
              <Languages className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="mb-2">
            <DropdownMenuItem onSelect={() => handleLanguageSelect('Español')}>
              Español
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleLanguageSelect('English')}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleLanguageSelect('Français')}>
              Français
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );
}
