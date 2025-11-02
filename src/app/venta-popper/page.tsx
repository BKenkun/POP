

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShoppingCart, Package, ShieldCheck, Info, ChevronRight, AlertTriangle, Truck, Rocket, Gavel } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslation } from '@/context/language-context';

const compositions = [
    {
        name: "Nitrito de Amilo",
        description: "Considerado uno de los más potentes, ofrece una acción de limpieza profunda y un aroma intenso. Ideal para un uso profesional por su alta pureza.",
        application: "Limpieza de cuero muy envejecido o curtido, ambientación de espacios grandes."
    },
    {
        name: "Nitrito de Propilo",
        description: "Más suaves y de acción rápida. Frecuentes en marcas de uso general. Buena opción para quienes buscan un resultado rápido y un aroma más ligero.",
        application: "Mantenimiento diario de cuero, limpieza de superficies delicadas."
    },
    {
        name: "Nitrito de Pentilo",
        description: "Famosos por la durabilidad de su efecto. Excelentes para fines donde se requiere un resultado sostenido y una evaporación más controlada.",
        application: "Limpieza de objetos de coleccionismo, uso en marroquinería de alta gama."
    }
];

export default function VentaPopperPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight font-bold">{t('venta_popper_page.title')}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t('venta_popper_page.subtitle')}
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="h-6 w-6"/>
                    {t('venta_popper_page.what_is_title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <h3 className="font-semibold">{t('venta_popper_page.definition_title')}</h3>
                <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('venta_popper_page.definition_p') }}></p>
                <h3 className="font-semibold">{t('venta_popper_page.uses_title')}</h3>
                <p className="text-muted-foreground">
                   {t('venta_popper_page.uses_p')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li dangerouslySetInnerHTML={{ __html: t('venta_popper_page.use_item1') }}></li>
                    <li dangerouslySetInnerHTML={{ __html: t('venta_popper_page.use_item2') }}></li>
                    <li dangerouslySetInnerHTML={{ __html: t('venta_popper_page.use_item3') }}></li>
                </ul>
            </CardContent>
        </Card>

        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('venta_popper_page.warning_title')}</AlertTitle>
            <AlertDescription>
                {t('venta_popper_page.warning_p')}
            </AlertDescription>
        </Alert>

         <Card>
            <CardHeader>
                <CardTitle>{t('venta_popper_page.variety_title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">{t('venta_popper_page.variety_p')}</p>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('venta_popper_page.table_header_variety')}</TableHead>
                                <TableHead>{t('venta_popper_page.table_header_description')}</TableHead>
                                <TableHead>{t('venta_popper_page.table_header_application')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {compositions.map((comp) => (
                                <TableRow key={comp.name}>
                                    <TableCell className="font-medium">{comp.name}</TableCell>
                                    <TableCell>{comp.name === 'Nitrito de Amilo' ? t('venta_popper_page.amyl_description') : comp.name === 'Nitrito de Propilo' ? t('venta_popper_page.propyl_description') : t('venta_popper_page.pentyl_description')}</TableCell>
                                    <TableCell>{comp.name === 'Nitrito de Amilo' ? t('venta_popper_page.amyl_application') : comp.name === 'Nitrito de Propilo' ? t('venta_popper_page.propyl_application') : t('venta_popper_page.pentyl_application')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{t('venta_popper_page.services_title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-muted-foreground">{t('venta_popper_page.services_p')}</p>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                        <Package className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold">{t('venta_popper_page.fast_shipping_title')}</h4>
                            <p className="text-sm text-muted-foreground">{t('venta_popper_page.fast_shipping_p')}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <ShieldCheck className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold">{t('venta_popper_page.legality_title')}</h4>
                            <p className="text-sm text-muted-foreground">{t('venta_popper_page.legality_p')}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Rocket className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold">{t('venta_popper_page.prices_title')}</h4>
                            <p className="text-sm text-muted-foreground">{t('venta_popper_page.prices_p')}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-6 w-6"/>
                    {t('venta_popper_page.legal_title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    {t('venta_popper_page.legal_p1')}
                </p>

                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('venta_popper_page.import_warning_title')}</AlertTitle>
                    <AlertDescription className="space-y-2">
                        <p dangerouslySetInnerHTML={{ __html: t('venta_popper_page.import_warning_use') }}></p>
                        <p dangerouslySetInnerHTML={{ __html: t('venta_popper_page.import_warning_responsibility') }}></p>
                        <p dangerouslySetInnerHTML={{ __html: t('venta_popper_page.import_warning_cancellation') }}></p>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>

        <div className="text-center pt-4">
            <Button asChild size="lg">
                <Link href="/products">
                    {t('venta_popper_page.explore_button')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    </div>
  );
}
