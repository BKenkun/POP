
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/language-context';

export default function InformacionLegalPage() {
  const { t } = useTranslation();

  const legalInfo = [
    { label: t('legal_info.owner_label'), value: 'MARY AND POPPER' },
    { label: t('legal_info.abn_label'), value: 'Australian Business Number (ABN) 37 588 057 135' },
    { label: t('legal_info.address_label'), value: 'U 2 58 MAIN ST, OSBORNE PARK WA 6017, AUSTRALIA' },
    { label: t('legal_info.contact_label'), value: 'info@comprarpopperonline.com' },
    { label: t('legal_info.logistics_label'), value: t('legal_info.logistics_value') },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>{t('legal_info.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <dl className="space-y-4">
                    {legalInfo.map((info) => (
                        <div key={info.label} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
                            <dt className="font-semibold text-foreground">{info.label}</dt>
                            <dd className="md:col-span-2 text-muted-foreground">{info.value}</dd>
                        </div>
                    ))}
                </dl>
            </CardContent>
        </Card>

        <div className="space-y-6">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('legal_info.usage_warning_title')}</AlertTitle>
                <AlertDescription>
                    {t('legal_info.usage_warning_desc')}
                </AlertDescription>
            </Alert>

            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('legal_info.cancellation_right_title')}</AlertTitle>
                <AlertDescription>
                    {t('legal_info.cancellation_right_desc')}
                </AlertDescription>
            </Alert>
        </div>
         <div className="text-center pt-4">
            <Button asChild size="lg">
                <Link href="/products">
                    {t('legal_info.explore_button')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    </div>
  );
}
