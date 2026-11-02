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
        title: 'Coupon Created',
        description: `Coupon "${data.code}" has been created successfully.`,
      });
      router.push('/admin/coupons');
    } catch (err) {
      console.error("Error creating coupon: ", err);
      toast({
        title: 'Error',
        description: 'Could not create coupon.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create New Coupon</h1>
      <CouponForm onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}
