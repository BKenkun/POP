
"use client";

import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/context/language-context';

const FlagIcon = ({ countryCode }: { countryCode: 'es' | 'gb' | 'fr' | 'de' | 'it' | 'pt' }) => {
    const flags = {
        es: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className="w-5 h-auto mr-2"><rect width="5" height="3" fill="#C60B1E"/><rect width="5" height="1" y="1" fill="#FFC400"/></svg>,
        gb: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-5 h-auto mr-2"><clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" strokeWidth="6" clipPath="url(#a)"/><path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#a)"/><path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/></svg>,
        fr: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-5 h-auto mr-2"><path fill="#002395" d="M0 0h1v2H0z"/><path fill="#fff" d="M1 0h1v2H1z"/><path fill="#ED2939" d="M2 0h1v2H2z"/></svg>,
        de: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className="w-5 h-auto mr-2"><rect width="5" height="3" y="0" fill="#000"/><rect width="5" height="2" y="1" fill="#D00"/><rect width="5" height="1" y="2" fill="#FFCE00"/></svg>,
        it: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-5 h-auto mr-2"><path fill="#009246" d="M0 0h1v2H0z"/><path fill="#fff" d="M1 0h1v2H1z"/><path fill="#CE2B37" d="M2 0h1v2H2z"/></svg>,
        pt: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" className="w-5 h-auto mr-2"><path fill="#006241" d="M0 0h120v200H0z"/><path fill="#D9000D" d="M120 0h180v200H120z"/></svg>,
    };
    return flags[countryCode] || null;
};

const languages: { code: 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt'; name: string; flag: 'es' | 'gb' | 'fr' | 'de' | 'it' | 'pt' }[] = [
    { code: 'es', name: 'Spanish', flag: 'es' },
    { code: 'en', name: 'English', flag: 'gb' },
    { code: 'fr', name: 'French', flag: 'fr' },
    { code: 'de', name: 'German', flag: 'de' },
    { code: 'it', name: 'Italian', flag: 'it' },
    { code: 'pt', name: 'Portuguese', flag: 'pt' },
];

export default function FloatingLanguageButton() {
  const { setLanguage } = useLanguage();

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
        {languages.map(lang => (
             <DropdownMenuItem key={lang.code} onSelect={() => setLanguage(lang.code)} className="flex items-center">
                <FlagIcon countryCode={lang.flag} />
                <span>{lang.name}</span>
            </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
