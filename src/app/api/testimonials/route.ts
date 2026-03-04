import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, restaurantName, city, message, rating } = body;

    if (!firstName || !restaurantName || !message) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    // Save to Supabase
    // biome-ignore lint/suspicious/noExplicitAny: testimonials not in generated types yet
    const { error: dbError } = await (supabaseAdmin as any).from('testimonials').insert({
      first_name: firstName,
      restaurant_name: restaurantName,
      city: city || null,
      message,
      rating: rating || null,
    });

    if (dbError) {
      console.error('Supabase error:', dbError);
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
    }

    // Notify admin by email
    const adminEmail = process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || 'hugo@trustqr.dev';
    await sendEmail({
      to: adminEmail,
      subject: `Nouveau témoignage — ${restaurantName}`,
      html: `
        <h2>Nouveau témoignage reçu</h2>
        <p><strong>Prénom :</strong> ${firstName}</p>
        <p><strong>Restaurant :</strong> ${restaurantName}</p>
        ${city ? `<p><strong>Ville :</strong> ${city}</p>` : ''}
        ${rating ? `<p><strong>Note :</strong> ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</p>` : ''}
        <p><strong>Message :</strong></p>
        <blockquote>${message}</blockquote>
        <p style="color:#888;font-size:12px">À approuver dans votre dashboard Supabase.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
