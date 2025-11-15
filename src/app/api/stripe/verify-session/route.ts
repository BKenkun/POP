
// This file is no longer needed as verification happens via webhook.
// It is intentionally left blank to avoid build errors from lingering imports
// and to complete the final architecture refactor.
import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        { success: false, error: 'This endpoint is deprecated. Verification is handled by webhook.' },
        { status: 410 } // 410 Gone
    );
}
