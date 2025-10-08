'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, ShoppingCart, Loader2, Edit, Archive, Unarchive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { cbdProducts } from '@/lib/cbd-products';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        // Simulate an async fetch, but use local data
        await new Promise(resolve => setTimeout(resolve, 500));
        setProducts(cbdProducts);
      } catch (err: any) {
        setError('Failed to load local products.');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);
  
  const handleToggleActive = (productId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, active: newStatus } : p));
    toast({
        title: `Producto ${newStatus ? 'Activado' : 'Archivado'}`,
        description: "El estado del producto ha sido actualizado (simulación).",
    });
  };

  const { activeProducts, archivedProducts } = useMemo(() => {
    return products.reduce(
        (acc, product) => {
            if (product.active === false) { // Explicitly check for false
                acc.archivedProducts.push(product);
            } else {
                acc.activeProducts.push(product);
            }
            return acc;
        },
        { activeProducts: [] as Product[], archivedProducts: [] as Product[] }
    );
  }, [products]);

  const ProductTable = ({ products, tableTitle }: { products: Product[], tableTitle: string }) => (
     <Card>
        <CardHeader>
          <CardTitle>{tableTitle}</CardTitle>
        </CardHeader>
        <CardContent>
             {products.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No hay productos en esta sección.</p>
             ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[30%]">Producto</TableHead>
                    <TableHead>SKU</TableHead>
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
                        <TableCell className="text-muted-foreground font-mono text-xs">{product.sku || 'N/A'}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={product.active !== false}
                                    onCheckedChange={(checked) => handleToggleActive(product.id, product.active !== false)}
                                    aria-label="Activar o archivar producto"
                                />
                                <Badge variant={product.active === false ? 'outline' : 'default'}>
                                    {product.active === false ? 'Archivado' : 'Activo'}
                                </Badge>
                            </div>
                        </TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>
                        <Badge 
                            variant={product.stock === undefined ? 'secondary' : (product.stock > 5 ? 'default' : (product.stock > 0 ? 'outline' : 'destructive'))}
                        >
                            {product.stock ?? 'Ilimitado'}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/products/edit/${product.id}`}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                            </Link>
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleToggleActive(product.id, product.active !== false)}>
                            {product.active !== false ? (
                                <><Archive className="mr-2 h-4 w-4" /> Archivar</>
                            ) : (
                                <><Unarchive className="mr-2 h-4 w-4" /> Desarchivar</>
                            )}
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
        </CardContent>
     </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <p className="text-muted-foreground">Añade, edita y gestiona el catálogo de tu tienda.</p>
        </div>
        <Link href="/admin/products/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-60">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center text-destructive py-8">{error}</div>
      ) : (
        <div className="space-y-8">
            <ProductTable products={activeProducts} tableTitle="Productos Activos" />
            {archivedProducts.length > 0 && (
                <>
                    <Separator />
                    <ProductTable products={archivedProducts} tableTitle="Productos Archivados" />
                </>
            )}
        </div>
      )}
    </div>
  );
}
