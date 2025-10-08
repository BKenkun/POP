
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, ShoppingCart, Loader2, Edit, Archive, ArchiveRestore, MoreHorizontal, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { cbdProducts } from '@/lib/cbd-products';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  
  const handleToggleActive = (productId: string) => {
    setProducts(prev => prev.map(p => {
        if (p.id === productId) {
            const newStatus = p.active === false; // Toggle the status
            toast({
                title: `Producto ${newStatus ? 'Activado' : 'Archivado'}`,
                description: `"${p.name}" ha sido movido a la sección correspondiente (simulación).`,
            });
            return { ...p, active: newStatus };
        }
        return p;
    }));
  };

  const handleDelete = (productId: string, productName: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({
        title: "Producto Eliminado (Simulación)",
        description: `El producto "${productName}" ha sido eliminado.`,
        variant: "destructive",
    });
  }

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
                                    onCheckedChange={() => handleToggleActive(product.id)}
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
                        <TableCell className="text-right">
                           <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menú</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                             <Link href={`/admin/products/edit/${product.id}`}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Editar</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleToggleActive(product.id)}>
                                            {product.active !== false ? (
                                                <><Archive className="mr-2 h-4 w-4" /><span>Archivar</span></>
                                            ) : (
                                                <><ArchiveRestore className="mr-2 h-4 w-4" /><span>Desarchivar</span></>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                         <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Eliminar</span>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Esto eliminará permanentemente el producto (simulación).
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(product.id, product.name)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                            Sí, eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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
