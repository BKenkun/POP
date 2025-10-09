'use client';

import { useAdminAuth } from '@/context/admin-auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function PositivePage() {
    const { isAuthenticated, loading } = useAdminAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace('/verify');
        }
    }, [isAuthenticated, loading, router]);

    if (loading || !isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted/40">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Card className="w-full max-w-sm text-center">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                        <ShieldCheck className="h-10 w-10 text-green-500 dark:text-green-400" />
                    </div>
                    <CardTitle>Acceso Autorizado</CardTitle>
                    <CardDescription>Has sido verificado correctamente.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild size="lg" className="w-full">
                        <Link href="/admin">
                            Ir al Panel de Administrador
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
