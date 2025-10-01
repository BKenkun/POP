
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentContextType {
  consent: ConsentState;
  setConsent: (newConsent: ConsentState) => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const COOKIE_CONSENT_KEY = 'popper_cookie_consent';

export const CookieProvider = ({ children }: { children: ReactNode }) => {
  const [consent, setConsentState] = useState<ConsentState>({
    necessary: false, // Default to false until we check localStorage
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    try {
      const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (storedConsent) {
        const parsedConsent: ConsentState = JSON.parse(storedConsent);
        // Ensure necessary is always true if consent has been given before
        if(parsedConsent.necessary || parsedConsent.analytics || parsedConsent.marketing) {
            parsedConsent.necessary = true;
        }
        setConsentState(parsedConsent);
      }
    } catch (e) {
      console.error("Could not parse cookie consent from localStorage", e);
    }
  }, []);

  const setConsent = (newConsent: ConsentState) => {
    try {
      // Ensure 'necessary' is always true if any consent is given
      const finalConsent = { ...newConsent, necessary: true };
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(finalConsent));
      setConsentState(finalConsent);
    } catch (e) {
        console.error("Could not save cookie consent to localStorage", e);
    }
  };

  return (
    <CookieConsentContext.Provider value={{ consent, setConsent }}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieProvider');
  }
  return context;
};
