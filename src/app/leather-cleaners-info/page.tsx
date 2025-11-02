
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, Info, Gavel, AlertTriangle, UserCheck, Package, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/language-context';

export default function LeatherCleanersInfoPage() {
    const { t } = useTranslation();
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight font-bold">{t('leather_cleaners_page.title')}</h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    {t('leather_cleaners_page.subtitle')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-6 w-6 text-primary"/>
                        <span>{t('leather_cleaners_page.philosophy_title')}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        {t('leather_cleaners_page.philosophy_p1')}
                    </p>
                    <p className="text-muted-foreground">
                        {t('leather_cleaners_page.philosophy_p2')}
                    </p>
                    <Alert>
                        <ShieldCheck className="h-4 w-4"/>
                        <AlertTitle>{t('leather_cleaners_page.quality_alert_title')}</AlertTitle>
                        <AlertDescription>
                            {t('leather_cleaners_page.quality_alert_p')}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('leather_cleaners_page.recreational_use_alert_title')}</AlertTitle>
                <AlertDescription>
                    {t('leather_cleaners_page.recreational_use_alert_p')}
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-6 w-6 text-primary"/>
                        <span>{t('leather_cleaners_page.commitment_title')}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{t('leather_cleaners_page.commitment_p')}</p>
                    <ul className="list-disc list-inside space-y-3 text-muted-foreground">
                        <li>{t('leather_cleaners_page.commitment_item1')}</li>
                        <li>{t('leather_cleaners_page.commitment_item2')}</li>
                        <li dangerouslySetInnerHTML={{ __html: t('leather_cleaners_page.commitment_item3') }}></li>
                        <li>{t('leather_cleaners_page.commitment_item4')}</li>
                    </ul>
                    <p className="text-sm text-muted-foreground pt-2">
                       {t('leather_cleaners_page.commitment_p2')}
                    </p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gavel className="h-6 w-6 text-primary"/>
                        <span>{t('leather_cleaners_page.policy_title')}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                        <Package className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold">{t('leather_cleaners_page.logistics_title')}</h4>
                            <p className="text-sm text-muted-foreground">{t('leather_cleaners_page.logistics_p')}</p>
                        </div>
                    </div>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t('leather_cleaners_page.cancellation_alert_title')}</AlertTitle>
                        <AlertDescription className="space-y-2 mt-2">
                            <p>{t('leather_cleaners_page.cancellation_alert_p1')}</p>
                            <p>{t('leather_cleaners_page.cancellation_alert_p2')}</p>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <div className="text-center pt-4">
                <Button asChild size="lg">
                    <Link href="/products">
                        {t('leather_cleaners_page.explore_button')}
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
