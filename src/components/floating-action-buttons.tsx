
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
        <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
            <FloatingCbdButton />
            <div className="flex flex-col gap-3">
                <FloatingAccountButton />
                <FloatingCartButton />
            </div>
        </div>
    );
}
