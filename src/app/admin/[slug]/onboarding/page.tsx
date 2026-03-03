import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { OnboardingForm } from '@/components/admin/onboarding-form';
import type { Prize } from '@/types';

const defaultPrizes: Prize[] = [
  { value: 5, label: '-5%', emoji: '🎁', probability: 40 },
  { value: 10, label: '-10%', emoji: '🎉', probability: 30 },
  { value: 15, label: '-15%', emoji: '🔥', probability: 15 },
  { value: 20, label: '-20%', emoji: '⭐', probability: 10 },
  { value: 25, label: '-25%', emoji: '💎', probability: 4 },
  { value: 50, label: '-50%', emoji: '🏆', probability: 1 },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getRestaurant(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .select('id, name, slug, logo_url, primary_color, google_review_url, voucher_validity_days, prizes, is_active')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference workaround
  const restaurant = data as any;

  const prizes = typeof restaurant.prizes === 'string'
    ? JSON.parse(restaurant.prizes)
    : restaurant.prizes || defaultPrizes;

  return {
    id: restaurant.id as string,
    name: restaurant.name as string,
    slug: restaurant.slug as string,
    logo_url: restaurant.logo_url as string | null,
    primary_color: (restaurant.primary_color as string) || '#10b981',
    google_review_url: (restaurant.google_review_url as string) || '',
    voucher_validity_days: (restaurant.voucher_validity_days as number) || 30,
    prizes: prizes as Prize[],
    is_active: restaurant.is_active as boolean,
  };
}

export default async function OnboardingPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) {
    notFound();
  }

  return <OnboardingForm restaurant={restaurant} />;
}
