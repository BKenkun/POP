
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
        <>
            <div className={cn(
                "fixed right-6 z-50 transition-all duration-300",
                isBannerVisible ? "bottom-[72px]" : "bottom-6"
            )}>
                <div className="relative h-[130px] w-[130px]">
                    <div className="absolute top-1/2 left-0 -translate-y-1/2">
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
             <FloatingLanguageButton />
        </>
    );
}
