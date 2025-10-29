
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { CheckCircle, Gift, Package, Sparkles, User, Loader2, Truck, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Image from 'next/image';
import { createNowPaymentsSubscription } from '@/app/actions/subscription-nowpayments';

const benefits = [
    { icon: Package, text: "5 poppers de tu elección cada mes" },
    { icon: Sparkles, text: "1 accesorio para poppers" },
    { icon: Gift, text: "Un regalo sorpresa en cada caja" },
    { icon: Truck, text: "Envío gratuito incluido"},
    { icon: CheckCircle, text: "Cancela cuando quieras, sin compromiso" },
];

export default function SubscriptionPage() {
    const { user, loading: authLoading, isSubscribed }