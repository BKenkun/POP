
'use client';

import ProductForm from '../../_components/product-form';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import { cbdProducts } from '@/lib/cbd-products';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function EditProductPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const product = cbdProducts.find((p) => p.id === id);

  if (!product) {
      // In a real app, you might show a loading state first
      // For this simulation, if not found synchronously, it's a 404.
       const timer = setTimeout(() => {
        notFound();
       }, 1000);
       return (
         <div className="flex items-center justify-center h-40">
           <Loader2 className="h-8 w-8 animate-spin" />
           <p className="ml-2">Buscando producto...</p>
         </div>
       );
  }

  const handleSave = (data: Product) => {
    // In a real app, this would be an API call to your backend to update the product.
    console.log(`--- UPDATING PRODUCT ${id} (SIMULATION) ---`);
    console.log(data);
    toast({
      title: 'Producto Actualizado (Simulación)',
      description: `Los cambios en "${data.name}" han sido guardados.`,
    });
    router.push('/admin/products');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Producto</h1>
      <ProductForm product={product} onSave={handleSave} />
    </div>
  );
}
