
'use client';

import ProductForm from '../../_components/product-form';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import { cbdProducts } from '@/lib/cbd-products';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function EditProductPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | undefined | null>(undefined);

  useEffect(() => {
    // Simulate finding the product
    const foundProduct = cbdProducts.find((p) => p.id === id);
    setProduct(foundProduct || null);
  }, [id]);

  if (product === undefined) {
    return (
       <div className="flex items-center justify-center h-40">
         <Loader2 className="h-8 w-8 animate-spin" />
         <p className="ml-2">Buscando producto...</p>
       </div>
    );
  }

  if (product === null) {
      notFound();
  }

  const handleSave = (data: Product) => {
    // In a real app, this would trigger a file write or an API call to update the static data source.
    console.log('--- UPDATING PRODUCT (SIMULATION) ---');
    console.log(`Product ID: ${id}`);
    console.log('New Data:', data);
    toast({
      title: 'Producto Actualizado (Simulación)',
      description: `Los cambios en "${data.name}" han sido guardados. Esta es una simulación y los datos no se persistirán.`,
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
