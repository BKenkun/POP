
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const HILOW_WEBHOOK_SECRET = process.env.HILOW_WEBHOOK_SECRET;

/**
 * Verifies the signature of the incoming webhook request from Hilow.
 * @param request - The incoming NextRequest.
 * @param rawBody - The raw request body as a string.
 * @returns A boolean indicating if the signature is valid.
 */
async function verifySignature(request: NextRequest, rawBody: string): Promise<boolean> {
  const signature = request.headers.get('x-hilow-signature');

  if (!signature || !HILOW_WEBHOOK_SECRET) {
    console.error('Webhook verification failed: Missing signature or secret.');
    return false;
  }

  const hmac = crypto.createHmac('sha256', HILOW_WEBHOOK_SECRET);
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
  const receivedSignature = Buffer.from(signature, 'utf8');

  // Use timingSafeEqual to prevent timing attacks
  return crypto.timingSafeEqual(digest, receivedSignature);
}

/**
 * This function is a placeholder for your actual database update logic.
 * You should implement this to update your order's status, send emails, etc.
 * @param internalOrderId - Your internal order ID.
 * @param status - The new status from Hilow (e.g., 'completed', 'failed').
 */
async function updateLocalOrder(internalOrderId: string, status: string): Promise<void> {
  console.log(`Updating local order ${internalOrderId} to status: ${status}`);
  // Example logic:
  // const orderRef = firestore.collection('orders').doc(internalOrderId);
  // await orderRef.update({ status: status, paymentStatus: 'paid' });
  // await sendOrderConfirmationEmail(internalOrderId);
}

/**
 * The main handler for the Hilow webhook.
 * To use this, copy this code into `/app/api/webhooks/hilow/route.ts` in your project.
 */
export async function POST(req: NextRequest) {
  if (!HILOW_WEBHOOK_SECRET) {
    console.error('HILOW_WEBHOOK_SECRET is not configured.');
    return NextResponse.json({ message: 'Webhook secret not configured.' }, { status: 500 });
  }

  const rawBody = await req.text();
  const isVerified = await verifySignature(req, rawBody);

  if (!isVerified) {
    console.warn('Invalid webhook signature received.');
    return NextResponse.json({ message: 'Invalid signature.' }, { status: 403 });
  }

  try {
    const payload = JSON.parse(rawBody);

    // Process the event based on its type
    switch (payload.type) {
      case 'payment.succeeded':
        const { internalOrderId } = payload.data;
        console.log(`Payment succeeded for order: ${internalOrderId}`);
        // This is where you confirm the order is paid.
        await updateLocalOrder(internalOrderId, 'completed');
        break;

      case 'payment.failed':
        const { internalOrderId: failedOrderId } = payload.data;
        console.log(`Payment failed for order: ${failedOrderId}`);
        await updateLocalOrder(failedOrderId, 'failed');
        break;
      
      // Add other event types as needed
      // case 'subscription.created':
      //   // ...
      //   break;

      default:
        console.log(`Unhandled webhook event type: ${payload.type}`);
    }

    // Acknowledge receipt of the webhook
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ message: `Webhook Error: ${error.message}` }, { status: 400 });
  }
}
