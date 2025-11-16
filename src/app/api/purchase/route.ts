// This file is intentionally left blank.
// The logic for creating a payment session via an intermediary has been removed
// to simplify the checkout flow and resolve integration issues.
import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        { success: false, error: 'This payment method is temporarily disabled.' },
        { status: 503 } // 503 Service Unavailable
    );
}
