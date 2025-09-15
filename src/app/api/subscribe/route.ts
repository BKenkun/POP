
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
  }

  const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
  const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID;

  if (!KLAVIYO_API_KEY || !KLAVIYO_LIST_ID) {
    console.warn("Klaviyo API Key or List ID is not set in environment variables. Returning success without subscribing.");
    return NextResponse.json({ message: 'Subscription successful (simulation).' });
  }

  try {
    const response = await fetch(`https://a.klaviyo.com/api/v2/list/${KLAVIYO_LIST_ID}/subscribe`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        api_key: KLAVIYO_API_KEY,
        profiles: [
            { email: email }
        ]
      })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error("Klaviyo API Error:", errorData);
        // Extract a user-friendly error message if available
        const errorMessage = errorData.detail || 'Could not subscribe to the newsletter.';
        return NextResponse.json({ message: errorMessage }, { status: response.status });
    }

    return NextResponse.json({ message: 'Successfully subscribed to the newsletter.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
