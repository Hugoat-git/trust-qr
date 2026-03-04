import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

// Helper: qr_codes table isn't in generated types yet (run migration first, then npx supabase gen types)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const qrTable = () => supabaseAdmin.from('qr_codes') as any;

// Helper: verify a user owns a restaurant
async function userOwnsRestaurant(userId: string, restaurantId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('restaurants')
    .select('user_id')
    .eq('id', restaurantId)
    .single();
  // biome-ignore lint/suspicious/noExplicitAny: restaurant type mismatch
  return !!data && (data as any).user_id === userId;
}

// GET: List QR codes for a restaurant
export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurantId');

  if (!restaurantId) {
    return NextResponse.json({ error: 'restaurantId requis' }, { status: 400 });
  }

  if (!(await userOwnsRestaurant(user.id, restaurantId))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { data, error } = await qrTable()
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('linked_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ qrCodes: data });
}

// POST: Link a QR code to a restaurant
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await request.json();
  const { restaurantId, code } = body;

  if (!restaurantId || !code) {
    return NextResponse.json({ error: 'restaurantId et code requis' }, { status: 400 });
  }

  if (!(await userOwnsRestaurant(user.id, restaurantId))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const upperCode = code.toUpperCase();

  // Check if QR code exists
  const { data: qr, error: findError } = await qrTable()
    .select('id, restaurant_id')
    .eq('code', upperCode)
    .single();

  if (findError || !qr) {
    return NextResponse.json(
      { error: 'QR code introuvable. Verifiez que le code est valide.' },
      { status: 404 }
    );
  }

  if (qr.restaurant_id) {
    if (qr.restaurant_id === restaurantId) {
      return NextResponse.json(
        { error: 'Ce QR code est deja lie a votre restaurant.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Ce QR code est deja lie a un autre restaurant.' },
      { status: 409 }
    );
  }

  // Link QR code to restaurant
  const { data: updated, error: updateError } = await qrTable()
    .update({
      restaurant_id: restaurantId,
      linked_at: new Date().toISOString(),
    })
    .eq('id', qr.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ qrCode: updated });
}

// PATCH: Rename a QR code
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await request.json();
  const { qrCodeId, name } = body;

  if (!qrCodeId) {
    return NextResponse.json({ error: 'qrCodeId requis' }, { status: 400 });
  }

  // Verify ownership via the QR code's restaurant
  const { data: qrCheck } = await qrTable().select('restaurant_id').eq('id', qrCodeId).single();
  if (!qrCheck?.restaurant_id || !(await userOwnsRestaurant(user.id, qrCheck.restaurant_id))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { data, error } = await qrTable()
    .update({ name: name || null })
    .eq('id', qrCodeId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ qrCode: data });
}

// DELETE: Unlink a QR code from a restaurant
export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const qrCodeId = searchParams.get('qrCodeId');

  if (!qrCodeId) {
    return NextResponse.json({ error: 'qrCodeId requis' }, { status: 400 });
  }

  // Verify ownership via the QR code's restaurant
  const { data: qrCheck } = await qrTable().select('restaurant_id').eq('id', qrCodeId).single();
  if (!qrCheck?.restaurant_id || !(await userOwnsRestaurant(user.id, qrCheck.restaurant_id))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { error } = await qrTable()
    .update({ restaurant_id: null, name: null, linked_at: null })
    .eq('id', qrCodeId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
