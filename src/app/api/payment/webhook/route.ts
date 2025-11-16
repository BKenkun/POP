
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { trackKlaviyoEvent, formatOrderForKlaviyo } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';

const EXTERNAL_WEBHOOK_SECRET = process.env.EXTERNAL_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!EXTERNAL_WEBHOOK_SECRET) {
    console.error('La clave secreta del webhook no está configurada en las variables de entorno.');
    return NextResponse.json({ error: 'Error de configuración del servidor.' }, { status: 500 });
  }

  const rawBody = await req.text();
  const receivedSignature = req.headers.get('x-intermediary-signature');

  // 1. Verificar la firma HMAC
  const expectedSignature = crypto
    .createHmac('sha256', EXTERNAL_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (receivedSignature !== expectedSignature) {
    console.warn('Firma de webhook inválida. Alerta de seguridad.');
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  // Si la firma es válida, procesamos el cuerpo de la petición
  try {
    const { order_id, status } = JSON.parse(rawBody);

    if (!order_id || !status) {
      return NextResponse.json({ error: 'Faltan campos obligatorios en el payload.' }, { status: 400 });
    }

    // 2. Lógica de negocio basada en el estado
    if (status === 'completed') {
      console.log(`Webhook recibido: Pago completado para el pedido ${order_id}`);
      
      // El order_id tiene el formato 'order_USERID_TIMESTAMP'
      const userId = order_id.split('_')[1];
      if (!userId) {
        throw new Error(`No se pudo extraer el userId del order_id: ${order_id}`);
      }

      // Buscamos el pedido en la base de datos
      const orderRef = doc(db, 'users', userId, 'orders', order_id);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const orderData = orderSnap.data() as Order;

        // Evitar procesar un pedido que ya está pagado
        if (orderData.status !== 'Pago Pendiente de Verificación' && orderData.status !== 'Reserva Recibida') {
            console.log(`El pedido ${order_id} ya fue procesado. Estado actual: ${orderData.status}`);
            return NextResponse.json({ received: true, message: 'Pedido ya procesado.' });
        }

        // Actualizar el estado del pedido a pagado
        await updateDoc(orderRef, {
          status: 'Reserva Recibida' // o 'Pagado', según tu flujo
        });

        // Enviar email de confirmación a través de Klaviyo
        const klaviyoOrderData = await formatOrderForKlaviyo({ ...orderData, id: order_id, createdAt: new Date() }, order_id);
        await trackKlaviyoEvent('Placed Order', orderData.customerEmail, klaviyoOrderData);
        await trackKlaviyoEvent('Admin New Order Notification', 'maryandpopper@gmail.com', klaviyoOrderData);

      } else {
        console.error(`Error de webhook: No se encontró el pedido ${order_id} para el usuario ${userId}`);
      }
    } else {
      console.log(`Webhook recibido para el pedido ${order_id} con estado: ${status}`);
      // Aquí podrías añadir lógica para los pagos fallidos o expirados
    }

    // 3. Responder al intermediario
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error procesando el webhook del intermediario:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
