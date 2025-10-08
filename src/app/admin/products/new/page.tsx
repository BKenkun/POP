
'use client';

import ProductForm from '../_components/product-form';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const { toast } = useToast();
  const router = useRouter();

  const handleSave = (data: Product) => {
    // In a real app, this would be an API call to your backend to create the product.
    console.log('--- CREATING NEW PRODUCT (SIMULATION) ---');
    console.log(data);
    toast({
      title: 'Producto Creado (Simulación)',
      description: `El producto "${data.name}" ha sido añadido a la lista.`,
    });
    router.push('/admin/products');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Crear Nuevo Producto</h1>
      <ProductForm onSave={handleSave} />
    </div>
  );
}
