
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Truck, AlertTriangle, Globe, Package, ChevronRight, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';

const domesticCarriers = [
    { name: 'Chrono Express', price: '7,90 €', time: '24 / 48 horas laborales' },
    { name: 'Colissimo (Correos Express)', price: '7,50 €', time: 'Mínimo 3 / 4 días laborales' },
];

const pickupPoints = [
     { name: 'Seur', price: '7,90 €', time: '48 / 72 horas laborales' },
];

const internationalCarriers = [
    { name: 'Chrono Express', price: '10,90 €', time: '2-4 días laborales' },
    { name: 'Colissimo (Correos Express)', price: '7,50 €', time: 'Mínimo 4 / 5 días laborales' },
];

const worldZones = [
    { zone: 'ÁFRICA', price: '32 €' },
    { zone: 'ASIA', price: '32 €' },
    { zone: 'AMÉRICA CENTRAL', price: '32 €' },
    { zone: 'AMÉRICA DEL NORTE', price: '28 €' },
    { zone: 'AMÉRICA DEL SUR', price: '32 €' },
    { zone: 'EUROPA (FUERA DE LA UE)', price: '28 €' },
    { zone: 'OCEANÍA', price: '32 €' },
    { zone: 'REINO UNIDO', price: '16 €' },
];

export default function ShippingPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">{t('shipping_page.title')}</h1>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                {t('shipping_page.subtitle')}
            </p>
        </header>

        <section aria-labelledby="shipping-policy">
            <Card>
                <CardHeader>
                    <CardTitle id="shipping-policy" className="flex items-center gap-3"><Truck className="h-6 w-6"/>{t('shipping_page.policy_title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>{t('shipping_page.policy_desc')}</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>{t('shipping_page.policy_item1')}</li>
                        <li>{t('shipping_page.policy_item2')}</li>
                        <li>{t('shipping_page.policy_item3')}</li>
                    </ul>
                </CardContent>
            </Card>
        </section>

        <div className="space-y-6">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('shipping_page.rates_alert_title')}</AlertTitle>
                <AlertDescription>
                    {t('shipping_page.rates_alert_desc')}
                </AlertDescription>
            </Alert>
            
            <section aria-labelledby="shipping-rates">
                 <Card>
                    <CardHeader>
                         <CardTitle id="shipping-rates" className="flex items-center gap-3"><MapPin className="h-6 w-6"/>{t('shipping_page.rates_title')}</CardTitle>
                        <CardDescription>{t('shipping_page.rates_subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-bold text-lg text-foreground mb-2">{t('shipping_page.domestic_title')}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{t('shipping_page.home_delivery')}</p>
                            <Table>
                                <TableHeader><TableRow><TableHead>{t('shipping_page.carrier')}</TableHead><TableHead>{t('shipping_page.rate')}</TableHead><TableHead>{t('shipping_page.delivery_time')}</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {domesticCarriers.map(c => <TableRow key={c.name}><TableCell>{c.name}</TableCell><TableCell>{c.price}</TableCell><TableCell>{c.time}</TableCell></TableRow>)}
                                </TableBody>
                            </Table>
                             <p className="text-sm text-muted-foreground mt-6 mb-4">{t('shipping_page.pickup_points')}</p>
                            <Table>
                                 <TableHeader><TableRow><TableHead>{t('shipping_page.carrier')}</TableHead><TableHead>{t('shipping_page.rate')}</TableHead><TableHead>{t('shipping_page.delivery_time')}</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {pickupPoints.map(c => <TableRow key={c.name}><TableCell>{c.name}</TableCell><TableCell>{c.price}</TableCell><TableCell>{c.time}</TableCell></TableRow>)}
                                </TableBody>
                            </Table>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-foreground mb-2">{t('shipping_page.islands_title')}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{t('shipping_page.islands_desc')}</p>
                            <Table>
                                <TableHeader><TableRow><TableHead>{t('shipping_page.carrier')}</TableHead><TableHead>{t('shipping_page.rate')}</TableHead><TableHead>{t('shipping_page.delivery_time')}</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    <TableRow><TableCell>Colissimo (Correos)</TableCell><TableCell>18€</TableCell><TableCell>Mínimo 6-8 días laborales</TableCell></TableRow>
                                    <TableRow><TableCell>Chrono Express</TableCell><TableCell>32€</TableCell><TableCell>Mínimo 3-4 días laborales</TableCell></TableRow>
                                </TableBody>
                            </Table>
                        </div>
                         <div>
                            <h3 className="font-bold text-lg text-foreground mb-2">{t('shipping_page.europe_title')}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{t('shipping_page.europe_desc')}</p>
                            <Table>
                                <TableHeader><TableRow><TableHead>{t('shipping_page.carrier')}</TableHead><TableHead>{t('shipping_page.rate')}</TableHead><TableHead>{t('shipping_page.delivery_time')}</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {internationalCarriers.map(c => <TableRow key={c.name}><TableCell>{c.name}</TableCell><TableCell>{c.price}</TableCell><TableCell>{c.time}</TableCell></TableRow>)}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section aria-labelledby="worldwide-shipping">
                <Card>
                    <CardHeader>
                        <CardTitle id="worldwide-shipping" className="flex items-center gap-3"><Globe className="h-6 w-6"/>{t('shipping_page.world_title')}</CardTitle>
                    </CardHeader>
                     <CardContent>
                        <Table>
                             <TableHeader><TableRow><TableHead>{t('shipping_page.zone')}</TableHead><TableHead className="text-right">{t('shipping_page.world_rate')}</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {worldZones.map(z => <TableRow key={z.zone}><TableCell>{z.zone}</TableCell><TableCell className="text-right">{z.price}</TableCell></TableRow>)}
                            </TableBody>
                        </Table>
                     </CardContent>
                </Card>
            </section>
        </div>

        <section aria-labelledby="additional-info">
             <Card>
                <CardHeader>
                    <CardTitle id="additional-info">{t('shipping_page.additional_info_title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <Package className="h-4 w-4" />
                        <AlertTitle>{t('shipping_page.tracking_title')}</AlertTitle>
                        <AlertDescription>
                           {t('shipping_page.tracking_desc')}
                        </AlertDescription>
                    </Alert>
                    <Alert variant="destructive">
                         <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t('shipping_page.customs_title')}</AlertTitle>
                        <AlertDescription>
                            {t('shipping_page.customs_desc')}
                        </AlertDescription>
                    </Alert>
                     <p className="text-sm text-muted-foreground pt-2">
                        {t('shipping_page.final_note')}
                    </p>
                </CardContent>
            </Card>
        </section>

         <div className="text-center pt-4">
            <Button asChild size="lg">
                <Link href="/products">
                    {t('shipping_page.explore_button')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    </div>
  );
}

    