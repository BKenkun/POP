
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { db } from '@/lib/firebase-admin'; // Asegúrate de que esta es la ruta correcta a tu admin-sdk

// TODO: Añadir esta variable al fichero .env con una clave segura compartida con el intermediario.
const WEBHOOK_SECRET = process.env.INTERMEDIARY_WEBHOOK_SECRET;

/**
 * Endpoint para recibir notificaciones de estado de pago desde el servicio intermediario.
 */
export async function POST(req: NextRequest) {
  const headersList = headers();
  const signature = headersList.get('x-intermediary-signature');

  if (!WEBHOOK_SECRET) {
    console.error('Error: La clave secreta del webhook no está configurada en el servidor.');
    return NextResponse.json({ error: 'Configuración del servidor incompleta.' }, { status: 500 });
  }

  const rawBody = await req.text();

  // 1. Verificar la firma para asegurar que la petición es legítima
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.warn('Firma de webhook inválida recibida.');
    return NextResponse.json({ error: 'Firma inválida.' }, { status: 401 });
  }

  try {
    const body = JSON.parse(rawBody);
    console.log('Webhook de pago recibido y verificado:', body);

    const { order_id, status, payment_id, paid_amount } = body;

    if (!order_id || !status) {
      return NextResponse.json({ error: 'Faltan campos obligatorios en el payload.' }, { status: 400 });
    }

    // 2. Lógica para actualizar el pedido en Firestore
    // Nota: El 'order_id' que viene del intermediario debe coincidir con el que guardaste
    // al crear el pedido inicial. El 'orderId' en Firestore debe ser el 'order_id' del intermediario.
    // La estructura de la base de datos es /users/{userId}/orders/{orderId}
    
    // Este paso es más complejo porque necesitamos encontrar el pedido sin saber el userId.
    // Una solución es hacer una collectionGroup query.
    const ordersRef = db.collectionGroup('orders').where('id', '==', order_id);
    const orderSnapshot = await ordersRef.get();

    if (orderSnapshot.empty) {
      console.error(`Error: No se encontró ningún pedido con el id: ${order_id}`);
      // Respondemos con 200 para que el intermediario no siga reintentando un pedido que no existe.
      return NextResponse.json({ success: true, message: 'Notificación recibida pero el pedido no fue encontrado.' });
    }
    
    const orderDoc = orderSnapshot.docs[0];
    const currentOrderData = orderDoc.data();

    // Evitar procesar un webhook dos veces
    if (currentOrderData.status !== 'Pago Pendiente de Verificación') {
        console.log(`El pedido ${order_id} ya ha sido procesado. Estado actual: ${currentOrderData.status}`);
        return NextResponse.json({ success: true, message: 'Webhook ya procesado.' });
    }

    // 3. Actualizar el estado del pedido
    let newStatus: string;
    switch (status) {
      case 'completed':
        newStatus = 'Reserva Recibida'; // O 'Pagado', según tu flujo
        break;
      case 'failed':
      case 'expired':
        newStatus = 'Cancelado';
        break;
      default:
        console.warn(`Estado de webhook no manejado: ${status}`);
        return NextResponse.json({ success: true, message: 'Estado no manejado.' });
    }

    await orderDoc.ref.update({
      status: newStatus,
      paymentId: payment_id, // Opcional: guardar el ID de pago del procesador
      updatedAt: new Date().toISOString(),
    });

    console.log(`Pedido ${order_id} actualizado al estado: ${newStatus}`);

    // Aquí podrías enviar un email de confirmación al cliente.

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error al procesar el webhook de pago:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
