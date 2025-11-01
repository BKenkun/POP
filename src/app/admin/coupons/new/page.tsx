'use client';

import CouponForm from '../_components/coupon-form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import type { Coupon } from '../page';

export default function NewCouponPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: Omit<Coupon, 'id' | 'usageCount'>) => {
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'coupons'), {
        ...data,
        usageCount: 0,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Cupón Creado',
        description: `El cupón "${data.code}" ha sido creado con éxito.`,
      });
      router.push('/admin/coupons');
    } catch (err) {
      console.error("Error creating coupon: ", err);
      toast({
        title: 'Error',
        description: 'No se pudo crear el cupón.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Crear Nuevo Cupón</h1>
      <CouponForm onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}
