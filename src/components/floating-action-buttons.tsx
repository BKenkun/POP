
'use client';

import { usePathname } from 'next/navigation';
import FloatingAccountButton from './floating-account-button';
import FloatingCartButton from './floating-cart-button';
import FloatingCbdButton from './floating-cbd-button';
import { useCookieConsent } from '@/context/cookie-context';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function FloatingActionButtons() {
    const pathname = usePathname();
    const { consent } = useCookieConsent();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // No mostrar los botones en las rutas de administrador o checkout
    if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) {
        return null;
    }

    // El banner se muestra si el consentimiento necesario no ha sido dado.
    const isBannerVisible = isClient && !consent.necessary;

    return (
        <div className={cn(
            "fixed right-6 z-50 transition-all duration-300",
            isBannerVisible ? "bottom-[72px]" : "bottom-6"
        )}>
            <div className="relative h-[124px] w-[124px]">
                <div className="absolute top-1/2 -translate-y-1/2 left-0">
                    <FloatingCbdButton />
                </div>
                <div className="absolute top-0 right-0">
                    <FloatingAccountButton />
                </div>
                <div className="absolute bottom-0 right-0">
                    <FloatingCartButton />
                </div>
            </div>
        </div>
    );
}
