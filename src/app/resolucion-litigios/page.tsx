
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Gavel, AlertTriangle, FileText, ExternalLink, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/language-context';

export default function ResolucionLitigiosPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight font-bold">{t('terms_page.section14_title')}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t('disputes_page.subtitle')}
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary"/>
                    <span>{t('disputes_page.right_of_withdrawal_title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p dangerouslySetInnerHTML={{ __html: t('disputes_page.right_of_withdrawal_p1') }}></p>
                <p dangerouslySetInnerHTML={{ __html: t('disputes_page.right_of_withdrawal_p2') }}></p>
                 <p dangerouslySetInnerHTML={{ __html: t('disputes_page.right_of_withdrawal_p3') }}></p>
                <p dangerouslySetInnerHTML={{ __html: t('disputes_page.right_of_withdrawal_p4') }}></p>
            </CardContent>
        </Card>

        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('disputes_page.exclusion_title')}</AlertTitle>
            <AlertDescription>
                <p className="font-semibold mt-2">{t('disputes_page.exclusion_p1')}</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li dangerouslySetInnerHTML={{ __html: t('disputes_page.exclusion_item1') }}></li>
                    <li dangerouslySetInnerHTML={{ __html: t('disputes_page.exclusion_item2') }}></li>
                    <li dangerouslySetInnerHTML={{ __html: t('disputes_page.exclusion_item3') }}></li>
                    <li dangerouslySetInnerHTML={{ __html: t('disputes_page.exclusion_item4') }}></li>
                </ul>
            </AlertDescription>
        </Alert>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-6 w-6 text-primary"/>
                    <span>{t('disputes_page.law_title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p dangerouslySetInnerHTML={{ __html: t('disputes_page.law_p1') }}></p>
                
                <h3 className="font-bold text-foreground pt-4">{t('disputes_page.adr_title')}</h3>
                <p>{t('disputes_page.adr_p1')}</p>
                <p>{t('disputes_page.adr_p2')}</p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                     <Button asChild variant="outline">
                        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2"/>
                            {t('disputes_page.odr_platform_button')}
                        </a>
                    </Button>
                    <Button asChild variant="outline">
                        <a href="https://www.mediation-conso.fr" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2"/>
                             {t('disputes_page.mediators_button')}
                        </a>
                    </Button>
                </div>

                <h3 className="font-bold text-foreground pt-4">{t('disputes_page.mediation_steps_title')}</h3>
                 <ol className="list-decimal list-inside space-y-2">
                    <li>{t('disputes_page.mediation_step1')}</li>
                    <li>{t('disputes_page.mediation_step2')}</li>
                    <li>{t('disputes_page.mediation_step3')}</li>
                </ol>
                <p dangerouslySetInnerHTML={{ __html: t('disputes_page.mediation_p_final') }}></p>

            </CardContent>
        </Card>
        
        <div className="text-center pt-4">
            <Button asChild size="lg">
                <Link href="/products">
                    {t('terms_page.explore_button')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    </div>
  );
}
