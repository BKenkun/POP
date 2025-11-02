
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

export default function FloatingLanguageButton() {
  const { toast } = useToast();

  const handleLanguageSelect = (lang: string) => {
    toast({
      title: "Idioma seleccionado",
      description: `Has seleccionado el idioma: ${lang}. La funcionalidad de traducción se implementará próximamente.`,
    });
  };

  return (
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
      <DropdownMenuContent align="center" side="top" className="mb-2">
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
  );
}
