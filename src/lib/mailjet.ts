'use server';

import type { Order } from '@/lib/types';

interface MailjetRecipient {
  email: string;
  name?: string;
}

interface SendMailjetEmailParams {
  to: MailjetRecipient;
  subject: string;
  textPart: string;
  htmlPart: string;
}

interface MailjetResult {
  success: boolean;
  simulated: boolean;
  error?: string;
  status?: number;
}

/**
 * Envío transaccional por Mailjet.
 *
 * IMPORTANTE:
 * Si Mailjet no está configurado, NO se simula un envío exitoso.
 * Se devuelve success: false para poder detectar el problema.
 */
export async function sendMailjetEmail({
  to,
  subject,
  textPart,
  htmlPart,
}: SendMailjetEmailParams): Promise<MailjetResult> {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const fromEmail = process.env.MAILJET_FROM_EMAIL;
  const fromName =
    process.env.MAILJET_FROM_NAME || 'Comprar Popper Online';

  // ---------------------------------------------------------
  // VALIDACIÓN DE CONFIGURACIÓN
  // ---------------------------------------------------------

  if (!apiKey || !secretKey || !fromEmail) {
    console.error('[MAILJET] Configuración incompleta.', {
      to: to.email,
      subject,
      hasApiKey: Boolean(apiKey),
      hasSecretKey: Boolean(secretKey),
      hasFromEmail: Boolean(fromEmail),
    });

    return {
      success: false,
      simulated: false,
      error: 'Mailjet no está configurado completamente.',
    };
  }

  // ---------------------------------------------------------
  // VALIDACIÓN DEL DESTINATARIO
  // ---------------------------------------------------------

  if (!to.email || !to.email.includes('@')) {
    console.error('[MAILJET] Email del destinatario inválido:', to.email);

    return {
      success: false,
      simulated: false,
      error: 'El email del destinatario no es válido.',
    };
  }

  // ---------------------------------------------------------
  // AUTENTICACIÓN MAILJET
  // ---------------------------------------------------------

  const auth = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');

  try {
    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: fromEmail,
              Name: fromName,
            },
            To: [
              {
                Email: to.email,
                Name: to.name || to.email,
              },
            ],
            Subject: subject,
            TextPart: textPart,
            HTMLPart: htmlPart,
          },
        ],
      }),
    });

    const responseText = await response.text();

    // -------------------------------------------------------
    // ERROR MAILJET
    // -------------------------------------------------------

    if (!response.ok) {
      console.error('[MAILJET] Error HTTP:', {
        status: response.status,
        response: responseText,
        to: to.email,
        subject,
      });

      return {
        success: false,
        simulated: false,
        status: response.status,
        error: `Mailjet respondió con HTTP ${response.status}.`,
      };
    }

    // -------------------------------------------------------
    // ÉXITO
    // -------------------------------------------------------

    console.log('[MAILJET] Email enviado correctamente:', {
      to: to.email,
      subject,
      status: response.status,
    });

    return {
      success: true,
      simulated: false,
      status: response.status,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido de Mailjet';

    console.error('[MAILJET] Error de red:', message);

    return {
      success: false,
      simulated: false,
      error: message,
    };
  }
}

/**
 * Email de confirmación de compra.
 */
export async function sendOrderReceivedEmail(
  order: Order
): Promise<MailjetResult> {
  const orderId = order.id;

  const amount = (order.total / 100)
    .toFixed(2)
    .replace('.', ',');

  const items = order.items
    .map(
      (item) =>
        `${item.quantity} x ${item.name}`
    )
    .join('\n');

  return sendMailjetEmail({
    to: {
      email: order.customerEmail,
      name: order.customerName,
    },

    subject: `Compra confirmada #${orderId}`,

    textPart: `Hola ${order.customerName},

Hemos confirmado tu compra #${orderId}.

Total: ${amount} €

${items}

Gracias por tu compra.`,

    htmlPart: `
      <div
        style="
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #222;
        "
      >
        <h2>Compra confirmada</h2>

        <p>
          Hola ${escapeHtml(order.customerName)},
        </p>

        <p>
          Hemos confirmado tu compra
          <strong>#${escapeHtml(orderId)}</strong>.
        </p>

        <p>
          <strong>Total:</strong>
          ${amount} €
        </p>

        <h3>Productos</h3>

        <ul>
          ${order.items
            .map(
              (item) =>
                `<li>
                  ${item.quantity} x
                  ${escapeHtml(item.name)}
                </li>`
            )
            .join('')}
        </ul>

        <p>
          Gracias por tu compra.
        </p>
      </div>
    `,
  });
}

/**
 * Email relacionado con el estado de una suscripción.
 */
export async function sendSubscriptionStatusEmail(
  order: Order,
  status: 'active' | 'past_due' | 'cancelled'
): Promise<MailjetResult> {
  const subjects = {
    active: 'Suscripción Club Dosis activada',
    past_due: 'Problema con el pago de tu suscripción',
    cancelled: 'Suscripción Club Dosis cancelada',
  } as const;

  const messages = {
    active:
      'Tu suscripción está activa y el pago ha sido confirmado.',

    past_due:
      'No hemos podido confirmar el último pago de tu suscripción. Revisa el método de pago.',

    cancelled:
      'Tu suscripción ha sido cancelada.',
  } as const;

  return sendMailjetEmail({
    to: {
      email: order.customerEmail,
      name: order.customerName,
    },

    subject: subjects[status],

    textPart: `Hola ${order.customerName},

${messages[status]}

Pedido: ${order.id}`,

    htmlPart: `
      <div
        style="
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #222;
        "
      >
        <h2>${escapeHtml(subjects[status])}</h2>

        <p>
          Hola ${escapeHtml(order.customerName)},
        </p>

        <p>
          ${escapeHtml(messages[status])}
        </p>

        <p>
          Pedido:
          <strong>#${escapeHtml(order.id)}</strong>
        </p>
      </div>
    `,
  });
}

/**
 * Escapa caracteres HTML para evitar inyección
 * en los emails generados.
 */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
