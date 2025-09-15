
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
    if (process.env.NODE_ENV === 'development') {
       return NextResponse.json({ message: 'Subscription successful (simulation).' });
    }
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const response = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
      method: 'POST',
      headers: {
        Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        accept: 'application/json',
        'content-type': 'application/json',
        revision: '2024-02-15',
      },
      body: JSON.stringify({
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            list_id: KLAVIYO_LIST_ID,
            // The key is 'profiles', not 'subscriptions' for this endpoint
            profiles: [
              {
                email: email,
                subscriptions: {
                    email: {
                        marketing: {
                            consent: "SUBSCRIBED"
                        }
                    }
                }
              },
            ],
          },
        },
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Klaviyo API Error:", JSON.stringify(errorData, null, 2));
        const errorMessage = errorData.errors?.[0]?.detail || 'Could not subscribe to the newsletter.';
        return NextResponse.json({ message: errorMessage }, { status: response.status });
    }
    
    // The API returns a 202 Accepted response on success
    return NextResponse.json({ message: 'Subscription request accepted.' }, { status: 202 });

  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
