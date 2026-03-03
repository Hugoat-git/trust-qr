import { NextRequest, NextResponse } from 'next/server';
import { getReviewCount, getLatestReviews, resolvePlaceId } from '@/lib/google-places';
import { supabaseAdmin } from '@/lib/supabase';

interface RestaurantPlaceData {
  google_place_id: string | null;
  google_review_url: string | null;
  name: string | null;
  initial_review_count: number | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'restaurantId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select('google_place_id, google_review_url, name, initial_review_count')
      .eq('id', restaurantId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    const restaurant = data as RestaurantPlaceData;
    let placeId = restaurant.google_place_id;

    // Si pas de place_id mais qu'on a le review URL, tenter de résoudre automatiquement
    if (!placeId && restaurant.google_review_url) {
      placeId = await resolvePlaceId(restaurant.google_review_url, restaurant.name || undefined);

      if (placeId) {
        // Sauvegarder le place_id pour la prochaine fois
        const updateData: Record<string, unknown> = { google_place_id: placeId };

        // Si pas de initial_review_count, le sauvegarder aussi
        if (restaurant.initial_review_count == null) {
          const initialCount = await getReviewCount(placeId);
          if (initialCount >= 0) {
            updateData.initial_review_count = initialCount;
          }
        }

        await (supabaseAdmin.from('restaurants') as any)
          .update(updateData)
          .eq('id', restaurantId);
      }
    }

    if (!placeId) {
      return NextResponse.json({
        reviewCount: -1,
        message: 'Google Place ID not configured and could not be resolved'
      });
    }

    // Fetch count + individual review timestamps in parallel
    const [reviewCount, latestReviews] = await Promise.all([
      getReviewCount(placeId),
      getLatestReviews(placeId),
    ]);

    // The most recent review's Unix timestamp (null if no reviews yet)
    const latestReviewTime = latestReviews && latestReviews.length > 0
      ? Math.max(...latestReviews.map(r => r.time))
      : null;

    return NextResponse.json({ reviewCount, latestReviewTime });
  } catch (error) {
    console.error('Error getting review count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
