
// This file is intentionally left blank.
// Payment verification is now handled by the webhook at /api/payment/webhook/route.ts,
// which receives notifications from the payment intermediary.
// This client-side verification endpoint is no longer used and is kept to prevent 404s.
import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        { success: false, error: 'This endpoint is deprecated. Verification is handled by webhook.' },
        { status: 410 } // 410 Gone
    );
}
