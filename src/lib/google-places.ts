const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

interface PlaceDetailsResponse {
  result?: {
    user_ratings_total?: number;
    rating?: number;
    reviews?: PlaceReview[];
  };
  status: string;
  error_message?: string;
}

export interface PlaceReview {
  time: number; // Unix timestamp
  rating: number;
  author_name: string;
  text?: string;
}

export async function getReviewCount(placeId: string): Promise<number> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('GOOGLE_PLACES_API_KEY not configured, skipping review verification');
    return -1; // -1 indicates API not configured
  }

  if (!placeId) {
    console.warn('No placeId provided');
    return -1;
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'user_ratings_total,rating');
    url.searchParams.set('key', GOOGLE_PLACES_API_KEY);

    const response = await fetch(url.toString());
    const data: PlaceDetailsResponse = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status, data.error_message);
      return -1;
    }

    return data.result?.user_ratings_total ?? 0;
  } catch (error) {
    console.error('Error fetching review count:', error);
    return -1;
  }
}

/**
 * Fetches the 5 most recent reviews with their timestamps.
 * Used for timestamp-based verification instead of count comparison.
 * Returns null if API is not configured or an error occurred.
 */
export async function getLatestReviews(placeId: string): Promise<PlaceReview[] | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('GOOGLE_PLACES_API_KEY not configured');
    return null;
  }

  if (!placeId) {
    console.warn('No placeId provided');
    return null;
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'reviews,user_ratings_total');
    url.searchParams.set('reviews_sort', 'newest');
    url.searchParams.set('key', GOOGLE_PLACES_API_KEY);

    const response = await fetch(url.toString());
    const data: PlaceDetailsResponse = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error (getLatestReviews):', data.status, data.error_message);
      return null;
    }

    return data.result?.reviews ?? [];
  } catch (error) {
    console.error('Error fetching latest reviews:', error);
    return null;
  }
}

export async function hasNewReview(placeId: string, initialCount: number): Promise<boolean> {
  const currentCount = await getReviewCount(placeId);

  // If API not configured or error, we can't verify
  if (currentCount === -1) {
    return false;
  }

  return currentCount > initialCount;
}

/**
 * Tente d'extraire le google place_id depuis une URL Google Review.
 * Formats supportes (par ordre de priorité) :
 * 1. https://search.google.com/local/writereview?placeid=ChIJxxxxx
 * 2. https://www.google.com/search?...&rldimm=<CID>  (Google Search avec CID)
 *    https://maps.google.com/?cid=<CID>
 * 3. https://g.page/r/CxxxxE/review (suit la redirection)
 * 4. Fallback: recherche via Google Places Find Place / Text Search API
 */
export async function resolvePlaceId(googleReviewUrl: string, restaurantName?: string): Promise<string | null> {
  if (!googleReviewUrl) return null;

  console.log('[resolvePlaceId] Trying to resolve:', googleReviewUrl, 'name:', restaurantName);

  // 1. Essayer d'extraire le placeid du query param
  try {
    const parsed = new URL(googleReviewUrl);
    const placeIdParam = parsed.searchParams.get('placeid');
    if (placeIdParam) {
      console.log('[resolvePlaceId] Found placeid in URL params:', placeIdParam);
      return placeIdParam;
    }
  } catch {
    // URL invalide, on continue
  }

  // 2. Extraire le CID (rldimm) depuis une URL Google Search ou Maps et appeler l'API Place Details
  // Ex: https://www.google.com/search?...&rldimm=580661146221068807...
  // Ex: https://maps.google.com/?cid=580661146221068807
  if (GOOGLE_PLACES_API_KEY) {
    try {
      const parsed = new URL(googleReviewUrl);
      const rldimm = parsed.searchParams.get('rldimm');
      const cid = parsed.searchParams.get('cid') || rldimm;

      if (cid) {
        console.log('[resolvePlaceId] Found CID in URL:', cid);
        const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
        detailsUrl.searchParams.set('cid', cid);
        detailsUrl.searchParams.set('fields', 'place_id,name');
        detailsUrl.searchParams.set('key', GOOGLE_PLACES_API_KEY);

        const detailsResponse = await fetch(detailsUrl.toString());
        const detailsData = await detailsResponse.json();

        if (detailsData.status === 'OK' && detailsData.result?.place_id) {
          console.log('[resolvePlaceId] Resolved place_id from CID:', detailsData.result.place_id, '(', detailsData.result.name, ')');
          return detailsData.result.place_id;
        }

        console.warn('[resolvePlaceId] CID lookup failed:', detailsData.status, detailsData.error_message);
      }
    } catch (err) {
      console.error('[resolvePlaceId] Error extracting CID:', err);
    }
  }

  // 4. Pour les URLs g.page/r/xxx, suivre la redirection pour obtenir l'URL canonique
  try {
    const parsed = new URL(googleReviewUrl);
    if (parsed.hostname === 'g.page' || parsed.hostname === 'goo.gl' || parsed.hostname === 'maps.app.goo.gl') {
      console.log('[resolvePlaceId] Following redirect for short URL...');
      const redirectResponse = await fetch(googleReviewUrl, { redirect: 'follow' });
      const finalUrl = redirectResponse.url;
      console.log('[resolvePlaceId] Redirected to:', finalUrl);

      // Extraire placeid de l'URL finale
      const finalParsed = new URL(finalUrl);
      const finalPlaceId = finalParsed.searchParams.get('placeid');
      if (finalPlaceId) {
        console.log('[resolvePlaceId] Found placeid in redirected URL:', finalPlaceId);
        return finalPlaceId;
      }

      // Extraire de l'URL Google Maps : /maps/place/xxx/data=...!1sChIJxxx...
      const ftidMatch = finalUrl.match(/!1s(0x[a-fA-F0-9]+:0x[a-fA-F0-9]+)/);
      if (ftidMatch) {
        // C'est un feature ID, on peut l'utiliser pour chercher le place_id
        console.log('[resolvePlaceId] Found ftid in URL:', ftidMatch[1]);
      }
    }
  } catch (err) {
    console.error('[resolvePlaceId] Error following redirect:', err);
  }

  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('[resolvePlaceId] GOOGLE_PLACES_API_KEY not set, cannot search');
    return null;
  }

  // 5. Essayer via Find Place from Text avec le nom du restaurant
  if (restaurantName) {
    try {
      console.log('[resolvePlaceId] Trying Find Place API with name:', restaurantName);
      const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
      url.searchParams.set('input', restaurantName);
      url.searchParams.set('inputtype', 'textquery');
      url.searchParams.set('fields', 'place_id,name');
      url.searchParams.set('key', GOOGLE_PLACES_API_KEY);

      const response = await fetch(url.toString());
      const data = await response.json();
      console.log('[resolvePlaceId] Find Place response:', data.status, data.candidates?.length ?? 0, 'candidates');

      if (data.status === 'OK' && data.candidates?.length > 0) {
        console.log('[resolvePlaceId] Found place_id:', data.candidates[0].place_id);
        return data.candidates[0].place_id;
      }

      if (data.status === 'REQUEST_DENIED') {
        console.error('[resolvePlaceId] API request denied:', data.error_message);
      }
    } catch (error) {
      console.error('[resolvePlaceId] Error with Find Place API:', error);
    }

    // 6. Fallback: Text Search API (plus permissive sur le nom)
    try {
      console.log('[resolvePlaceId] Trying Text Search API with name:', restaurantName);
      const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      url.searchParams.set('query', restaurantName + ' restaurant');
      url.searchParams.set('key', GOOGLE_PLACES_API_KEY);

      const response = await fetch(url.toString());
      const data = await response.json();
      console.log('[resolvePlaceId] Text Search response:', data.status, data.results?.length ?? 0, 'results');

      if (data.status === 'OK' && data.results?.length > 0) {
        console.log('[resolvePlaceId] Found place_id via Text Search:', data.results[0].place_id);
        return data.results[0].place_id;
      }

      if (data.status === 'REQUEST_DENIED') {
        console.error('[resolvePlaceId] Text Search API denied:', data.error_message);
      }
    } catch (error) {
      console.error('[resolvePlaceId] Error with Text Search API:', error);
    }
  }

  console.warn('[resolvePlaceId] Could not resolve place_id');
  return null;
}
