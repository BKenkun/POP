
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, ShoppingCart, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { getStripeProducts } from '@/lib/stripe-actions'; // We will create this action

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const fetchedProducts = await getStripeProducts();
        setProducts(fetchedProducts);
      } catch (err: any) {
        setError(err.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <p className="text-muted-foreground">Añade, edita y gestiona el catálogo de tu tienda desde Stripe.</p>
        </div>
        <Link href="/admin/products/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Productos</CardTitle>
          <CardDescription>Esta es una lista de todos los productos actualmente en tu tienda de Stripe.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-8">{error}</div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/30" strokeWidth={1} />
              <h3 className="mt-4 text-lg font-semibold">No hay productos todavía</h3>
              <p className="text-muted-foreground">Añade tu primer producto para empezar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant={product.active ? 'default' : 'outline'}>
                        {product.active ? 'Activo' : 'Archivado'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={product.stock === undefined ? 'secondary' : (product.stock > 5 ? 'default' : (product.stock > 0 ? 'outline' : 'destructive'))}
                      >
                        {product.stock ?? 'Ilimitado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/products/edit/${product.id}`}>
                          Editar
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
