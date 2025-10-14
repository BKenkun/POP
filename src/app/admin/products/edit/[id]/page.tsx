
'use client';

import { useState } from 'react';
import ProductForm from '../../_components/product-form';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function EditProductPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const firestore = useFirestore();
  const [isSaving, setIsSaving] = useState(false);

  // Use useMemoFirebase to prevent re-renders from creating a new doc reference
  const productDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'products', id);
  }, [firestore, id]);
  
  const { data: product, isLoading, error } = useDoc<Product>(productDocRef);

  const handleSave = async (data: Product) => {
    if (!productDocRef) return;
    setIsSaving(true);
    try {
        // We shouldn't update the ID, so we destructure it out.
        const { id, ...productData } = data;
        await updateDoc(productDocRef, { ...productData });
        toast({
            title: 'Producto Actualizado',
            description: `Los cambios en "${data.name}" han sido guardados en la base de datos.`,
        });
        router.push('/admin/products');
    } catch (err) {
        console.error("Error updating product:", err);
        toast({
            title: 'Error',
            description: 'No se pudo actualizar el producto.',
            variant: 'destructive',
        });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
       <div className="flex items-center justify-center h-60">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
         <p className="ml-4 text-muted-foreground">Cargando datos del producto...</p>
       </div>
    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-lg text-center border-destructive">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle>Error al Cargar el Producto</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No hemos podido cargar los datos de este producto. Esto puede deberse a un problema de permisos o de red.</p>
                    <pre className="mt-4 w-full whitespace-pre-wrap rounded-md bg-secondary p-4 text-left text-xs text-secondary-foreground">
                        <code>{error.message}</code>
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!isLoading && !product) {
      notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Producto</h1>
      <ProductForm product={product!} onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}
