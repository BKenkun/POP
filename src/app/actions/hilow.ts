'use server';

export async function createHilowOrder(
  internalOrderId: string,
  amountInCents: number,
  productName: string,
  isSubscription: boolean
) {
  if (amountInCents < 0 || !Number.isInteger(amountInCents)) {
    return { success: false, message: 'El importe debe ser un número entero positivo de céntimos.' };
  }

  const HILOW_API_KEY = process.env.HILOW_API_KEY;
  const HILOW_API_URL = 'https://hilowglobal.com/api/v1/create-order';
  const storeHostname = process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, '') || 'comprarpopperonline.com';
  
  if (!HILOW_API_KEY) {
    console.error('Hilow API key is not configured.');
    return { success: false, message: 'Error de configuración del servidor de pagos.' };
  }

  const payload = {
    storeId: storeHostname,
    internalOrderId,
    amountInCents,
    productName,
    isSubscription,
    successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?order_id=${internalOrderId}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
  };

  try {
    const response = await fetch(HILOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HILOW_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo crear el pedido en la pasarela de pago.');
    }
    
    if (data.checkoutUrl) {
        return { success: true, checkoutUrl: data.checkoutUrl };
    } else {
        return { success: false, message: 'La pasarela de pago no devolvió una URL de pago.' };
    }
  } catch (error: any) {
    console.error('Error al crear el pedido en Hilow:', error);
    return { success: false, message: error.message };
  }
}
