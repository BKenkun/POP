
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
            {/* 
              Contenedor relativo para posicionar los botones.
              Las dimensiones (h-36 w-32) definen el "lienzo" sobre el que se colocan los botones.
              Aumentamos la altura para separar los botones de la derecha y reducimos el ancho para acercar el de la izquierda.
            */}
            <div className="relative h-36 w-32">
                {/* Botón de CBD (punta izquierda del triángulo) */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2">
                    <FloatingCbdButton />
                </div>

                {/* Botón de Cuenta (esquina superior derecha) */}
                <div className="absolute top-0 right-0">
                    <FloatingAccountButton />
                </div>

                {/* Botón de Carrito (esquina inferior derecha) */}
                <div className="absolute bottom-0 right-0">
                    <FloatingCartButton />
                </div>

                {/* Botón de Idioma (posición central-inferior, más cerca del grupo) */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                    <FloatingLanguageButton />
                </div>
            </div>
        </div>
    );
}
