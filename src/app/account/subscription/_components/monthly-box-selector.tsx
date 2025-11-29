
'use client';

import { Product } from "@/lib/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Gift, Loader2, Package, Send } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getUserSelection, saveUserSelection } from "@/lib/subscription";
import { useTranslation } from "@/context/language-context";

interface MonthlyBoxSelectorProps {
    isSelectionWindowOpen: boolean;
    poppers: Product[];
    accessories: Product[];
}

interface SelectionCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    products: Product[];
    selectedProductId: string | null;
    onSelectProduct: (productId: string) => void;
    selectionType: 'popper' | 'accessory';
    popperIndex?: number;
}

const getImageUrl = (url: string) => {
    if (url.includes('firebasestorage.googleapis.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
};

const SelectionCard = ({ title, description, icon: Icon, products, selectedProductId, onSelectProduct, selectionType, popperIndex }: SelectionCardProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();
    const selectedProduct = products.find(p => p.id === selectedProductId);

    const handleSelect = (productId: string) => {
        onSelectProduct(productId);
        setIsOpen(false);
    }
    
    const cardTitle = popperIndex !== undefined ? `${title} ${popperIndex + 1}` : title;

    return (
        <Card className={cn("flex flex-col", selectedProduct && "border-green-500 border-2")}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon className="h-6 w-6 text-primary" />
                    <span>{cardTitle}</span>
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                {selectedProduct ? (
                     <div className="text-center space-y-2">
                        <div className="relative h-24 w-24 mx-auto">
                            <Image src={getImageUrl(selectedProduct.imageUrl)} alt={selectedProduct.name} fill className="object-contain" />
                        </div>
                        <p className="font-semibold">{selectedProduct.name}</p>
                        <p className="text-sm text-green-600 font-bold flex items-center justify-center gap-1">
                            <CheckCircle className="h-4 w-4"/>
                            {t('account.subscription.selected_badge')}
                        </p>
                    </div>
                ) : (
                    <p className="text-muted-foreground">{t('account.subscription.not_chosen_yet')}</p>
                )}
            </CardContent>
            <CardFooter>
                 <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">{selectedProduct ? t('account.subscription.change_selection_button') : t('account.subscription.choose_product_button')}</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>{t('account.subscription.select_dialog_title', { type: selectionType === 'popper' ? t('account.subscription.popper') : t('account.subscription.accessory') })}</DialogTitle>
                        </DialogHeader>
                        <div className="overflow-y-auto pr-2 -mr-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product}>
                                        <div className="p-4 pt-0">
                                            <Button className="w-full" onClick={() => handleSelect(product.id)}>
                                                {t('account.subscription.select_button')}
                                            </Button>
                                        </div>
                                    </ProductCard>
                                ))}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    )
}

export default function MonthlyBoxSelector({ isSelectionWindowOpen, poppers, accessories }: MonthlyBoxSelectorProps) {
    const { toast } = useToast();
    const { t } = useTranslation();
    const [selectedPoppers, setSelectedPoppers] = useState<(string | null)[]>(Array(5).fill(null));
    const [selectedAccessory, setSelectedAccessory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    useEffect(() => {
        const loadSelection = async () => {
            setLoading(true);
            const savedSelection = await getUserSelection();
            if (savedSelection) {
                setSelectedPoppers(savedSelection.poppers);
                setSelectedAccessory(savedSelection.accessory);
            }
            setLoading(false);
        };
        loadSelection();
    }, []);

    const handlePopperSelect = (productId: string, index: number) => {
        const newSelection = [...selectedPoppers];
        newSelection[index] = productId;
        setSelectedPoppers(newSelection);
    }
    
    const handleAccessorySelect = (productId: string) => {
        setSelectedAccessory(productId);
    }

    const handleConfirmSelection = async () => {
        setSaving(true);
        try {
            await saveUserSelection({
                poppers: selectedPoppers,
                accessory: selectedAccessory,
            });
            toast({
                title: t('account.subscription.save_success_title'),
                description: t('account.subscription.save_success_desc')
            });
        } catch (error) {
            console.error("Error saving selection", error);
            toast({
                title: t('account.subscription.error_title'),
                description: t('account.subscription.save_error_desc'),
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    }

    const isSelectionComplete = selectedPoppers.every(p => p !== null) && selectedAccessory !== null;

    if (!isSelectionWindowOpen) {
        return (
             <Card className="text-center border-accent bg-accent/10 py-12">
                <CardHeader>
                    <div className="mx-auto bg-accent/20 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                        <Send className="h-8 w-8 text-accent-foreground" />
                    </div>
                    <CardTitle className="text-2xl text-accent-foreground">{t('account.subscription.box_on_its_way_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        {t('account.subscription.box_on_its_way_desc')}
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-60">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedPoppers.map((popperId, index) => (
                     <SelectionCard 
                        key={index}
                        title={t('account.subscription.popper')}
                        popperIndex={index}
                        description={t('account.subscription.popper_desc')}
                        icon={Package}
                        products={poppers}
                        selectedProductId={popperId}
                        onSelectProduct={(productId) => handlePopperSelect(productId, index)}
                        selectionType="popper"
                    />
                ))}
               
                <SelectionCard 
                    title={t('account.subscription.accessory')}
                    description={t('account.subscription.accessory_desc')}
                    icon={Package}
                    products={accessories}
                    selectedProductId={selectedAccessory}
                    onSelectProduct={handleAccessorySelect}
                    selectionType="accessory"
                />

                <Card className="bg-primary/10 border-primary border-dashed flex flex-col items-center justify-center text-center">
                    <CardHeader>
                        <div className="mx-auto bg-primary/20 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                             <Gift className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle>{t('account.subscription.surprise_gift_title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{t('account.subscription.surprise_gift_desc')}</p>
                    </CardContent>
                </Card>
            </div>
            
             <div className="text-center pt-4">
                <Button size="lg" onClick={handleConfirmSelection} disabled={!isSelectionComplete || saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('account.subscription.confirm_selection_button')}
                </Button>
            </div>
        </div>
    )
}
