
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * This is the webhook endpoint (IPN Callback URL) that NOWPayments will call to notify
 * our application about subscription payment events.
 */
export async function POST(req: NextRequest) {
  const headersList = headers();
  const nowpaymentsSignature = headersList.get('x-nowpayments-sig');
  
  const body = await req.json();

  console.log('Received NOWPayments Subscription Webhook:');
  console.log('Signature:', nowpaymentsSignature);
  console.log('Body:', JSON.stringify(body, null, 2));

  // --- SIGNATURE VERIFICATION (PLACEHOLDER) ---
  // In a production environment, you MUST verify the signature to ensure
  // the request is genuinely from NOWPayments. This requires your IPN Secret Key.
  // const isValid = verifySignature(body, nowpaymentsSignature, process.env.NOWPAYMENTS_IPN_SECRET_KEY);
  // if (!isValid) {
  //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  // }
  
  // --- PROCESS THE EVENT ---
  // Here, you would add logic to handle the subscription event.
  // For example, find the user associated with `body.order_id` or `body.email`
  // and update their subscription status in your database.
  
  // Example event types:
  // - `sub_created`: A new subscription was initiated.
  // - `payment_received`: A recurring payment was successful.
  // - `sub_failed`: A recurring payment failed.
  // - `sub_cancelled`: The subscription was cancelled.
  
  const eventType = body.status;
  const subscriptionId = body.sub_id;
  const orderId = body.order_id;
  const userEmail = body.email;

  switch (eventType) {
    case 'payment_received':
      console.log(`✅ Payment received for subscription ${subscriptionId} for user ${userEmail}.`);
      // TODO: Update user's subscription status to 'active' and extend their access.
      break;
    case 'sub_failed':
      console.log(`❌ Payment failed for subscription ${subscriptionId} for user ${userEmail}.`);
      // TODO: Update user's subscription status to 'past_due' and notify them.
      break;
    case 'sub_cancelled':
       console.log(`🚫 Subscription ${subscriptionId} for user ${userEmail} was cancelled.`);
       // TODO: Update user's subscription status to 'cancelled'.
       break;
    default:
      console.log(`🔔 Received unhandled subscription event type: ${eventType}`);
  }


  // Respond to NOWPayments to acknowledge receipt of the webhook.
  return NextResponse.json({ success: true, message: 'Webhook received.' });
}
