
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';

export default function TerminosYCondicionesPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>{t('terms_page.title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 space-y-4">
                <p>{t('terms_page.welcome')}</p>
                <p>{t('terms_page.acceptance')}</p>

                <h3 className="font-bold text-lg text-foreground">{t('terms_page.section1_title')}</h3>
                <p dangerouslySetInnerHTML={{ __html: t('terms_page.section1_1')}}></p>
                <p dangerouslySetInnerHTML={{ __html: t('terms_page.section1_2')}}></p>
                <p dangerouslySetInnerHTML={{ __html: t('terms_page.section1_3')}}></p>
                <p dangerouslySetInnerHTML={{ __html: t('terms_page.section1_4')}}></p>

                <h3 className="font-bold text-lg text-foreground">{t('terms_page.section2_title')}</h3>
                <p>{t('terms_page.section2_p1')}</p>

                <h3 className="font-bold text-lg text-foreground">{t('terms_page.section3_title')}</h3>
                <p>{t('terms_page.section3_p1')}</p>

                <h3 className="font-bold text-lg text-foreground">{t('terms_page.section4_title')}</h3>
                <p>{t('terms_page.section4_p1')}</p>

                <h3 className="font-bold text-lg text-foreground">{t('terms_page.section5_title')}</h3>
                <p>{t('terms_page.section5_p1')}</p>

                <h3 className="font-bold text-lg text-foreground">{t('terms_page.section6_title')}</h3>
                <p>{t('terms_page.section6_p1')}</p>

                <h3 className="font-bold text-lg text-foreground">{t('terms_page.section9_title')}</h3>
                <p dangerouslySetInnerHTML={{ __html: t('terms_page.section9_1')}}></p>
                <p dangerouslySetInnerHTML={{ __html: t('terms_page.section9_2')}}></p>

                <h3 className="font-bold text-lg text-foreground">{t('terms_page.section11_title')}</h3>
                <p dangerouslySetInnerHTML={{ __html: t('terms_page.section11_1')}}></p>
                <p dangerouslySetInnerHTML={{ __html: t('terms_page.section11_2')}}></p>
                
                <h3 className="font-bold text-lg text-foreground">{t('terms_page.section12_title')}</h3>
                <p>{t('terms_page.section12_p1')}</p>

                <h3 className="font-bold text-lg text-foreground">{t('terms_page.section14_title')}</h3>
                <p dangerouslySetInnerHTML={{ __html: t('terms_page.section14_1')}}></p>
                <p dangerouslySetInnerHTML={{ __html: t('terms_page.section14_2')}}></p>

                <h3 className="font-bold text-lg text-foreground">{t('terms_page.section15_title')}</h3>
                <p dangerouslySetInnerHTML={{ __html: t('terms_page.section15_p1')}}></p>

                <h3 className="font-bold text-lg text-foreground">{t('terms_page.section16_title')}</h3>
                <p>{t('terms_page.section16_p1')}</p>
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
