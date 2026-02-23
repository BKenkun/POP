"use client";

import { usePathname } from 'next/navigation';
import FloatingCartButton from './floating-cart-button';
import FloatingCbdButton from './floating-cbd-button';
import FloatingAccountButton from './floating-account-button';
import FloatingLeftButtons from './floating-left-buttons';

export default function FloatingActionButtons() {
    const pathname = usePathname();

    if (pathname.startsWith('/admin') || pathname.startsWith('/checkout') || pathname.startsWith('/verify')) {
        return null;
    }

    return (
        <>
            <div className="fixed right-6 bottom-6 z-50">
                <div className="relative h-[120px] w-[120px]">
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
             <FloatingLeftButtons />
        </>
    );
}
