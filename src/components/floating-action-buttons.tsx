"use client";

import { usePathname } from 'next/navigation';
import FloatingCartButton from './floating-cart-button';
import FloatingCbdButton from './floating-cbd-button';
import FloatingAccountButton from './floating-account-button';
import { useCookieConsent } from '@/context/cookie-context';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import FloatingLanguageButton from './floating-language-button';

export default function FloatingActionButtons() {
    const pathname = usePathname();
    const { consent } = useCookieConsent();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (pathname.startsWith('/admin') || pathname.startsWith('/checkout') || pathname.startsWith('/verify')) {
        return null;
    }

    const isBannerVisible = isClient && !consent.necessary;

    return (
        <div className={cn(
            "fixed right-6 z-50 transition-all duration-300",
            isBannerVisible ? "bottom-[72px]" : "bottom-6"
        )}>
            {/* Contenedor relativo para posicionar los botones en un diseño personalizado */}
            <div className="relative h-48 w-48">
                {/* Botón de Cuenta (arriba a la derecha) */}
                <div className="absolute top-0 right-0">
                    <FloatingAccountButton />
                </div>
                
                {/* Botón de CBD (centro a la izquierda) */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2">
                    <FloatingCbdButton />
                </div>

                {/* Botón de Carrito (abajo a la derecha) */}
                <div className="absolute bottom-0 right-0">
                    <FloatingCartButton />
                </div>

                {/* Botón de Idioma (posición intermedia) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <FloatingLanguageButton />
                </div>
            </div>
        </div>
    );
}
