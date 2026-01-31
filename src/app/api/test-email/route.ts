import { NextResponse } from 'next/server';
import { sendVoucherEmail } from '@/lib/mailgun';

export async function GET() {
  try {
    const result = await sendVoucherEmail({
      to: 'iaenmieux@gmail.com',
      firstName: 'Hugo',
      restaurantName: 'Restaurant Test',
      restaurantLogo: null,
      primaryColor: '#10b981',
      prizeLabel: '-20%',
      prizeEmoji: '🎉',
      voucherCode: 'TEST-1234',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (result) {
      return NextResponse.json({ success: true, messageId: result.id });
    } else {
      return NextResponse.json({ success: false, error: 'Email not sent' }, { status: 500 });
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
