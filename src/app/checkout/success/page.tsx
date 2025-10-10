
import { Suspense } from 'react';
import SuccessContent from './success-content';
import { Skeleton } from '@/components/ui/skeleton';

function CheckoutSuccessSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-8">
            <Skeleton className="w-full max-w-lg h-[400px]" />
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<CheckoutSuccessSkeleton />}>
            <SuccessContent />
        </Suspense>
    );
}
