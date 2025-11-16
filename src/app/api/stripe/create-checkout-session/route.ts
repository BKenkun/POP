// This file is intentionally left blank.
// The logic for creating a payment session has been moved to /api/purchase/route.ts,
// which communicates with the external payment intermediary instead of directly with Stripe.
// This file is kept to prevent 404 errors on old references but no longer contains active code.
import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        { success: false, error: 'This endpoint is deprecated. Please use the main purchase flow.' },
        { status: 410 } // 410 Gone
    );
}
