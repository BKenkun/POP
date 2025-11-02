
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

const FlagIcon = ({ countryCode }: { countryCode: 'es' | 'gb' | 'fr' }) => {
    if (countryCode === 'es') {
        return (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className="w-5 h-auto mr-2">
                <rect width="5" height="3" fill="#C60B1E"/>
                <rect width="5" height="1" y="1" fill="#FFC400"/>
            </svg>
        )
    }
     if (countryCode === 'gb') {
        return (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-5 h-auto mr-2">
                <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath>
                <path d="M0 0v30h60V0z" fill="#012169"/>
                <path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" strokeWidth="6" clipPath="url(#a)"/>
                <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#a)"/>
                <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
                <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
            </svg>
        )
    }
     if (countryCode === 'fr') {
        return (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-5 h-auto mr-2">
                <path fill="#002395" d="M0 0h1v2H0z"/>
                <path fill="#fff" d="M1 0h1v2H1z"/>
                <path fill="#ED2939" d="M2 0h1v2H2z"/>
            </svg>
        )
    }
    return null;
};

export default function FloatingLanguageButton() {
  const { toast } = useToast();

  const handleLanguageSelect = (lang: string) => {
    toast({
      title: "Language selected",
      description: `You selected ${lang}. Translation functionality will be implemented soon.`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="relative h-14 w-14 rounded-full shadow-lg transition-all duration-300"
          aria-label="Select language"
        >
          <Languages className="h-7 w-7" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="mb-2">
        <DropdownMenuItem onSelect={() => handleLanguageSelect('Spanish')} className="flex items-center">
            <FlagIcon countryCode="es" />
            <span>Spanish</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleLanguageSelect('English')} className="flex items-center">
            <FlagIcon countryCode="gb" />
             <span>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleLanguageSelect('French')} className="flex items-center">
            <FlagIcon countryCode="fr" />
            <span>French</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
