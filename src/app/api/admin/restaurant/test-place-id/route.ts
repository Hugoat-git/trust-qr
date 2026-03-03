import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getReviewCount, getLatestReviews, resolvePlaceId } from '@/lib/google-places';

/**
 * GET /api/admin/restaurant/test-place-id?placeId=ChIJ...
 * or  GET /api/admin/restaurant/test-place-id?reviewUrl=https://...&name=...
 *
 * Returns: { placeId, reviewCount, latestReviews: [{ time, rating, author_name }] }
 * Used by the admin Settings page to verify a Place ID before saving.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    let placeId = searchParams.get('placeId');
    const reviewUrl = searchParams.get('reviewUrl');
    const name = searchParams.get('name');

    // If no direct placeId, try to resolve from URL/name
    if (!placeId && reviewUrl) {
      placeId = await resolvePlaceId(reviewUrl, name || undefined);
    }

    if (!placeId) {
      return NextResponse.json({ error: 'Place ID introuvable. Vérifiez le lien ou entrez le Place ID manuellement.' }, { status: 404 });
    }

    const [reviewCount, latestReviews] = await Promise.all([
      getReviewCount(placeId),
      getLatestReviews(placeId),
    ]);

    if (reviewCount === -1) {
      return NextResponse.json({ error: 'Place ID invalide ou API Google non configurée.' }, { status: 400 });
    }

    return NextResponse.json({
      placeId,
      reviewCount,
      latestReviews: latestReviews?.slice(0, 5) ?? [],
    });
  } catch (error) {
    console.error('test-place-id error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
