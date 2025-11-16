// This file is intentionally left blank.
// The logic for handling webhooks from the payment intermediary has been removed
// to simplify the checkout flow.
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log("Received a request to the deprecated payment webhook endpoint.");
  return NextResponse.json({ received: true, message: "This endpoint is no longer in use." });
}
