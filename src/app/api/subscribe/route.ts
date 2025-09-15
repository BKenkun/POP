
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
    const response = await fetch(`https://a.klaviyo.com/api/profiles/`, {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'accept': 'application/json',
        'content-type': 'application/json',
        'revision': '2024-07-15'
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email: email,
            subscriptions: {
              email: {
                marketing: {
                  consent: 'SUBSCRIBED',
                },
              },
            },
          },
          relationships: {
            lists: {
              data: [
                {
                  type: 'list',
                  id: KLAVIYO_LIST_ID
                }
              ]
            }
          }
        }
      })
    });
    
    // Klaviyo returns 202 Accepted on success for this endpoint
    if (!response.ok && response.status !== 202) {
        const errorData = await response.json();
        console.error("Klaviyo API Error:", JSON.stringify(errorData, null, 2));
        // Extract a user-friendly error message if available
        const errorMessage = errorData.errors?.[0]?.detail || 'Could not subscribe to the newsletter.';
        return NextResponse.json({ message: errorMessage }, { status: response.status });
    }

    return NextResponse.json({ message: 'Successfully subscribed to the newsletter.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
