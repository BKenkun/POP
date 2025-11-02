

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HelpCircle, Eye, HeartPulse, ShieldCheck, Info, ChevronRight, AlertTriangle, Syringe, Skull, BrainCircuit, Droplets } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/language-context';

export default function PopperInfoPage() {
  const { t } = useTranslation();

  const effectsList = [
      t('popper_info_page.effect1'),
      t('popper_info_page.effect2'),
      t('popper_info_page.effect3'),
      t('popper_info_page.effect4'),
      t('popper_info_page.effect5'),
      t('popper_info_page.effect6'),
      t('popper_info_page.effect7')
  ];

  const longTermEffects = [
      t('popper_info_page.long_term1'),
      t('popper_info_page.long_term2'),
      t('popper_info_page.long_term3'),
      t('popper_info_page.long_term4'),
      t('popper_info_page.long_term5')
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight font-bold">{t('popper_info_page.title')}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t('popper_info_page.subtitle')}
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-6 w-6 text-primary"/>
                    <span>{t('popper_info_page.what_is_title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('popper_info_page.what_is_p1') }}></p>
                <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('popper_info_page.what_is_p2') }}></p>
                <Alert>
                    <Droplets className="h-4 w-4"/>
                    <AlertTitle>{t('popper_info_page.types_alert_title')}</AlertTitle>
                    <AlertDescription>
                        {t('popper_info_page.types_alert_p')}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Eye className="h-6 w-6 text-primary"/>
                    <span>{t('popper_info_page.form_title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    {t('popper_info_page.form_p1')}
                </p>
                <p className="text-muted-foreground">
                    {t('popper_info_page.form_p2')}
                </p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HeartPulse className="h-6 w-6 text-primary"/>
                    <span>{t('popper_info_page.effects_title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className='text-muted-foreground' dangerouslySetInnerHTML={{ __html: t('popper_info_page.effects_p') }}></p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {effectsList.map((effect, index) => (
                        <li key={index}>{effect}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-6 w-6 text-primary"/>
                    <span>{t('popper_info_page.addiction_title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className='text-muted-foreground' dangerouslySetInnerHTML={{ __html: t('popper_info_page.addiction_p') }}>
                </p>
            </CardContent>
        </Card>

        <Alert variant="destructive">
            <Skull className="h-4 w-4" />
            <AlertTitle>{t('popper_info_page.safety_warning_title')}</AlertTitle>
            <AlertDescription className="space-y-3 mt-2">
                 <p dangerouslySetInnerHTML={{ __html: t('popper_info_page.safety_warning1') }}></p>
                 <p dangerouslySetInnerHTML={{ __html: t('popper_info_page.safety_warning2') }}></p>
                 <p dangerouslySetInnerHTML={{ __html: t('popper_info_page.safety_warning3') }}></p>
            </AlertDescription>
        </Alert>

        <Card>
            <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <Syringe className="h-6 w-6 text-primary"/>
                    <span>{t('popper_info_page.mixing_title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('popper_info_page.mixing_viagra_title')}</AlertTitle>
                    <AlertDescription>
                        {t('popper_info_page.mixing_viagra_p')}
                    </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('popper_info_page.mixing_speed_title')}</AlertTitle>
                    <AlertDescription>
                        {t('popper_info_page.mixing_speed_p')}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-primary"/>
                    <span>{t('popper_info_page.long_term_title')}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">{t('popper_info_page.long_term_p')}</p>
                 <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {longTermEffects.map((effect, index) => (
                        <li key={index}>{effect}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>
        
        <div className="text-center pt-4">
            <Button asChild size="lg">
                <Link href="/products">
                    {t('popper_info_page.explore_button')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    </div>
  );
}

    
