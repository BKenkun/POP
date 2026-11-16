'use client';

import CouponForm from '../_components/coupon-form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { createAdminCoupon } from '@/app/actions/coupons-admin';
import type { Coupon } from '../page';

export default function NewCouponPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: Omit<Coupon, 'id' | 'usageCount'>) => {
    if (!user) {
      toast({
        title: 'Session Required',
        description: 'Please log in as an administrator.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const idToken = await user.getIdToken();
      const result = await createAdminCoupon(data, idToken);

      if (!result.success) {
        toast({
          title: 'Could not create coupon',
          description: result.error || 'Verify the coupon fields and try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Coupon Created',
        description: `Coupon "${data.code}" has been created successfully.`,
      });
      router.push('/admin/coupons');
      router.refresh();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Could not create coupon.',
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
