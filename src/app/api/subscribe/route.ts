// Modificado por: Webmaster Freddy Poleo
import { NextRequest, NextResponse } from 'next/server';
import { enforceServerActionRateLimit } from '@/lib/server-rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await enforceServerActionRateLimit('newsletter-subscribe', 5, 60 * 60 * 1000);

    let body: { email?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: 'Solicitud no válida.' }, { status: 400 });
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Introduce un correo electrónico válido.' }, { status: 400 });
    }

    const apiKey = process.env.KLAVIYO_API_KEY;
    const listId = process.env.KLAVIYO_LIST_ID;
    if (!apiKey || !listId) {
      console.error('[NEWSLETTER] Faltan las variables de configuración de Klaviyo.');
      return NextResponse.json({ message: 'El servicio de suscripción no está disponible.' }, { status: 503 });
    }

    const response = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
      method: 'POST',
      headers: {
        Authorization: 'Klaviyo-API-Key ' + apiKey,
        accept: 'application/json',
        'content-type': 'application/json',
        revision: '2024-02-15',
      },
      body: JSON.stringify({
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            custom_source: 'Popper Online Website',
            profiles: {
              data: [{
                type: 'profile',
                attributes: {
                  email,
                  subscriptions: {
                    email: { marketing: { consent: 'SUBSCRIBED' } },
                  },
                },
              }],
            },
          },
          relationships: {
            list: { data: { type: 'list', id: listId } },
          },
        },
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 202) {
      return NextResponse.json({ message: '¡Gracias por suscribirte! Revisa tu bandeja de entrada.' });
    }

    const responseText = await response.text();
    let providerMessage = '';
    try {
      const parsed = JSON.parse(responseText);
      providerMessage = String(parsed?.errors?.[0]?.detail || '');
    } catch {
      providerMessage = '';
    }

    if (/already subscribed|duplicate profile/i.test(providerMessage)) {
      return NextResponse.json({ message: 'Este correo electrónico ya estaba suscrito.' });
    }

    console.error('[NEWSLETTER] Klaviyo rechazó la suscripción:', { status: response.status });
    return NextResponse.json(
      { message: 'No se pudo completar la suscripción. Inténtalo de nuevo más tarde.' },
      { status: response.status >= 500 ? 502 : 400 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'RATE_LIMITED') {
      return NextResponse.json({ message: 'Has realizado demasiados intentos. Prueba más tarde.' }, { status: 429 });
    }
    console.error('[NEWSLETTER] Error de suscripción:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ message: 'No se pudo completar la suscripción.' }, { status: 500 });
  }
}
