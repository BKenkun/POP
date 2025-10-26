
'use client';

import ProductForm from '../../_components/product-form';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import { useRouter, useParams, notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, onSnapshot, deleteField } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;
    const productDocRef = doc(db, 'products', id);
    const unsubscribe = onSnapshot(productDocRef, (docSnap) => {
        if (docSnap.exists()) {
            setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
            setProduct(null);
        }
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  const handleSave = async (data: Product) => {
    if (!product) {
        toast({ title: 'Error de Conexión', description: 'No se puede conectar a la base de datos.', variant: 'destructive'});
        return;
    }
    
    setIsSaving(true);
    const productRef = doc(db, 'products', product.id);

    try {
        const { id: productId, ...productData } = data; // Exclude 'id' for the update operation
        
        // Firestore doesn't accept `undefined`. If originalPrice is not a number,
        // we should remove it or set it to be deleted.
        if (typeof productData.originalPrice !== 'number') {
            (productData as any).originalPrice = deleteField();
        }

        await updateDoc(productRef, productData);
        toast({
            title: 'Producto Actualizado',
            description: `Los cambios en "${data.name}" han sido guardados.`,
        });
        router.push('/admin/products');
    } catch (err) {
        console.error("Error updating product:", err);
        toast({
            title: 'Error',
            description: 'No se pudo actualizar el producto.',
            variant: 'destructive'
        });
    } finally {
        setIsSaving(false);
    }
  };
  
   if (isLoading) {
    return (
       <div className="flex items-center justify-center h-40">
         <Loader2 className="h-8 w-8 animate-spin" />
       </div>
    );
  }

  if (!product) {
    notFound();
    return null; // Or a more graceful not found component
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Editar Producto</h1>
            <Button asChild variant="outline">
                <Link href="/admin/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Link>
            </Button>
        </div>
      <ProductForm 
        product={product} 
        onSave={handleSave} 
        isSaving={isSaving}
      />
    </div>
  );
}
