import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const defaultPrizes = [
  { value: 5, label: '-5%', emoji: '🎁', probability: 40 },
  { value: 10, label: '-10%', emoji: '🎉', probability: 30 },
  { value: 15, label: '-15%', emoji: '🔥', probability: 15 },
  { value: 20, label: '-20%', emoji: '⭐', probability: 10 },
  { value: 25, label: '-25%', emoji: '💎', probability: 4 },
  { value: 50, label: '-50%', emoji: '🏆', probability: 1 },
];

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug } = body;

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { error: 'Le nom et le slug sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si le slug existe déjà
    const { data: existing } = await supabaseAdmin
      .from('restaurants')
      .select('id')
      .eq('slug', slug.trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Ce slug est déjà utilisé' },
        { status: 409 }
      );
    }

    // Créer le restaurant
    // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference workaround
    const { data, error } = await (supabaseAdmin.from('restaurants') as any)
      .insert({
        name: name.trim(),
        slug: slug.trim(),
        primary_color: '#10b981',
        google_review_url: '',
        voucher_validity_days: 30,
        prizes: defaultPrizes,
        is_active: false,
        crm_type: 'none',
        user_id: user.id,
      })
      .select('slug')
      .single();

    if (error) {
      console.error('Create restaurant error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, slug: data.slug });
  } catch (error) {
    console.error('Create restaurant error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
