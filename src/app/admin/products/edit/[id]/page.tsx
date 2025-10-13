'use client';

import { useState } from 'react';
import ProductForm from '../../_components/product-form';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

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
        await updateDoc(productDocRef, { ...data });
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

  // Show a loading state while fetching data
  if (isLoading) {
    return (
       <div className="flex items-center justify-center h-40">
         <Loader2 className="h-8 w-8 animate-spin" />
         <p className="ml-2">Cargando datos del producto...</p>
       </div>
    );
  }

  // After loading, if there's an error or no product, show 404
  if (error || !product) {
      console.error("Error fetching product or product not found:", error);
      notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Producto</h1>
      <ProductForm product={product} onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}
