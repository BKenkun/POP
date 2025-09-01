
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const hasDetails = product.productDetails && product.productDetails.length > 0;

  // Clean the long description to prevent hydration errors
  const cleanedLongDescription = product.longDescription
    ? product.longDescription.replace(/\s+/g, ' ').trim()
    : null;
    
  const descriptionContent = cleanedLongDescription || product.description || '';

  // Parse the productDetails string into an array of key-value pairs
  const detailsList = hasDetails
    ? product.productDetails!.split('\n').map(line => {
        const parts = line.split(':');
        const key = parts[0]?.trim().replace(/,$/, ''); // Remove trailing comma if present
        const value = parts.slice(1).join(':').trim();
        return { key, value };
      }).filter(item => item.key && item.value)
    : [];

  return (
    <Tabs defaultValue="description">
      <TabsList className="mb-4">
        <TabsTrigger value="description">Descripción</TabsTrigger>
        {hasDetails && (
          <TabsTrigger value="details">Detalles del producto</TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="description">
        <div
          className="prose dark:prose-invert max-w-none text-foreground/80"
          dangerouslySetInnerHTML={{ __html: descriptionContent }}
        />
      </TabsContent>
      {hasDetails && (
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
