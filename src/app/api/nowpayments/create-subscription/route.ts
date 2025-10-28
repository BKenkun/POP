// This file is no longer needed as the subscription logic has been moved
// to a Server Action in `src/app/actions/subscription-nowpayments.ts`.
// This centralizes the server-side logic and resolves authentication issues.
import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        { success: false, error: 'This endpoint is deprecated. Please use the Server Action.' },
        { status: 410 } // 410 Gone
    );
}
