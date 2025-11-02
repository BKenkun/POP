

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, CreditCard, Lock, AlertTriangle, ChevronRight, Banknote, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/language-context';

export default function PagosSegurosPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight font-bold">{t('secure_payments_page.title')}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t('secure_payments_page.subtitle')}
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Lock className="h-6 w-6 text-primary"/>
                    <span>{t('secure_payments_page.philosophy_title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    {t('secure_payments_page.philosophy_p')}
                </p>
                <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green-600"/>{t('secure_payments_page.protected_info_title')}</h3>
                    <p className="text-sm text-muted-foreground">
                       {t('secure_payments_page.protected_info_p')}
                    </p>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-primary"/>
                    <span>{t('secure_payments_page.methods_title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-muted-foreground">{t('secure_payments_page.methods_p')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <Banknote className="h-5 w-5 mt-1 text-primary"/>
                        <div>
                            <h4 className="font-semibold">{t('secure_payments_page.cod_title')}</h4>
                            <p className="text-sm text-muted-foreground">{t('secure_payments_page.cod_p')}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <Smartphone className="h-5 w-5 mt-1 text-primary"/>
                        <div>
                            <h4 className="font-semibold">{t('secure_payments_page.prepaid_title')}</h4>
                            <p className="text-sm text-muted-foreground">{t('secure_payments_page.prepaid_p')}</p>
                        </div>
                    </div>
                </div>
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('secure_payments_page.discretion_alert_title')}</AlertTitle>
                    <AlertDescription>
                        {t('secure_payments_page.discretion_alert_p')}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
        
        <div className="text-center pt-4">
            <Button asChild size="lg">
                <Link href="/products">
                    {t('secure_payments_page.explore_button')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    </div>
  );
}
