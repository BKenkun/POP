'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Loader2, ArrowLeft } from 'lucide-react';
import CouponForm from '../../_components/coupon-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAdminCouponById, updateAdminCoupon } from '@/app/actions/coupons-admin';
import type { Coupon } from '../../page';

export default function EditCouponPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    if (!id || !user) return;
    let active = true;

    const fetchCoupon = async () => {
      try {
        const idToken = await user.getIdToken();
        const result = await getAdminCouponById(id, idToken);
        if (active) {
          setCoupon(result);
        }
      } catch (err) {
        console.warn('Notice loading coupon for edit:', err);
        if (active) setCoupon(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void fetchCoupon();
    return () => {
      active = false;
    };
  }, [id, user]);

  const handleSave = async (data: Omit<Coupon, 'id' | 'usageCount'>) => {
    if (!coupon || !user) return;
    setIsSaving(true);

    try {
      const idToken = await user.getIdToken();
      const result = await updateAdminCoupon(coupon.id, data, idToken);
      if (!result.success) {
        toast({
          title: 'Could not update coupon',
          description: result.error || 'Verify the coupon fields and try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Coupon Updated',
        description: `Changes to "${data.code}" have been saved.`,
      });
      router.push('/admin/coupons');
      router.refresh();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Could not update coupon.',
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
        <h1 className="text-3xl font-bold">Edit Coupon</h1>
        <Button asChild variant="outline">
          <Link href="/admin/coupons">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Coupons
          </Link>
        </Button>
      </div>
      <CouponForm coupon={coupon} onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}
