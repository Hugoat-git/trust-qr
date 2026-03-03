import { redirect, notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { FREE_PLAN_LIMIT } from '@/lib/branding';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const qrTable = () => supabaseAdmin.from('qr_codes') as any;

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function QRRedirect({ params }: PageProps) {
  const { code } = await params;
  const upperCode = code.toUpperCase();

  // Find the QR code and its linked restaurant
  const { data: qr } = await qrTable()
    .select('id, restaurant_id, scan_count')
    .eq('code', upperCode)
    .single();

  if (!qr) {
    notFound();
  }

  if (!qr.restaurant_id) {
    // QR exists but not linked to any restaurant yet
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full">
            <span className="text-3xl">📱</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">QR Code non configure</h1>
          <p className="text-gray-500">
            Ce QR code n&apos;est pas encore lie a un restaurant.
            Si vous etes le proprietaire, rendez-vous dans votre espace admin
            pour lier ce QR code a votre compte.
          </p>
          <p className="text-sm text-gray-400 font-mono">Code: {upperCode}</p>
        </div>
      </div>
    );
  }

  // Get the restaurant slug + plan info
  const { data: restaurant } = await supabaseAdmin
    .from('restaurants')
    .select('slug, plan, confirmed_reviews_count')
    .eq('id', qr.restaurant_id as string)
    .single();

  if (!restaurant) {
    notFound();
  }

  const rest = restaurant as { slug: string; plan: string; confirmed_reviews_count: number };

  // Bloquer si le restaurant a atteint la limite freemium
  if (rest.plan === 'free' && rest.confirmed_reviews_count >= FREE_PLAN_LIMIT) {
    notFound();
  }

  // Increment scan count (fire and forget)
  qrTable()
    .update({ scan_count: (qr.scan_count || 0) + 1 })
    .eq('id', qr.id)
    .then();

  redirect(`/${rest.slug}`);
}
