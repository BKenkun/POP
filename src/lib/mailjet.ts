// Modificado por: Webmaster Freddy Poleo
'use server';

import type { Order } from '@/lib/types';
import { getAdminNotificationEmails } from '@/lib/admin';

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
  const fromEmail =
    process.env.MAILJET_FROM_EMAIL || 'info@comprarpopperonline.com';
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

    // Mailjet puede responder HTTP 200 aunque el mensaje tenga
    // un error de validación. Comprobamos también el estado del mensaje.
    let responseData: {
      Messages?: Array<{
        Status?: string;
        Errors?: Array<{ ErrorMessage?: string; ErrorCode?: string }>;
        To?: Array<{ MessageID?: string; MessageUUID?: string; Message?: string }>;
      }>;
    } | null = null;

    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      console.error('[MAILJET] La respuesta no contiene JSON válido.', {
        status: response.status,
        to: to.email,
        subject,
      });
      return {
        success: false,
        simulated: false,
        status: response.status,
        error: 'Mailjet devolvió una respuesta que no se pudo interpretar.',
      };
    }

    const messages = responseData?.Messages;
    const messageStatuses = messages?.map((message) => message.Status) ?? [];
    const failedMessage = messages?.find(
      (message) => message.Status?.toLowerCase() !== 'success'
    );

    if (!messages?.length || failedMessage) {
      const providerError = failedMessage?.Errors
        ?.map((item) => item.ErrorMessage || item.ErrorCode)
        .filter(Boolean)
        .join('; ');

      console.error('[MAILJET] El mensaje no fue aceptado por Mailjet.', {
        status: response.status,
        messageStatuses,
        providerError,
        to: to.email,
        subject,
      });

      return {
        success: false,
        simulated: false,
        status: response.status,
        error: providerError || 'Mailjet no confirmó el envío del mensaje.',
      };
    }

    console.log('[MAILJET] Mailjet aceptó el email para procesamiento:', {
      to: to.email,
      subject,
      status: response.status,
      messageStatuses,
      messageIds: messages.flatMap((message) =>
        (message.To ?? []).map((recipient) => recipient.MessageID).filter(Boolean)
      ),
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
  const safeCustomerName = order.customerName || 'Cliente';
  const safeItems = Array.isArray(order.items) ? order.items : [];

  const amount = ((Number(order.total) || 0) / 100)
    .toFixed(2)
    .replace('.', ',');

  const items = safeItems
    .map(
      (item) =>
        `${item.quantity} x ${item.name}`
    )
    .join('\n');

  return sendMailjetEmail({
    to: {
      email: order.customerEmail,
      name: safeCustomerName,
    },

    subject: `Compra confirmada #${orderId}`,

    textPart: `Hola ${safeCustomerName},

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
          Hola ${escapeHtml(safeCustomerName)},
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
          ${safeItems
            .map(
              (item) =>
                `<li>
                  ${item.quantity} x
                  ${escapeHtml(String(item.name || 'Producto'))}
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
 * Notificación automática de nueva compra confirmada para todos los administradores.
 */
export async function sendAdminNewOrderEmail(
  order: Order
): Promise<MailjetResult> {
  const adminEmails = getAdminNotificationEmails();
  if (!adminEmails.length) {
    return {
      success: true,
      simulated: false,
    };
  }

  const orderId = order.id;
  const safeCustomerName = order.customerName || 'Cliente';
  const safeCustomerEmail = order.customerEmail || 'Sin email';
  const isGuest = order.userId === 'guest' || Boolean((order as Record<string, any>).isGuest);
  const safeItems = Array.isArray(order.items) ? order.items : [];

  const formatCents = (cents: number) =>
    ((Number(cents) || 0) / 100).toFixed(2).replace('.', ',');

  const totalFormatted = formatCents(order.total);
  const shippingFormatted = order.shippingFree
    ? 'Gratis (0,00 €)'
    : `${formatCents(order.shippingCost || 0)} €`;
  const carrierDetail = order.packlink?.carrierName
    ? `${order.packlink.carrierName}${order.packlink.serviceName ? ` - ${order.packlink.serviceName}` : ''}`
    : 'Estándar';

  const couponObj = (order as Record<string, any>).coupon as
    | { code?: string; discount?: number; discountType?: string }
    | undefined;
  const couponLine = couponObj?.code
    ? `${couponObj.code}${
        couponObj.discountType === 'free_shipping'
          ? ' (Envío gratis)'
          : couponObj.discount
          ? ` (-${formatCents(couponObj.discount)} €)`
          : ''
      }`
    : null;

  const addr = order.shippingAddress;
  const addressParts = [
    addr?.line1,
    addr?.line2,
    [addr?.postal_code, addr?.city].filter(Boolean).join(' '),
    addr?.state ? `(${addr.state})` : null,
    addr?.country,
  ].filter(Boolean);
  const fullAddress = addressParts.length ? addressParts.join(', ') : 'No especificada';
  const phone = addr?.phone || 'No indicado';

  const appBaseUrl = (
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://comprarpopperonline.com'
  ).replace(/\/$/, '');
  const resolvedPath =
    order.path || `users/${order.userId || 'guest'}/orders/${orderId}`;
  const adminOrderUrl = `${appBaseUrl}/admin/orders/${encodeURIComponent(
    orderId
  )}?path=${encodeURIComponent(resolvedPath)}`;

  const itemsText = safeItems.length
    ? safeItems
        .map(
          (item) =>
            `- ${item.quantity} x ${item.name || 'Producto'} (${formatCents(
              item.price
            )} € c/u -> ${formatCents(item.price * item.quantity)} €)`
        )
        .join('\n')
    : '- Sin desglose de artículos';

  const subject = `Nuevo pedido pagado #${orderId} — ${totalFormatted} € (${safeCustomerName})`;

  const textPart = `Nuevo pedido pagado y listo para preparar.

Pedido: #${orderId}
Total cobrado: ${totalFormatted} €
Envío: ${shippingFormatted} (${carrierDetail})${couponLine ? `\nCupón aplicado: ${couponLine}` : ''}

DATOS DEL CLIENTE Y ENTREGA
Cliente: ${safeCustomerName} (${isGuest ? 'Invitado' : 'Registrado'})
Email: ${safeCustomerEmail}
Teléfono: ${phone}
Dirección: ${fullAddress}

PRODUCTOS
${itemsText}

Gestionar pedido en el panel:
${adminOrderUrl}`;

  const htmlPart = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 640px; margin: 0 auto;">
      <div style="background: #111827; color: #ffffff; padding: 16px 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 18px;">Nuevo pedido pagado</h2>
        <p style="margin: 4px 0 0; font-size: 13px; color: #d1d5db;">#${escapeHtml(orderId)}</p>
      </div>

      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
        <p style="margin-top: 0; font-size: 16px;">
          <strong>Total cobrado:</strong>
          <span style="color: #059669; font-weight: bold;">${totalFormatted} €</span>
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; width: 140px;">Cliente:</td>
            <td style="padding: 6px 0;"><strong>${escapeHtml(safeCustomerName)}</strong> (${isGuest ? 'Invitado' : 'Registrado'})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Email:</td>
            <td style="padding: 6px 0;">${escapeHtml(safeCustomerEmail)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Teléfono:</td>
            <td style="padding: 6px 0;">${escapeHtml(String(phone))}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Dirección:</td>
            <td style="padding: 6px 0;">${escapeHtml(fullAddress)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Envío:</td>
            <td style="padding: 6px 0;">${escapeHtml(shippingFormatted)} — ${escapeHtml(carrierDetail)}</td>
          </tr>
          ${
            couponLine
              ? `<tr>
                  <td style="padding: 6px 0; color: #6b7280;">Cupón:</td>
                  <td style="padding: 6px 0;">${escapeHtml(couponLine)}</td>
                </tr>`
              : ''
          }
        </table>

        <h3 style="font-size: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Productos del pedido</h3>
        <ul style="padding-left: 18px; margin-bottom: 20px; font-size: 14px;">
          ${safeItems
            .map(
              (item) =>
                `<li style="margin-bottom: 6px;">
                  <strong>${item.quantity} x ${escapeHtml(String(item.name || 'Producto'))}</strong>
                  — ${formatCents(item.price)} € c/u (<strong>${formatCents(item.price * item.quantity)} €</strong>)
                </li>`
            )
            .join('')}
        </ul>

        <div style="margin-top: 24px;">
          <a
            href="${escapeHtml(adminOrderUrl)}"
            style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: bold; font-size: 14px;"
          >
            Ver pedido en el Panel de Administración
          </a>
        </div>
      </div>
    </div>
  `;

  const results = await Promise.allSettled(
    adminEmails.map((email) =>
      sendMailjetEmail({
        to: { email, name: 'Administración' },
        subject,
        textPart,
        htmlPart,
      })
    )
  );

  const anySuccess = results.some(
    (r) => r.status === 'fulfilled' && r.value.success
  );
  const firstFailure = results.find(
    (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
  );

  if (!anySuccess && firstFailure) {
    const errMsg =
      firstFailure.status === 'rejected'
        ? firstFailure.reason instanceof Error
          ? firstFailure.reason.message
          : String(firstFailure.reason)
        : firstFailure.value.error || 'No se pudo enviar la notificación a los administradores.';
    return {
      success: false,
      simulated: false,
      error: errMsg,
    };
  }

  return {
    success: true,
    simulated: false,
  };
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
