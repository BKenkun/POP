
// This file is no longer needed as the data fetching logic has been
// moved directly into the server component `src/app/admin/orders/page.tsx`.
// It is intentionally left blank to complete the refactor.

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { message: 'This endpoint is deprecated. Data is now fetched via a Server Component.' },
    { status: 410 } // 410 Gone
  );
}
