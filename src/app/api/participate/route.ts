import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendVoucherEmail } from '@/lib/mailgun';
import { weightedRandom, generateVoucherCode, getExpiryDate } from '@/lib/utils';
import type { Prize } from '@/types';
import type { Database } from '@/types/database';

type RestaurantRow = Database['public']['Tables']['restaurants']['Row'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, email, firstName, phone } = body;

    // 1. Valider les données
    if (!restaurantId || !email || !firstName) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // 2. Récupérer le restaurant
    const { data, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, slug, logo_url, primary_color, prizes, voucher_validity_days, google_review_url')
      .eq('id', restaurantId)
      .eq('is_active', true)
      .single();

    if (restaurantError || !data) {
      return NextResponse.json(
        { error: 'Restaurant non trouvé ou inactif' },
        { status: 404 }
      );
    }

    const restaurant = data as Pick<RestaurantRow, 'id' | 'name' | 'slug' | 'logo_url' | 'primary_color' | 'prizes' | 'voucher_validity_days' | 'google_review_url'>;

    // 3. Vérifier si email existe déjà pour ce resto
    const { data: existingParticipant } = await supabaseAdmin
      .from('participants')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .ilike('email', email)
      .single();

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'Vous avez déjà participé avec cet email' },
        { status: 409 }
      );
    }

    // 4. Calculer le lot gagné (tirage pondéré)
    const prizes = (typeof restaurant.prizes === 'string'
      ? JSON.parse(restaurant.prizes)
      : restaurant.prizes) as Prize[];

    const wonPrize = weightedRandom(prizes);

    // 5. Générer code unique
    const voucherCode = generateVoucherCode();

    // 6. Calculer date expiration
    const validityDays = (restaurant.voucher_validity_days as number) || 30;
    const expiresAt = getExpiryDate(validityDays);

    // Récupérer IP et User Agent
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 7. Insérer en DB
    // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue with Insert type
    const { data: participant, error: insertError } = await (supabaseAdmin.from('participants') as any)
      .insert([
        {
          restaurant_id: restaurantId,
          email: email.toLowerCase().trim(),
          first_name: firstName.trim(),
          phone: phone?.trim() || null,
          prize_value: wonPrize.value,
          prize_label: wonPrize.label,
          voucher_code: voucherCode,
          voucher_expires_at: expiresAt.toISOString(),
          ip_address: ip,
          user_agent: userAgent,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement" },
        { status: 500 }
      );
    }

    // 8. Envoyer l'email avec Mailgun
    try {
      await sendVoucherEmail({
        to: email.toLowerCase().trim(),
        firstName: firstName.trim(),
        restaurantName: restaurant.name,
        restaurantLogo: restaurant.logo_url,
        primaryColor: restaurant.primary_color,
        prizeLabel: wonPrize.label,
        prizeEmoji: wonPrize.emoji,
        voucherCode: voucherCode,
        expiresAt: expiresAt.toISOString(),
      });
    } catch (emailError) {
      // Log l'erreur mais ne bloque pas la participation
      console.error('Email error (non-blocking):', emailError);
    }

    // 9. Optionnel: Trigger webhook n8n (pour intégrations CRM, etc.)
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (webhookUrl && webhookUrl !== 'https://ton-n8n.onrender.com/webhook/xxx') {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            firstName: firstName.trim(),
            phone: phone?.trim() || null,
            prizeValue: wonPrize.value,
            prizeLabel: wonPrize.label,
            prizeEmoji: wonPrize.emoji,
            voucherCode: voucherCode,
            expiresAt: expiresAt.toISOString(),
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            restaurantSlug: restaurant.slug,
            participatedAt: new Date().toISOString(),
          }),
        });
        console.log('Webhook n8n triggered successfully');
      } catch (webhookError) {
        console.error('Webhook n8n error (non-blocking):', webhookError);
      }
    }

    // 10. Retourner résultat
    return NextResponse.json({
      success: true,
      participantId: participant?.id,
      prizeValue: wonPrize.value,
      prizeLabel: wonPrize.label,
      prizeEmoji: wonPrize.emoji,
      voucherCode: voucherCode,
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('Participation error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
