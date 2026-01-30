interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface MailgunResponse {
  id: string;
  message: string;
}

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'sandboxa4174323d84043ab80b3f46713d7e5fa.mailgun.org';
const MAILGUN_FROM = process.env.MAILGUN_FROM || `QR Fidélité <postmaster@${MAILGUN_DOMAIN}>`;
const MAILGUN_BASE_URL = process.env.MAILGUN_BASE_URL || 'https://api.mailgun.net';

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<MailgunResponse | null> {
  if (!MAILGUN_API_KEY) {
    console.log('MAILGUN_API_KEY not configured, skipping email');
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('from', MAILGUN_FROM);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('html', html);
    if (text) {
      formData.append('text', text);
    }

    const response = await fetch(
      `${MAILGUN_BASE_URL}/v3/${MAILGUN_DOMAIN}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mailgun error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('Email sent successfully:', data.id);
    return data;
  } catch (error) {
    console.error('Mailgun error:', error);
    return null;
  }
}

interface VoucherEmailParams {
  to: string;
  firstName: string;
  restaurantName: string;
  restaurantLogo?: string | null;
  primaryColor: string;
  prizeLabel: string;
  prizeEmoji: string;
  voucherCode: string;
  expiresAt: string;
}

export async function sendVoucherEmail({
  to,
  firstName,
  restaurantName,
  restaurantLogo,
  primaryColor,
  prizeLabel,
  prizeEmoji,
  voucherCode,
  expiresAt,
}: VoucherEmailParams): Promise<MailgunResponse | null> {
  const expiryDate = new Date(expiresAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre bon de réduction</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 30px; text-align: center;">
              ${restaurantLogo ? `<img src="${restaurantLogo}" alt="${restaurantName}" style="max-width: 120px; max-height: 60px; margin-bottom: 10px;">` : ''}
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                ${restaurantName}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <p style="color: #666666; font-size: 16px; margin: 0 0 10px 0;">
                Félicitations ${firstName} !
              </p>
              <p style="color: #333333; font-size: 18px; margin: 0 0 30px 0; font-weight: 500;">
                Vous avez gagné
              </p>

              <!-- Prize -->
              <div style="background: linear-gradient(135deg, ${primaryColor}15, ${primaryColor}25); border-radius: 12px; padding: 30px; margin-bottom: 30px;">
                <span style="font-size: 48px; display: block; margin-bottom: 10px;">${prizeEmoji}</span>
                <span style="font-size: 32px; font-weight: 700; color: ${primaryColor};">
                  ${prizeLabel}
                </span>
              </div>

              <!-- Voucher Code -->
              <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                Votre code de réduction
              </p>
              <div style="background-color: #f8f8f8; border: 2px dashed ${primaryColor}; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <span style="font-family: monospace; font-size: 28px; font-weight: 700; letter-spacing: 3px; color: #333333;">
                  ${voucherCode}
                </span>
              </div>

              <p style="color: #999999; font-size: 13px; margin: 0;">
                Valable jusqu'au ${expiryDate}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #888888; font-size: 13px; margin: 0 0 5px 0;">
                Présentez ce code en caisse lors de votre prochaine visite
              </p>
              <p style="color: #aaaaaa; font-size: 11px; margin: 0;">
                Envoyé par QR Fidélité
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Félicitations ${firstName} !

Vous avez gagné ${prizeLabel} chez ${restaurantName}.

Votre code de réduction : ${voucherCode}

Valable jusqu'au ${expiryDate}.

Présentez ce code en caisse lors de votre prochaine visite.
  `.trim();

  return sendEmail({
    to,
    subject: `${prizeEmoji} Votre réduction ${restaurantName} - ${prizeLabel}`,
    html,
    text,
  });
}
