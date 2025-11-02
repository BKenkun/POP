
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Database, BarChart2, Mail, CreditCard, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/language-context';

export default function PrivacidadPage() {
    const { t } = useTranslation();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight font-bold">{t('privacy_page.title')}</h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    {t('privacy_page.subtitle')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-6 w-6 text-primary"/><span>{t('privacy_page.commitment_title')}</span></CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 space-y-4">
                    <p>{t('privacy_page.commitment_p1')}</p>
                    <p>{t('privacy_page.commitment_p2')}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('privacy_page.who_is_responsible_title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p dangerouslySetInnerHTML={{ __html: t('privacy_page.who_is_responsible_p') }}></p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('privacy_page.what_data_title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-2">
                    <p>{t('privacy_page.what_data_p')}</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_page.what_data_item1') }}></li>
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_page.what_data_item2') }}></li>
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_page.what_data_item3') }}></li>
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_page.what_data_item4') }}></li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('privacy_page.what_for_title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-3">
                    <p>{t('privacy_page.what_for_p1')}</p>
                    <p>{t('privacy_page.what_for_p2')}</p>
                    <p>{t('privacy_page.what_for_p3')}</p>
                    <p>{t('privacy_page.what_for_p4')}</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('privacy_page.share_data_title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-4">
                    <p>{t('privacy_page.share_data_p')}</p>
                    <div className="space-y-4">
                        <Alert>
                            <CreditCard className="h-4 w-4" />
                            <AlertTitle>{t('privacy_page.stripe_title')}</AlertTitle>
                            <AlertDescription>
                                {t('privacy_page.stripe_p')}
                            </AlertDescription>
                        </Alert>
                        <Alert>
                            <Mail className="h-4 w-4" />
                            <AlertTitle>{t('privacy_page.klaviyo_title')}</AlertTitle>
                            <AlertDescription>
                                {t('privacy_page.klaviyo_p')}
                            </AlertDescription>
                        </Alert>
                        <Alert>
                            <Database className="h-4 w-4" />
                            <AlertTitle>{t('privacy_page.firebase_title')}</AlertTitle>
                            <AlertDescription>
                                {t('privacy_page.firebase_p')}
                            </AlertDescription>
                        </Alert>
                        <Alert>
                            <BarChart2 className="h-4 w-4" />
                            <AlertTitle>{t('privacy_page.clarity_title')}</AlertTitle>
                            <AlertDescription>
                                {t('privacy_page.clarity_p')}
                            </AlertDescription>
                        </Alert>
                    </div>
                    <p className="pt-4">{t('privacy_page.share_data_p2')}</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('privacy_page.your_rights_title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-2">
                    <p>{t('privacy_page.your_rights_p')}</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_page.your_rights_item1') }}></li>
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_page.your_rights_item2') }}></li>
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_page.your_rights_item3') }}></li>
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_page.your_rights_item4') }}></li>
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_page.your_rights_item5') }}></li>
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_page.your_rights_item6') }}></li>
                    </ul>
                    <p className="pt-2" dangerouslySetInnerHTML={{ __html: t('privacy_page.your_rights_p2') }}></p>
                </CardContent>
            </Card>

            <div className="text-center pt-4">
                <Button asChild size="lg">
                    <Link href="/products">
                        {t('privacy_page.explore_button')}
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
