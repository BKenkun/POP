
'use client';

import { useState } from 'react';
import ProductForm from '../../_components/product-form';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useDoc, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function EditProductPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const firestore = useFirestore();
  const [isSaving, setIsSaving] = useState(false);

  const productDocRef = doc(firestore, 'products', id);
  const { data: product, isLoading, error } = useDoc<Product>(productDocRef);

  const handleSave = async (data: Product) => {
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

  if (isLoading) {
    return (
       <div className="flex items-center justify-center h-40">
         <Loader2 className="h-8 w-8 animate-spin" />
         <p className="ml-2">Buscando producto...</p>
       </div>
    );
  }

  if (!product || error) {
      notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Producto</h1>
      <ProductForm product={product} onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}
