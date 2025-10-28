
'use server';

import { z } from 'zod';

const CreateInvoiceSchema = z.object({
  price_amount: z.number(),
  price_currency: z.string(),
  order_id: z.string().optional(),
  order_description: z.string().optional(),
});

type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;

export async function createNowPaymentsInvoice(
  input: CreateInvoiceInput
): Promise<{ success: boolean; invoice_url?: string; error?: string }> {
  const validation = CreateInvoiceSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: 'Datos de factura inválidos.' };
  }

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
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: validation.data.price_amount,
        price_currency: validation.data.price_currency,
        order_id: validation.data.order_id,
        order_description: validation.data.order_description,
        success_url: `${BASE_URL}/account/orders`,
        cancel_url: `${BASE_URL}/checkout`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al crear la factura en NOWPayments.');
    }

    return { success: true, invoice_url: data.invoice_url };
  } catch (error: any) {
    console.error('Error creating NOWPayments invoice:', error);
    return { success: false, error: error.message };
  }
}
