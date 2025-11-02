
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

type Language = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt';

// Define a nested structure for translations
type Translations = {
  [key: string]: string | Translations;
};

// Simplified dictionary for now
const translations: Record<Language, Translations> = {
  es: {
    header: {
      free_shipping: 'GRATIS +40€',
      fast_delivery: '24/48h',
      nav_menu: 'Menú de Navegación',
      products: 'Productos',
      create_pack: 'Crea tu Pack',
      monthly_dose: 'Dosis Mensual'
    }
  },
  en: {
    header: {
      free_shipping: 'FREE +€40',
      fast_delivery: '24/48h',
      nav_menu: 'Navigation Menu',
      products: 'Products',
      create_pack: 'Create your Pack',
      monthly_dose: 'Monthly Dose'
    }
  },
  fr: {
    header: {
      free_shipping: 'GRATUIT +40€',
      fast_delivery: '24/48h',
      nav_menu: 'Menu de Navigation',
      products: 'Produits',
      create_pack: 'Créez votre Pack',
      monthly_dose: 'Dose Mensuelle'
    }
  },
  de: {
    header: {
      free_shipping: 'GRATIS +40€',
      fast_delivery: '24/48h',
      nav_menu: 'Navigationsmenü',
      products: 'Produkte',
      create_pack: 'Ihr Paket erstellen',
      monthly_dose: 'Monatsdosis'
    }
  },
  it: {
    header: {
      free_shipping: 'GRATIS +40€',
      fast_delivery: '24/48h',
      nav_menu: 'Menu di Navigazione',
      products: 'Prodotti',
      create_pack: 'Crea il tuo Pack',
      monthly_dose: 'Dose Mensile'
    }
  },
  pt: {
     header: {
      free_shipping: 'GRÁTIS +40€',
      fast_delivery: '24/48h',
      nav_menu: 'Menu de Navegação',
      products: 'Produtos',
      create_pack: 'Crie seu Pacote',
      monthly_dose: 'Dose Mensal'
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');

  const setLanguageCallback = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);
  
  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result: string | Translations | undefined = translations[language];

    for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
            result = result[k];
        } else {
            // Key not found, return the key itself as a fallback
            return key;
        }
    }

    return typeof result === 'string' ? result : key;
  }, [language]);


  const value = useMemo(() => ({
    language,
    setLanguage: setLanguageCallback,
    t,
  }), [language, setLanguageCallback, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Alias for useLanguage for convenience in components
export const useTranslation = useLanguage;
