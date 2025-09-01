import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product } from '@/lib/types';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const hasDetails = product.productDetails && product.productDetails.length > 0;

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
          dangerouslySetInnerHTML={{ __html: product.description || '' }}
        />
      </TabsContent>
      {hasDetails && (
        <TabsContent value="details">
          <div className="prose dark:prose-invert max-w-none text-foreground/80 whitespace-pre-wrap">
            {product.productDetails}
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
