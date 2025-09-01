import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Product } from '@/lib/types';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const hasDetails = product.productDetails && Object.keys(product.productDetails).length > 0;

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
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableBody>
                {Object.entries(product.productDetails!).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="font-semibold bg-muted/40 w-1/4">
                      {key}
                    </TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
