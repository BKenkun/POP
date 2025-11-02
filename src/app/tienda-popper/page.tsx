
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, Star, HelpCircle, Package, ShieldCheck, Truck, Phone, Mail, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { cbdProducts } from '@/lib/cbd-products';
import { useTranslation } from '@/context/language-context';

// Revalidate every time to get a new random list
export const revalidate = 0; 

// Function to shuffle an array and take the first N items
const getShuffledItems = (array: Product[], numItems: number): Product[] => {
    if (!array || array.length === 0) return [];
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numItems);
};


export default function TiendaPopperPage() {
    const { t } = useTranslation();
    let allProducts = cbdProducts;
    
    const randomProducts = getShuffledItems(allProducts, 6);

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
                <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
                    {t('popper_shop_page.subtitle')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Users className="h-7 w-7 text-primary"/>
                        <span>{t('popper_shop_page.who_we_are_title')}</span>
                    </CardTitle>
                    <CardDescription>{t('popper_shop_page.who_we_are_subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>{t('popper_shop_page.who_we_are_p')}</p>
                    <Alert>
                        <Star className="h-4 w-4"/>
                        <AlertTitle>{t('popper_shop_page.quality_alert_title')}</AlertTitle>
                        <AlertDescription>{t('popper_shop_page.quality_alert_p')}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <HelpCircle className="h-7 w-7 text-primary"/>
                        <span>{t('popper_shop_page.how_to_buy_title')}</span>
                    </CardTitle>
                    <CardDescription>{t('popper_shop_page.how_to_buy_subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-bold text-lg text-foreground mb-2">{t('popper_shop_page.propyl_title')}</h3>
                        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('popper_shop_page.propyl_p') }}></p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-foreground mb-2">{t('popper_shop_page.amyl_title')}</h3>
                        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('popper_shop_page.amyl_p') }}></p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-foreground mb-2">{t('popper_shop_page.pentyl_title')}</h3>
                        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('popper_shop_page.pentyl_p') }}></p>
                    </div>
                </CardContent>
            </Card>
            
            {randomProducts.length > 0 && (
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-primary">{t('popper_shop_page.best_brands_title')}</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {randomProducts.map(product => (
                            <Button key={product.id} variant="secondary" asChild>
                                <Link href={`/product/${product.id}`}>{product.name}</Link>
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Truck className="h-7 w-7 text-primary"/>
                        <span>{t('popper_shop_page.shipping_title')}</span>
                    </CardTitle>
                    <CardDescription>{t('popper_shop_page.shipping_subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4">
                            <Package className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-semibold text-foreground">{t('popper_shop_page.fast_shipping_title')}</h4>
                                <p className="text-sm text-muted-foreground">{t('popper_shop_page.fast_shipping_p')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <ShieldCheck className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-semibold text-foreground">{t('popper_shop_page.secure_payment_title')}</h4>
                                <p className="text-sm text-muted-foreground">{t('popper_shop_page.secure_payment_p')}</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center pt-2">{t('popper_shop_page.payment_methods_p')}</p>
                </CardContent>
            </Card>
            
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>{t('popper_shop_page.doubts_title')}</CardTitle>
                    <CardDescription>{t('popper_shop_page.doubts_subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row justify-center items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary"/>
                        <a href="mailto:info@comprarpopperonline.com" className="font-semibold hover:text-primary">{t('popper_shop_page.contact_email')}</a>
                    </div>
                </CardContent>
            </Card>
            
            <div className="text-center pt-4">
                <Button asChild size="lg">
                    <Link href="/products">
                        {t('popper_shop_page.explore_button')}
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
