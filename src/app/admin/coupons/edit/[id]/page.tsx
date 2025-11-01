'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Loader2, ArrowLeft } from 'lucide-react';
import CouponForm from '../../_components/coupon-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Coupon } from '../../page';

export default function EditCouponPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    if (!id) return;

    const couponRef = doc(db, 'coupons', id);
    const fetchCoupon = async () => {
      const docSnap = await getDoc(couponRef);
      if (docSnap.exists()) {
        setCoupon({ id: docSnap.id, ...docSnap.data() } as Coupon);
      } else {
        setCoupon(null);
      }
      setIsLoading(false);
    };

    fetchCoupon();
  }, [id]);

  const handleSave = async (data: Omit<Coupon, 'id' | 'usageCount'>) => {
    if (!coupon) return;
    setIsSaving(true);
    const couponRef = doc(db, 'coupons', coupon.id);

    try {
      await updateDoc(couponRef, { ...data });
      toast({
        title: 'Cupón Actualizado',
        description: `Los cambios en "${data.code}" han sido guardados.`,
      });
      router.push('/admin/coupons');
    } catch (err) {
      console.error("Error updating coupon:", err);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el cupón.',
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
      </div>
    );
  }

  if (!coupon) {
    notFound();
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Editar Cupón</h1>
        <Button asChild variant="outline">
          <Link href="/admin/coupons">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Cupones
          </Link>
        </Button>
      </div>
      <CouponForm coupon={coupon} onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}
