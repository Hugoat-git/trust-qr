import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/mailgun';
import type { Prize } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      restaurantId,
      name,
      logoUrl,
      primaryColor,
      googleReviewUrl,
      voucherValidityDays,
      prizes,
      userEmail,
      isFirstSetup,
    } = body;

    // Validation
    if (!restaurantId || !name || !googleReviewUrl) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Validate prizes
    const parsedPrizes = prizes as Prize[];
    const totalProbability = parsedPrizes.reduce((sum, p) => sum + p.probability, 0);
    if (totalProbability !== 100) {
      return NextResponse.json(
        { error: `Les probabilités doivent totaliser 100% (actuellement ${totalProbability}%)` },
        { status: 400 }
      );
    }

    // Get current restaurant to check if this is first activation
    const response = await supabaseAdmin
      .from('restaurants')
      .select('is_active, slug')
      .eq('id', restaurantId)
      .single();

    // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference workaround
    const currentRestaurant = response.data as any;
    const wasInactive = currentRestaurant && !currentRestaurant.is_active;

    // Update restaurant
    // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference workaround
    const { error: updateError } = await (supabaseAdmin
      .from('restaurants') as any)
      .update({
        name: name.trim(),
        logo_url: logoUrl?.trim() || null,
        primary_color: primaryColor,
        google_review_url: googleReviewUrl.trim(),
        voucher_validity_days: voucherValidityDays,
        prizes: parsedPrizes,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', restaurantId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    // Send welcome email if this is the first setup
    if (isFirstSetup && userEmail && currentRestaurant?.slug) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qr-fidelite.vercel.app';
        await sendWelcomeEmail({
          to: userEmail,
          restaurantName: name.trim(),
          slug: currentRestaurant.slug,
          adminUrl: `${appUrl}/admin/${currentRestaurant.slug}`,
        });
        console.log('Welcome email sent to:', userEmail);
      } catch (emailError) {
        // Don't block the request if email fails
        console.error('Welcome email error (non-blocking):', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: wasInactive ? 'Restaurant activé avec succès !' : 'Restaurant mis à jour !',
    });

  } catch (error) {
    console.error('Restaurant update error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
