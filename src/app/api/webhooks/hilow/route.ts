
'use server';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { firestore as adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { trackOrderStatusUpdate } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';
import { headers } from 'next/headers';


/**
 * ESTA FUNCIÓN CONTIENE LA LÓGICA DE NEGOCIO REAL DE NUESTRA TIENDA.
 * Actualiza la base de datos y ejecuta acciones post-pago.
 * @param internalOrderId El ID interno del pedido del cliente.
 * @param eventType El tipo de evento recibido de Hilow.
 * @param payload El cuerpo completo del webhook para información adicional.
 */
async function updateLocalOrder(internalOrderId: string, eventType: string, payload: any) {
    console.log(`Procesando evento '${eventType}' para el pedido ${internalOrderId}`);
    
    // Solo actuar en eventos de pago exitoso.
    if (eventType !== 'payment.succeeded' && eventType !== 'payment.completed' && eventType !== 'payment.renewal_succeeded') {
        console.log(`Evento '${eventType}' no requiere actualización de estado de pedido.`);
        return;
    }
    
    const parts = internalOrderId.split('_');
    if (parts.length < 3) {
        console.error(`ID de pedido inválido, no se pudo extraer el ID de usuario: ${internalOrderId}`);
        return;
    }
    const userId = parts[1];
    const orderRef = adminFirestore.collection('users').doc(userId).collection('orders').doc(internalOrderId);
    
    try {
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) {
            throw new Error(`El pedido ${internalOrderId} no fue encontrado en nuestra base de datos.`);
        }
        
        const localOrderData = orderSnap.data() as Order;
        
        if (localOrderData.status !== 'Pago Pendiente de Verificación') {
            console.log(`El pedido ${internalOrderId} ya fue procesado. Estado actual: ${localOrderData.status}`);
            return;
        }

        const newStatus = 'Reserva Recibida';
        const batch = adminFirestore.batch();

        batch.update(orderRef, { status: newStatus });

        if ((localOrderData as any).coupon) {
          const couponRef = adminFirestore.collection('coupons').doc((localOrderData as any).coupon.code);
          batch.update(couponRef, { usageCount: FieldValue.increment(1) });
        }
        
        const pointsToAdd = Math.floor((localOrderData.total || 0) / 1000);
        if (pointsToAdd > 0) {
          const userRef = adminFirestore.collection('users').doc(userId);
          batch.update(userRef, { 
            loyaltyPoints: FieldValue.increment(pointsToAdd) 
          });
        }
        
        await batch.commit();
        console.log(`Pedido ${internalOrderId} actualizado a "${newStatus}" y puntos/cupón aplicados.`);
        
        await trackOrderStatusUpdate({...localOrderData, id: internalOrderId, status: newStatus}, newStatus);

    } catch (error) {
        console.error(`Error al actualizar el pedido local ${internalOrderId}:`, error);
    }
}

/**
 * Manejador para las peticiones POST que llegan desde Hilow.
 */
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.HILOW_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('CRÍTICO: La variable de entorno HILOW_WEBHOOK_SECRET no está configurada.');
    return NextResponse.json({ error: 'Configuración de servidor incompleta.' }, { status: 500 });
  }
  
  const headerStore = headers();
  const signature = headerStore.get('hilow-signature');
  const body = await req.text();

  // Log the incoming request body for easier debugging
  console.log("Received Hilow Webhook Body:", body);

  if (!signature) {
    return NextResponse.json({ error: 'Petición no autorizada. Falta la cabecera hilow-signature.' }, { status: 401 });
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedSignatureBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
      throw new Error('La firma del webhook no es válida.');
    }

    const payload = JSON.parse(body);
    
    const { eventType, internalOrderId } = payload;

    if (!internalOrderId || !eventType) {
        console.error('Payload del webhook inválido: faltan campos requeridos (internalOrderId o eventType).', payload);
        return NextResponse.json({ error: 'Payload del webhook inválido.' }, { status: 400 });
    }

    // Procesar el evento según su tipo.
    switch (eventType) {
      case 'payment.succeeded':
      case 'payment.completed':
      case 'payment.renewal_succeeded':
        await updateLocalOrder(internalOrderId, eventType, payload);
        break;
      case 'subscription.cancelled':
      case 'subscription.payment_failed':
        console.log(`Evento de suscripción '${eventType}' recibido para el pedido ${internalOrderId}. Lógica de manejo pendiente.`);
        // Aquí se podría añadir lógica para marcar la suscripción como cancelada en la DB.
        break;
      default:
        console.warn(`Evento de webhook no manejado recibido de Hilow: ${eventType}`);
    }

  } catch (err: any) {
    console.error(`Error procesando el webhook de Hilow: ${err.message}`);
    const statusCode = err.message.includes('firma') ? 400 : 500;
    return NextResponse.json({ error: `Error en el webhook: ${err.message}` }, { status: statusCode });
  }

  return NextResponse.json({ received: true });
}
