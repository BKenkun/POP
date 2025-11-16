
import { NextRequest, NextResponse } from 'next/server';
import type { CartItem } from '@/lib/types';

// La URL del endpoint del intermediario. Debería estar en una variable de entorno.
const INTERMEDIARY_API_URL = 'https://studio--studio-953389996-b1a64.us-central1.hosted.app/api/purchase';
const YOUR_DOMAIN = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(req: NextRequest) {
  try {
    const { cartItems, customerEmail, orderId } = await req.json();

    if (!YOUR_DOMAIN) {
      throw new Error("La URL base del sitio no está configurada en el servidor.");
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío o tiene un formato incorrecto.' }, { status: 400 });
    }
    if (!orderId) {
      return NextResponse.json({ error: 'Falta el ID del pedido.' }, { status: 400 });
    }

    // Calcula el precio total en céntimos
    const totalInCents = cartItems.reduce((acc: number, item: CartItem) => {
      return acc + item.price * item.quantity;
    }, 0);

    // Prepara los detalles para el intermediario según sus especificaciones
    const purchaseDetails = {
      priceInCents: totalInCents,
      orderId: orderId,
      successUrl: `${YOUR_DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${YOUR_DOMAIN}/checkout`,
      // Aunque no se especifica en la guía, es bueno pasar el email para Stripe
      customerEmail: customerEmail, 
      productName: `Pedido ${orderId}`,
    };

    // Llama al servicio intermediario
    const intermediaryResponse = await fetch(INTERMEDIARY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchaseDetails),
    });

    const responseData = await intermediaryResponse.json();

    if (!intermediaryResponse.ok) {
      // Reenvía el error del intermediario al cliente
      throw new Error(responseData.error || 'Error al comunicarse con el servicio de pago.');
    }

    // Devuelve la URL de checkout al frontend
    return NextResponse.json({ checkoutUrl: responseData.checkoutUrl });

  } catch (error: any) {
    console.error('Error en /api/purchase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
