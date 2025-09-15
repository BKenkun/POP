
'use client';

import { usePathname } from 'next/navigation';
import FloatingAccountButton from './floating-account-button';
import FloatingCartButton from './floating-cart-button';
import FloatingCbdButton from './floating-cbd-button';

export default function FloatingActionButtons() {
    const pathname = usePathname();

    // No mostrar los botones en las rutas de administrador o checkout
    if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
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
