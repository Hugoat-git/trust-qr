import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || 'TrustQR <noreply@trustqr.dev>';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured, skipping email');
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return null;
    }

    console.log('Email sent successfully:', data?.id);
    return data;
  } catch (error) {
    console.error('Resend error:', error);
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
}: VoucherEmailParams) {
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
                Envoyé par TrustQR
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

// Email d'upgrade quand le restaurant atteint la limite freemium
interface UpgradeEmailParams {
  to: string;
  restaurantName: string;
  slug: string;
}

export async function sendUpgradeEmail({
  to,
  restaurantName,
  slug,
}: UpgradeEmailParams) {
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://trustqr.dev'}/admin/${slug}`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vous avez récupéré 6 avis Google !</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #b55933 0%, #a1887d 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                6 avis récupérés !
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <p style="color: #333333; font-size: 18px; margin: 0 0 16px 0; font-weight: 500;">
                Félicitations !
              </p>
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                <strong>${restaurantName}</strong> a récupéré <strong>6 avis Google</strong> grâce à TrustQR.
              </p>
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Passez au plan Pro pour continuer à améliorer votre réputation en ligne et attirer plus de clients.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" style="display: inline-block; background-color: #b55933; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Voir mon tableau de bord →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fafafa; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #aaaaaa; font-size: 11px; margin: 0;">
                TrustQR
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
Félicitations ! ${restaurantName} a récupéré 6 avis Google grâce à TrustQR.

Passez au plan Pro pour continuer à améliorer votre réputation en ligne.

Voir votre tableau de bord : ${adminUrl}
  `.trim();

  return sendEmail({
    to,
    subject: '🎉 6 avis récupérés — Passez au plan Pro !',
    html,
    text,
  });
}

// Email de bienvenue pour les restaurateurs
interface WelcomeEmailParams {
  to: string;
  restaurantName: string;
  slug: string;
  adminUrl: string;
}

export async function sendWelcomeEmail({
  to,
  restaurantName,
  slug,
  adminUrl,
}: WelcomeEmailParams) {
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://trustqr.dev'}/${slug}`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur TrustQR</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: white; border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px; font-weight: bold; color: #10b981;">QR</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                Bienvenue sur TrustQR !
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 18px; margin: 0 0 20px 0; font-weight: 500;">
                🎉 Félicitations pour la création de <strong>${restaurantName}</strong> !
              </p>

              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Votre compte est prêt. Voici les prochaines étapes pour commencer à collecter des avis Google et fidéliser vos clients :
              </p>

              <!-- Steps -->
              <div style="background-color: #f8fafb; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                  <div style="width: 32px; height: 32px; background-color: #10b981; border-radius: 50%; color: white; font-weight: bold; text-align: center; line-height: 32px; margin-right: 16px; flex-shrink: 0;">1</div>
                  <div>
                    <p style="margin: 0; font-weight: 600; color: #333;">Configurez votre restaurant</p>
                    <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">Ajoutez votre logo, définissez vos réductions et personnalisez les couleurs.</p>
                  </div>
                </div>

                <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                  <div style="width: 32px; height: 32px; background-color: #10b981; border-radius: 50%; color: white; font-weight: bold; text-align: center; line-height: 32px; margin-right: 16px; flex-shrink: 0;">2</div>
                  <div>
                    <p style="margin: 0; font-weight: 600; color: #333;">Ajoutez votre lien Google Avis</p>
                    <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">Connectez votre fiche Google Business pour recevoir les avis de vos clients.</p>
                  </div>
                </div>

                <div style="display: flex; align-items: flex-start;">
                  <div style="width: 32px; height: 32px; background-color: #10b981; border-radius: 50%; color: white; font-weight: bold; text-align: center; line-height: 32px; margin-right: 16px; flex-shrink: 0;">3</div>
                  <div>
                    <p style="margin: 0; font-weight: 600; color: #333;">Imprimez votre QR code</p>
                    <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">Placez-le à la caisse ou sur les tables pour que vos clients puissent participer.</p>
                  </div>
                </div>
              </div>

              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${adminUrl}" style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Accéder au tableau de bord →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Info Box -->
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-top: 20px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>💡 Astuce :</strong> Votre page publique est déjà accessible à l'adresse :<br>
                  <a href="${publicUrl}" style="color: #92400e;">${publicUrl}</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #888888; font-size: 14px; margin: 0 0 8px 0;">
                Une question ? Répondez à cet email, nous sommes là pour vous aider.
              </p>
              <p style="color: #aaaaaa; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} TrustQR - Tous droits réservés
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
Bienvenue sur TrustQR !

Félicitations pour la création de ${restaurantName} !

Votre compte est prêt. Voici les prochaines étapes :

1. Configurez votre restaurant - Ajoutez votre logo et personnalisez les couleurs.
2. Ajoutez votre lien Google Avis - Connectez votre fiche Google Business.
3. Imprimez votre QR code - Placez-le à la caisse ou sur les tables.

Accédez à votre tableau de bord : ${adminUrl}

Votre page publique : ${publicUrl}

Une question ? Répondez à cet email, nous sommes là pour vous aider.
  `.trim();

  return sendEmail({
    to,
    subject: '🎉 Bienvenue sur TrustQR - Votre compte est prêt !',
    html,
    text,
  });
}
