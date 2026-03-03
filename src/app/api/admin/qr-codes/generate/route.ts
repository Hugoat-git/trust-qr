import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateQRCodeId } from '@/lib/utils';

// POST: Generate a batch of unlinked QR codes
// Body: { count: number, secret: string }
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { count = 10, secret } = body;

  // Simple protection: only you can generate QR codes
  if (secret !== process.env.QR_GENERATE_SECRET) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  if (count < 1 || count > 500) {
    return NextResponse.json({ error: 'count doit etre entre 1 et 500' }, { status: 400 });
  }

  const codes: string[] = [];
  const maxRetries = 3;

  for (let i = 0; i < count; i++) {
    let code: string = '';
    let inserted = false;

    for (let retry = 0; retry < maxRetries; retry++) {
      code = generateQRCodeId();

      const { error } = await (supabaseAdmin
        .from('qr_codes') as any)
        .insert({ code });

      if (!error) {
        inserted = true;
        codes.push(code);
        break;
      }

      // If duplicate code, retry with a new one
      if (error.code === '23505') {
        continue;
      }

      return NextResponse.json({ error: error.message, codesGenerated: codes }, { status: 500 });
    }

    if (!inserted) {
      return NextResponse.json(
        { error: `Impossible de generer un code unique apres ${maxRetries} tentatives`, codesGenerated: codes },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    message: `${codes.length} QR codes generes`,
    codes,
    urls: codes.map((c) => `${process.env.NEXT_PUBLIC_APP_URL || 'https://trustqr.dev'}/go/${c}`),
  });
}
