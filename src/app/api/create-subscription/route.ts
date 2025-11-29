
import { NextRequest, NextResponse } from 'next/server';

const HILOW_API_URL = 'https://hilowglobal.com/api/create-subscription';

export async function POST(req: NextRequest) {
  try {
    const { orderId, successUrl, cancelUrl } = await req.json();

    if (!orderId || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Missing required fields: orderId, successUrl, cancelUrl' }, { status: 400 });
    }

    const payload = {
      subscriptionDetails: {
        amountInCents: 4400,
        interval: 'month',
        productName: 'Club mensual',
      },
      orderId,
      successUrl,
      cancelUrl,
    };

    const apiResponse = await fetch(HILOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      // Forward the error from the external API
      return NextResponse.json({ error: data.error || 'Failed to create subscription session' }, { status: apiResponse.status });
    }

    // Forward the successful response from the external API
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
