
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, BarChart2, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/language-context';

export default function PoliticaCookiesPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight font-bold">{t('cookies_page.title')}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t('cookies_page.subtitle')}
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>{t('cookies_page.what_is_title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
                <p>{t('cookies_page.what_is_p1')}</p>
                <p>{t('cookies_page.what_is_p2')}</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{t('cookies_page.types_title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1"><Shield className="h-6 w-6 text-primary"/></div>
                    <div>
                        <h3 className="font-bold text-foreground">{t('cookies_page.technical_title')}</h3>
                        <p className="text-muted-foreground">{t('cookies_page.technical_p')}</p>
                         <p className="text-sm text-foreground mt-2"><strong>{t('cookies_page.examples')}</strong> {t('cookies_page.technical_examples')}</p>
                    </div>
                </div>

                 <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1"><BarChart2 className="h-6 w-6 text-primary"/></div>
                    <div>
                        <h3 className="font-bold text-foreground">{t('cookies_page.analytics_title')}</h3>
                        <p className="text-muted-foreground">{t('cookies_page.analytics_p')}</p>
                        <p className="text-sm text-foreground mt-2"><strong>{t('cookies_page.examples')}</strong> {t('cookies_page.analytics_examples')}</p>
                    </div>
                </div>

                 <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1"><Megaphone className="h-6 w-6 text-primary"/></div>
                    <div>
                        <h3 className="font-bold text-foreground">{t('cookies_page.marketing_title')}</h3>
                        <p className="text-muted-foreground">{t('cookies_page.marketing_p')}</p>
                        <p className="text-sm text-foreground mt-2"><strong>{t('cookies_page.examples')}</strong> {t('cookies_page.marketing_examples')}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{t('cookies_page.manage_title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>{t('cookies_page.manage_p1')}</p>
                <p>{t('cookies_page.manage_p2')}</p>
                <p>{t('cookies_page.manage_p3')}</p>
            </CardContent>
        </Card>

        <div className="text-center pt-4">
            <Button asChild size="lg">
                <Link href="/products">
                    {t('terms_page.explore_button')}
                </Link>
            </Button>
        </div>
    </div>
  );
}
