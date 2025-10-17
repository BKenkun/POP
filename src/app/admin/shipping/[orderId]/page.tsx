

'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ShippingClient from './shipping-client';

export default function AdminShippingDetailPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-60"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <ShippingClient />
        </Suspense>
    );
}
