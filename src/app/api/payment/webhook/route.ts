
'use server';

// This file is DEPRECATED and no longer used.
// The new system uses a real-time WebSocket connection handled by
// /lib/websocket-client.ts instead of this webhook endpoint.
// This file is kept to prevent 404 errors from any old, lingering configurations
// but does not perform any actions.

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

const SECRET_KEY = process.env.WEBSHOOK_SECRET_KEY || 'wF9z$E(H+KbPeShVmYq3t6w9yB&G)J@N';

async function verifySignature(request: NextRequest): Promise<boolean> {
    const signature = headers().get('x-intermediary-signature');
    if (!signature) {
        console.warn('Webhook received without signature.');
        return false;
    }

    const bodyText = await request.text();
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(bodyText);
    const calculatedSignature = hmac.digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(calculatedSignature));
}

export async function POST(req: NextRequest) {
  console.log("DEPRECATED: Received a request to the old webhook endpoint. This endpoint is no longer in use.");
  
  // We still check the signature to prevent logs from being spammed by unauthorized requests.
  const isValid = await verifySignature(req.clone());
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  return NextResponse.json({ received: true, message: "This webhook is deprecated and no longer processed." });
}
