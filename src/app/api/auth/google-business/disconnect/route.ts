import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { disconnectGBP } from '@/lib/google-business';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/auth/google-business/disconnect
 * Body: { restaurantId: string }
 *
 * Revokes the GBP OAuth tokens and clears them from the DB.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { restaurantId } = await request.json();

    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId requis' }, { status: 400 });
    }

    // biome-ignore lint/suspicious/noExplicitAny: dynamic GBP columns
    const { data: restaurant } = await (supabaseAdmin.from('restaurants') as any)
      .select('id, user_id, google_access_token')
      .eq('id', restaurantId)
      .single();

    if (!restaurant || restaurant.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await disconnectGBP(restaurantId, restaurant.google_access_token ?? '');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('GBP disconnect error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
