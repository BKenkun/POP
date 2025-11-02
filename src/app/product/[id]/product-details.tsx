
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/context/language-context';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { t } = useTranslation();
  const hasLongDescription = product.longDescription && product.longDescription.length > 0;
  const hasProductDetails = product.productDetails && product.productDetails.length > 0;

  // Parse the productDetails string into an array of key-value pairs
  const detailsList = hasProductDetails
    ? product.productDetails!.split('\n').map(line => {
        const parts = line.split(':');
        const key = parts[0]?.trim().replace(/,$/, ''); // Remove trailing comma if present
        const value = parts.slice(1).join(':').trim();
        return { key, value };
      }).filter(item => item.key && item.value)
    : [];

  const defaultTab = hasLongDescription ? 'description' : 'details';

  if (!hasLongDescription && !hasProductDetails) {
    return null;
  }
  
  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="mb-4">
        {hasLongDescription && <TabsTrigger value="description">{t('product_details.description_tab')}</TabsTrigger>}
        {hasProductDetails && <TabsTrigger value="details">{t('product_details.details_tab')}</TabsTrigger>}
      </TabsList>

      {hasLongDescription && (
        <TabsContent value="description">
            <Card>
                <CardContent className="p-6">
                    <div
                        className="prose dark:prose-invert max-w-none text-foreground/80"
                        dangerouslySetInnerHTML={{ __html: product.longDescription! }}
                    />
                </CardContent>
            </Card>
        </TabsContent>
      )}

      {hasProductDetails && (
          <TabsContent value="details">
            <Card>
                <CardContent className="p-6">
                    <ul className="space-y-4">
                        {detailsList.map((item, index) => (
                            <li key={index} className="flex flex-col sm:flex-row text-sm">
                                <strong className="w-full sm:w-1/4 font-semibold text-foreground">{item.key}:</strong>
                                <span className="w-full sm:w-3/4 text-muted-foreground">{item.value}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </TabsContent>
      )}
    </Tabs>
  );
}
