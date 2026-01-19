import { NextResponse } from 'next/server';

// This file is intentionally left blank.
// The purchase logic is handled by server actions in `src/app/actions/hilow.ts`
// and client-side logic in `src/app/checkout/checkout-client-page.tsx`.
// This API route is deprecated.

export async function POST() {
    return NextResponse.json(
        { success: false, error: 'This endpoint is deprecated. Please use the main purchase flow.' },
        { status: 410 } // 410 Gone
    );
}

export async function GET() {
    return NextResponse.json(
        { success: false, error: 'This endpoint is deprecated.' },
        { status: 410 } // 410 Gone
    );
}
