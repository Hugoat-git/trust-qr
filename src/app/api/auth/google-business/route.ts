import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { buildOAuthUrl } from '@/lib/google-business';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/auth/google-business?restaurantId=xxx&slug=yyy
 *
 * Initiates the Google Business Profile OAuth2 flow.
 * Redirects the admin browser to Google's authorization page.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const slug = searchParams.get('slug');

    if (!restaurantId || !slug) {
      return NextResponse.json({ error: 'restaurantId et slug requis' }, { status: 400 });
    }

    // Verify the user owns this restaurant
    // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
    const { data: restaurant } = await (supabaseAdmin.from('restaurants') as any)
      .select('id, user_id')
      .eq('id', restaurantId)
      .single();

    const rest = restaurant as { id: string; user_id: string | null } | null;
    if (!rest || rest.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const authUrl = buildOAuthUrl(restaurantId, slug);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('GBP OAuth init error:', error);
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
