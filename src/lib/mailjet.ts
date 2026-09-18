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

/**
 * Envío transaccional por Mailjet.
 * Si las variables no están configuradas, simula el envío y no rompe el pedido.
 */
export async function sendMailjetEmail({
  to,
  subject,
  textPart,
  htmlPart,
}: SendMailjetEmailParams) {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const fromEmail = process.env.MAILJET_FROM_EMAIL;
  const fromName = process.env.MAILJET_FROM_NAME || 'Comprar Popper Online';

  if (!apiKey || !secretKey || !fromEmail) {
    console.warn('[MAILJET] Configuración incompleta. Envío simulado.', {
      to: to.email,
      subject,
      hasApiKey: !!apiKey,
      hasSecretKey: !!secretKey,
      hasFromEmail: !!fromEmail,
    });
    return { success: true, simulated: true };
  }

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
            From: { Email: fromEmail, Name: fromName },
            To: [{ Email: to.email, Name: to.name || to.email }],
            Subject: subject,
            TextPart: textPart,
            HTMLPart: htmlPart,
          },
        ],
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('[MAILJET] Error HTTP', response.status, responseText);
      return { success: false, simulated: false, error: `Mailjet ${response.status}` };
    }

    console.log('[MAILJET] Email enviado correctamente a', to.email);
    return { success: true, simulated: false };
  } catch (error: any) {
    console.error('[MAILJET] Error de red:', error?.message || error);
    return { success: false, simulated: false, error: error?.message || 'Mailjet error' };
  }
}

export async function sendOrderReceivedEmail(order: Order) {
  const orderId = order.id;
  const amount = (order.total / 100).toFixed(2).replace('.', ',');
  const items = order.items
    .map((item) => `${item.quantity} x ${item.name}`)
    .join('\n');

  return sendMailjetEmail({
    to: { email: order.customerEmail, name: order.customerName },
    subject: `Compra confirmada #${orderId}`,
    textPart: `Hola ${order.customerName},\n\nHemos confirmado tu compra #${orderId}.\n\nTotal: ${amount} €\n\n${items}\n\nGracias por tu compra.`,
    htmlPart: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Compra confirmada</h2>
        <p>Hola ${escapeHtml(order.customerName)},</p>
        <p>Hemos confirmado tu compra <strong>#${escapeHtml(orderId)}</strong>.</p>
        <p><strong>Total:</strong> ${amount} €</p>
        <ul>${order.items
          .map((item) => `<li>${item.quantity} x ${escapeHtml(item.name)}</li>`)
          .join('')}</ul>
        <p>Gracias por tu compra.</p>
      </div>
    `,
  });
}

export async function sendSubscriptionStatusEmail(
  order: Order,
  status: 'active' | 'past_due' | 'cancelled'
) {
  const subjects = {
    active: 'Suscripción Club Dosis activada',
    past_due: 'Problema con el pago de tu suscripción',
    cancelled: 'Suscripción Club Dosis cancelada',
  } as const;

  const messages = {
    active: 'Tu suscripción está activa y el pago ha sido confirmado.',
    past_due: 'No hemos podido confirmar el último pago de tu suscripción. Revisa el método de pago.',
    cancelled: 'Tu suscripción ha sido cancelada.',
  } as const;

  return sendMailjetEmail({
    to: { email: order.customerEmail, name: order.customerName },
    subject: subjects[status],
    textPart: `Hola ${order.customerName},\n\n${messages[status]}\n\nPedido: ${order.id}`,
    htmlPart: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>${subjects[status]}</h2>
        <p>Hola ${escapeHtml(order.customerName)},</p>
        <p>${messages[status]}</p>
        <p>Pedido: <strong>#${escapeHtml(order.id)}</strong></p>
      </div>
    `,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
