
'use client';

// This page is no longer used for displaying order success.
// The logic has been moved to a toast notification in checkout-client-page.tsx.
// This component can be safely removed in a future cleanup.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DeprecatedCheckoutSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the home page immediately as this page is no longer in use.
        router.replace('/');
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
                Redirigiendo...
            </p>
        </div>
    );
}
    
