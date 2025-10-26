
'use client';

import ProductForm from '../_components/product-form';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { generateSKU } from '@/lib/utils';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function NewProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newSku, setNewSku] = useState('');

  // Generate SKU on client to ensure it's available for the form
  useState(() => {
    setNewSku(generateSKU('P'));
    setIsLoading(false);
  });

  const handleSave = async (data: Product) => {
    setIsSaving(true);
    const productRef = doc(db, 'products', data.id);

    try {
        await setDoc(productRef, data);
        toast({
            title: 'Producto Creado',
            description: `El producto "${data.name}" ha sido guardado en la base de datos.`,
        });
        router.push('/admin/products');
    } catch (err) {
        console.error("Error creating product:", err);
        toast({
            title: 'Error',
            description: 'No se pudo crear el producto.',
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
         <p className="ml-2">Generando SKU...</p>
       </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Crear Nuevo Producto</h1>
      <ProductForm 
        onSave={handleSave} 
        isSaving={isSaving}
        product={{ sku: newSku }} 
      />
    </div>
  );
}
