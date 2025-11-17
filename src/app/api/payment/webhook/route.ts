
'use server';

// This file is DEPRECATED and no longer used.
// The new system uses a real-time WebSocket connection handled by
// /lib/websocket-client.ts instead of this webhook endpoint.
// This file is kept to prevent 404 errors from any old, lingering configurations
// but does not perform any actions.

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log("DEPRECATED: Received a request to the old webhook endpoint. This endpoint is no longer in use.");
  
  // Immediately return a success response to acknowledge the webhook call,
  // even though we are not processing it.
  return NextResponse.json({ received: true, message: "This webhook is deprecated and no longer processed." });
}
