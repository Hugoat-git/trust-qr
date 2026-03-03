import { supabaseAdmin } from '@/lib/supabase';
import { getLatestReviews } from '@/lib/google-places';
import { hasNewGBPReview } from '@/lib/google-business';
import { sendVoucherEmail, sendEmail, sendUpgradeEmail } from '@/lib/email';
import { FREE_PLAN_LIMIT } from '@/lib/branding';

// Durée max avant expiration (24 heures)
const EXPIRATION_HOURS = 24;

interface RestaurantData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  google_place_id: string | null;
  confirmed_reviews_count: number;
  user_id: string | null;
  prizes: { emoji: string; value: number }[];
  // GBP OAuth fields
  google_refresh_token?: string | null;
  google_access_token?: string | null;
  google_token_expiry?: string | null;
  google_account_name?: string | null;
  google_location_name?: string | null;
}

interface PendingParticipant {
  id: string;
  email: string;
  first_name: string;
  prize_value: number;
  prize_label: string;
  voucher_code: string;
  voucher_expires_at: string;
  initial_review_count: number | null;
  initial_latest_review_time: number | null;
  review_clicked_at: string | null;
  created_at: string;
  restaurant: RestaurantData | null;
}

/**
 * Vérifie les avis en attente pour un restaurant donné
 * Appelé automatiquement lors de chaque participation
 */
export async function verifyPendingReviews(restaurantId?: string) {
  try {
    // Construire la requête
    let query = supabaseAdmin
      .from('participants')
      .select(`
        id,
        email,
        first_name,
        prize_value,
        prize_label,
        voucher_code,
        voucher_expires_at,
        initial_review_count,
        initial_latest_review_time,
        review_clicked_at,
        created_at,
        restaurant:restaurants (
          id,
          name,
          slug,
          logo_url,
          primary_color,
          google_place_id,
          confirmed_reviews_count,
          user_id,
          prizes,
          google_refresh_token,
          google_access_token,
          google_token_expiry,
          google_account_name,
          google_location_name
        )
      `)
      .eq('review_status', 'pending');

    // Si un restaurant spécifique est fourni, filtrer
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data: pendingData, error: fetchError } = await query;

    if (fetchError || !pendingData || pendingData.length === 0) {
      return { checked: 0, verified: 0, expired: 0 };
    }

    const pendingParticipants = pendingData as PendingParticipant[];
    const results = { checked: 0, verified: 0, expired: 0 };

    // Grouper par restaurant pour optimiser les appels API
    const participantsByRestaurant = new Map<string, PendingParticipant[]>();

    for (const participant of pendingParticipants) {
      const restId = participant.restaurant?.id;
      if (!restId) continue;

      if (!participantsByRestaurant.has(restId)) {
        participantsByRestaurant.set(restId, []);
      }
      participantsByRestaurant.get(restId)!.push(participant);
    }

    // Pour chaque restaurant, vérifier les avis actuels
    for (const [restId, participants] of participantsByRestaurant) {
      const restaurant = participants[0].restaurant;

      if (!restaurant?.google_place_id) {
        continue;
      }

      // Utiliser GBP si tokens disponibles (temps réel), sinon Places API (avec cache potentiel)
      const hasGBP = !!(restaurant.google_refresh_token && restaurant.google_location_name);

      // Pour GBP : on vérifie participant par participant (car async avec token refresh)
      // Pour Places API : on fetch les reviews une seule fois pour tout le restaurant
      let placesReviews: Awaited<ReturnType<typeof getLatestReviews>> = null;

      if (!hasGBP) {
        placesReviews = await getLatestReviews(restaurant.google_place_id);
        if (placesReviews === null) {
          continue;
        }
      }

      const checkHasNewReview = async (participant: PendingParticipant): Promise<boolean> => {
        if (hasGBP && participant.review_clicked_at) {
          // GBP path: cherche un avis postérieur à review_clicked_at (avec buffer de 5 min)
          const sinceIso = new Date(
            new Date(participant.review_clicked_at).getTime() - 5 * 60 * 1000
          ).toISOString();

          try {
            return await hasNewGBPReview(
              {
                id: restaurant.id,
                google_access_token: restaurant.google_access_token ?? null,
                google_refresh_token: restaurant.google_refresh_token ?? null,
                google_token_expiry: restaurant.google_token_expiry ?? null,
                google_account_name: restaurant.google_account_name ?? null,
                google_location_name: restaurant.google_location_name ?? null,
              },
              sinceIso
            );
          } catch (gbpError) {
            console.error(`GBP check failed for restaurant ${restaurant.id}, falling back to Places API:`, gbpError);
            // Fallback: try Places API
            if (!placesReviews && restaurant.google_place_id) {
              placesReviews = await getLatestReviews(restaurant.google_place_id);
            }
          }
        }

        // Places API path (or GBP fallback)
        if (!placesReviews) return false;

        const threshold = participant.initial_latest_review_time
          ?? (participant.review_clicked_at
            ? Math.floor(new Date(participant.review_clicked_at).getTime() / 1000) - 300
            : null);

        if (threshold === null) return false;
        return placesReviews.some(r => r.time > threshold);
      };

      // Vérifier chaque participant
      for (const participant of participants) {
        results.checked++;

        const createdAt = new Date(participant.created_at);
        const now = new Date();
        const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        // Vérifier si un nouvel avis est apparu (GBP ou Places API)
        if (await checkHasNewReview(participant)) {
          try {
            // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
            await (supabaseAdmin.from('participants') as any)
              .update({
                review_status: 'verified',
                review_verified: true,
                review_verified_at: new Date().toISOString(),
              })
              .eq('id', participant.id);

            const prizes = restaurant.prizes || [];
            const prizeEmoji = prizes.find(p => p.value === participant.prize_value)?.emoji || '🎁';

            await sendVoucherEmail({
              to: participant.email,
              firstName: participant.first_name,
              restaurantName: restaurant.name,
              restaurantLogo: restaurant.logo_url,
              primaryColor: restaurant.primary_color,
              prizeLabel: participant.prize_label,
              prizeEmoji: prizeEmoji,
              voucherCode: participant.voucher_code,
              expiresAt: participant.voucher_expires_at,
            });

            results.verified++;

            // Incrémenter le compteur d'avis confirmés du restaurant
            // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
            const { data: updatedRestaurant } = await (supabaseAdmin.from('restaurants') as any)
              .update({ confirmed_reviews_count: (restaurant.confirmed_reviews_count || 0) + 1 })
              .eq('id', restId)
              .select('confirmed_reviews_count')
              .single();

            // Mettre à jour le compteur local pour les prochains participants du même batch
            if (updatedRestaurant) {
              restaurant.confirmed_reviews_count = updatedRestaurant.confirmed_reviews_count;
            }

            // Envoyer l'email d'upgrade quand on atteint exactement la limite
            if (updatedRestaurant?.confirmed_reviews_count === FREE_PLAN_LIMIT && restaurant.user_id) {
              // Récupérer l'email du propriétaire
              const { data: ownerData } = await supabaseAdmin.auth.admin.getUserById(restaurant.user_id);
              if (ownerData?.user?.email) {
                await sendUpgradeEmail({
                  to: ownerData.user.email,
                  restaurantName: restaurant.name,
                  slug: restaurant.slug,
                });
              }
            }
          } catch (error) {
            console.error(`Error verifying participant ${participant.id}:`, error);
          }
        } else if (hoursElapsed >= EXPIRATION_HOURS) {
          try {
            // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
            await (supabaseAdmin.from('participants') as any)
              .update({
                review_status: 'expired',
              })
              .eq('id', participant.id);

            await sendEmail({
              to: participant.email,
              subject: `Votre participation chez ${restaurant.name} a expiré`,
              html: `
                <p>Bonjour ${participant.first_name},</p>
                <p>Malheureusement, nous n'avons pas pu vérifier votre avis Google dans les 24 heures.</p>
                <p>Votre participation a expiré et le code promo n'est plus disponible.</p>
                <p>N'hésitez pas à revenir chez ${restaurant.name} pour tenter votre chance à nouveau !</p>
              `,
              text: `Bonjour ${participant.first_name}, votre participation chez ${restaurant.name} a expiré.`,
            });

            results.expired++;
          } catch (error) {
            console.error(`Error expiring participant ${participant.id}:`, error);
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error('verifyPendingReviews error:', error);
    return { checked: 0, verified: 0, expired: 0 };
  }
}
