import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';
import { resolvePlaceId, getReviewCount } from '@/lib/google-places';
import type { Prize } from '@/types';

// GET - Récupérer les infos d'un restaurant par slug
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug manquant' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, logo_url, google_review_url, primary_color')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ restaurant: data });
  } catch (error) {
    console.error('Restaurant fetch error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await request.json();
    const {
      restaurantId,
      name,
      logoUrl,
      primaryColor,
      googleReviewUrl,
      googlePlaceIdOverride,
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
      .select('is_active, slug, google_place_id, initial_review_count')
      .eq('id', restaurantId)
      .single();

    // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference workaround
    const currentRestaurant = response.data as any;
    const wasInactive = currentRestaurant && !currentRestaurant.is_active;

    // Use manual override if provided, otherwise auto-detect from review URL/name
    let googlePlaceId: string | null = null;
    if (googlePlaceIdOverride?.trim()) {
      googlePlaceId = googlePlaceIdOverride.trim();
    } else {
      try {
        googlePlaceId = await resolvePlaceId(googleReviewUrl.trim(), name.trim());
      } catch (err) {
        console.error('Error resolving place_id (non-blocking):', err);
      }
    }

    // Update restaurant
    // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference workaround
    const updateData: Record<string, unknown> = {
      name: name.trim(),
      logo_url: logoUrl?.trim() || null,
      primary_color: primaryColor,
      google_review_url: googleReviewUrl.trim(),
      voucher_validity_days: voucherValidityDays,
      prizes: parsedPrizes,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    // Only set google_place_id if we found one (don't erase existing)
    if (googlePlaceId) {
      updateData.google_place_id = googlePlaceId;

      // If this is the first time we resolve a place_id, save the initial review count
      const hadNoPlaceId = !currentRestaurant?.google_place_id;
      const hadNoInitialCount = currentRestaurant?.initial_review_count == null;
      if (hadNoPlaceId || hadNoInitialCount) {
        try {
          const initialCount = await getReviewCount(googlePlaceId);
          if (initialCount >= 0) {
            updateData.initial_review_count = initialCount;
          }
        } catch (err) {
          console.error('Error fetching initial review count (non-blocking):', err);
        }
      }
    }

    // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference workaround
    const { error: updateError } = await (supabaseAdmin
      .from('restaurants') as any)
      .update(updateData)
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
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trustqr.dev';
        await sendWelcomeEmail({
          to: userEmail,
          restaurantName: name.trim(),
          slug: currentRestaurant.slug,
          adminUrl: `${appUrl}/admin/${currentRestaurant.slug}`,
        });
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
