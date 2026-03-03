import { NextRequest, NextResponse } from 'next/server';
import { verifyPendingReviews } from '@/lib/verify-reviews';

/**
 * CRON endpoint pour vérifier les avis en attente
 * Peut être appelé par Vercel CRON, n8n, ou manuellement
 * Note: La vérification se fait aussi automatiquement à chaque participation
 */
export async function GET(request: NextRequest) {
  // Vérifier le secret pour les appels CRON
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await verifyPendingReviews();

    return NextResponse.json({
      message: 'Review verification completed',
      results,
    });
  } catch (error) {
    console.error('CRON verify-reviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
