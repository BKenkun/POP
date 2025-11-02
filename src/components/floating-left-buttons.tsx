
"use client";

import { usePathname } from 'next/navigation';
import { useCookieConsent } from '@/context/cookie-context';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import FloatingLanguageButton from './floating-language-button';
import WelcomePopupLoader from './welcome-popup-loader';
import { useToast } from '@/hooks/use-toast';

export default function FloatingLeftButtons() {
    const pathname = usePathname();
    const { consent } = useCookieConsent();
    const { toasts } = useToast();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (pathname.startsWith('/admin') || pathname.startsWith('/checkout') || pathname.startsWith('/verify')) {
        return null;
    }

    const isBannerVisible = isClient && !consent.necessary;
    const areToastsVisible = toasts.length > 0;

    return (
        <div className={cn(
            "fixed left-6 z-40 flex flex-col items-center gap-4 transition-all duration-300",
            isBannerVisible ? "bottom-[72px]" : "bottom-6"
        )}>
            <div className={cn("transition-opacity duration-300", areToastsVisible && "opacity-0 invisible")}>
                <WelcomePopupLoader />
            </div>
            <div className={cn("transition-opacity duration-300", areToastsVisible && "opacity-0 invisible")}>
                 <FloatingLanguageButton />
            </div>
        </div>
    );
}
