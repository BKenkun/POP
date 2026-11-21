'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { AlertTriangle, Home, Phone } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';

export default function SubscriptionFailedPage() {
    const { user } = useAuth();
    const { t } = useTranslation();

    return (
         <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
            <Card className="w-full max-w-lg border-destructive">
                <CardHeader className="items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle className="text-3xl font-headline text-destructive font-bold">{t('account.subscription.failed_title')}</CardTitle>
                    <CardDescription className="text-lg text-foreground/80">
                        {t('account.subscription.failed_subtitle', { name: user?.email?.split('@')[0] || t('account.subscription.user_placeholder') })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                       {t('account.subscription.failed_desc')}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                        <Button asChild size="lg" variant="default">
                            <Link href="/subscription">
                                {t('account.subscription.retry_button')}
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                             <Link href="/contacto">
                                <Phone className="mr-2" />
                                {t('account.subscription.contact_support_button')}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
