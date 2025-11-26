'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { AlertTriangle, Home, Phone } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

export default function SubscriptionPartialPaymentPage() {
    const { t } = useTranslation();
    return (
         <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
            <Card className="w-full max-w-lg border-amber-500">
                <CardHeader className="items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                        <AlertTriangle className="h-10 w-10 text-amber-600" />
                    </div>
                    <CardTitle className="text-3xl font-headline text-amber-600 font-bold">{t('account.subscription.partial_title')}</CardTitle>
                    <CardDescription className="text-lg text-foreground/80">
                       {t('account.subscription.partial_subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                      {t('account.subscription.partial_desc')}
                    </p>
                    <div className="flex justify-center pt-2">
                        <Button asChild size="lg" variant="default">
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
