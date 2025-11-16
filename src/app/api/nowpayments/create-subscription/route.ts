
// This file is intentionally left blank as it is no longer used.
// The subscription logic was tied to payment methods that have been removed.
import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        { success: false, error: 'This endpoint is deprecated.' },
        { status: 410 } // 410 Gone
    );
}
