
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc, writeBatch } from 'firebase/firestore';
import type { CartItem, ShippingAddress, Order } from '@/lib/types';
import { trackKlaviyoEvent, formatOrderForKlaviyo } from './klaviyo';
import { getUserIdFromSession } from './user-data';
import type { Coupon } from '@/app/admin/coupons/page';


const CreateInvoiceSchema = z.object({
  price_amount: z.number(),
  price_currency: z.string(),
  order_id: z.string(),
  order_description: z.string().optional(),
  // We'll also receive all order data to create the order in our DB first
  cartItems: z.any(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  shippingAddress: z.any(),
  finalTotal: z.number(),
  appliedCoupon: z.any().optional(),
  couponDiscount: z.number().optional(),
});

type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;

export async function createNowPaymentsInvoice(
  input: CreateInvoiceInput
): Promise<{ success: boolean; invoice_url?: string; error?: string }> {
  const validation = CreateInvoiceSchema.safeParse(input);
  if (!validation.success) {
    console.error("Invalid input for createNowPaymentsInvoice:", validation.error.flatten());
    return { success: false, error: 'Datos de factura inválidos.' };
  }

  const {
    price_amount,
    price_currency,
    order_id,
    order_description,
    cartItems,
    customerName,
    customerEmail,
    shippingAddress,
    finalTotal,
    appliedCoupon,
    couponDiscount
  } = validation.data;

  const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  if (!NOWPAYMENTS_API_KEY || !BASE_URL) {
    console.error('NOWPayments API key or Base URL is not set in environment variables.');
    return {
      success: false,
      error: 'El servicio de pago con criptomonedas no está configurado. Por favor, contacta al soporte.',
    };
  }

  try {
    const userId = await getUserIdFromSession();

    // 1. Create the order in our database first
    const orderDocRef = doc(db, 'users', userId, 'orders', order_id);
    
    const itemsForPayload = (cartItems as CartItem[]).map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl.includes('/api/image-proxy?url=')
            ? decodeURIComponent(item.imageUrl.split('url=')[1] || '')
            : item.imageUrl,
    }));

    const orderData: Omit<Order, 'id'> = {
        userId: userId,
        status: 'Pago Pendiente de Verificación',
        total: finalTotal,
        items: itemsForPayload,
        customerName: customerName,
        customerEmail: customerEmail,
        shippingAddress: shippingAddress as ShippingAddress,
        paymentMethod: 'crypto',
        createdAt: serverTimestamp() as any, // Let server set the timestamp
        ...(appliedCoupon && {
            coupon: {
                code: (appliedCoupon as Coupon).code,
                discount: couponDiscount || 0,
            }
        })
    };
    
    const batch = writeBatch(db);
    batch.set(orderDocRef, orderData);

    // Increment coupon usage count if a coupon was applied
    if (appliedCoupon) {
        const couponRef = doc(db, 'coupons', appliedCoupon.id);
        const couponSnap = await getDoc(couponRef);
        if(couponSnap.exists()) {
            batch.update(couponRef, {
                usageCount: (couponSnap.data().usageCount || 0) + 1,
            });
        }
    }
    
    await batch.commit();
    
    // Notify admin and user about the pending payment order
    const klaviyoOrderData = await formatOrderForKlaviyo({ ...orderData, id: order_id, createdAt: new Date() }, order_id);
    await trackKlaviyoEvent('Placed Order', customerEmail, klaviyoOrderData);
    
    // 2. Now, create the invoice on NOWPayments using the correct parameters
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount,
        price_currency,
        order_id,
        order_description,
        success_url: `${BASE_URL}/account/orders/${order_id}`, // Correct parameter
        cancel_url: `${BASE_URL}/checkout`, // Correct parameter
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('NOWPayments API Error:', data);
      throw new Error(data.message || 'Error al crear la factura en NOWPayments.');
    }

    return { success: true, invoice_url: data.invoice_url };

  } catch (error: any) {
    console.error('Error creating NOWPayments invoice:', error);
    return { success: false, error: error.message };
  }
}
