
import { NextRequest, NextResponse } from 'next/server';

// This webhook endpoint is no longer functional after removing Stripe.
// It returns a success message to prevent any lingering webhook configurations
// from generating errors.

export async function POST(req: NextRequest) {
  console.log("Received a request to the deprecated Stripe webhook endpoint.");
  return NextResponse.json({ received: true, message: "This endpoint is deprecated." });
}
