
'use client';

import ProductForm from '../_components/product-form';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { generateSKU } from '@/lib/utils';

export default function NewProductPage() {
  const { toast } = useToast();
  const router = useRouter();

  const handleSave = (data: Product) => {
    const newProduct: Product = {
      ...data,
      sku: data.sku || generateSKU('POP-'), // Generate SKU if it wasn't somehow provided
      active: data.active === undefined ? true : data.active,
    };
    
    console.log('--- CREATING NEW PRODUCT (SIMULATION) ---');
    console.log(newProduct);

    toast({
      title: 'Producto Creado (Simulación)',
      description: `El producto "${newProduct.name}" ha sido añadido. Esta es una simulación y los datos no se persistirán.`,
    });
    router.push('/admin/products');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Crear Nuevo Producto</h1>
      {/* Pass a product-like object with a generated SKU to the form */}
      <ProductForm onSave={handleSave} product={{ sku: generateSKU('POP-') } as Product} />
    </div>
  );
}
