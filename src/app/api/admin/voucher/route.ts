import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface VoucherData {
  id: string;
  voucher_code: string;
  first_name: string;
  email: string;
  prize_label: string;
  prize_value: number;
  voucher_used: boolean;
  voucher_used_at: string | null;
  voucher_expires_at: string;
  created_at: string;
}

interface ParticipantCheck {
  id: string;
  voucher_used: boolean;
  voucher_expires_at: string;
}

// GET - Rechercher un voucher par code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const code = searchParams.get('code');

    if (!slug || !code) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Récupérer le restaurant
    const { data: restaurantData, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .single();

    if (restaurantError || !restaurantData) {
      return NextResponse.json(
        { error: 'Restaurant non trouvé' },
        { status: 404 }
      );
    }

    const restaurant = restaurantData as { id: string };

    // Rechercher le voucher
    const { data: participantData, error: participantError } = await supabaseAdmin
      .from('participants')
      .select('id, voucher_code, first_name, email, prize_label, prize_value, voucher_used, voucher_used_at, voucher_expires_at, created_at')
      .eq('restaurant_id', restaurant.id)
      .eq('voucher_code', code.toUpperCase())
      .single();

    if (participantError || !participantData) {
      return NextResponse.json(
        { error: 'Voucher non trouvé' },
        { status: 404 }
      );
    }

    const voucher = participantData as VoucherData;

    return NextResponse.json({ voucher });
  } catch (error) {
    console.error('Voucher search error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Valider un voucher
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { voucherId } = body;

    if (!voucherId) {
      return NextResponse.json(
        { error: 'ID du voucher manquant' },
        { status: 400 }
      );
    }

    // Vérifier que le voucher existe et n'est pas déjà utilisé
    const { data: participantData, error: fetchError } = await supabaseAdmin
      .from('participants')
      .select('id, voucher_used, voucher_expires_at')
      .eq('id', voucherId)
      .single();

    if (fetchError || !participantData) {
      return NextResponse.json(
        { error: 'Voucher non trouvé' },
        { status: 404 }
      );
    }

    const participant = participantData as ParticipantCheck;

    if (participant.voucher_used) {
      return NextResponse.json(
        { error: 'Ce voucher a déjà été utilisé' },
        { status: 400 }
      );
    }

    if (new Date(participant.voucher_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Ce voucher a expiré' },
        { status: 400 }
      );
    }

    // Marquer comme utilisé
    // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue with Update type
    const { error: updateError } = await (supabaseAdmin.from('participants') as any)
      .update({
        voucher_used: true,
        voucher_used_at: new Date().toISOString(),
      })
      .eq('id', voucherId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la validation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Voucher validation error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
