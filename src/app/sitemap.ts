import type { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qr-fidelite.com';

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/admin/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/admin/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/confidentialite`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cgv`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Pages des restaurants (publiques)
  let restaurantPages: MetadataRoute.Sitemap = [];

  try {
    const { data: restaurants } = await supabaseAdmin
      .from('restaurants')
      .select('slug, updated_at')
      .eq('is_active', true);

    if (restaurants) {
      restaurantPages = (restaurants as { slug: string; updated_at: string }[]).map((restaurant) => ({
        url: `${baseUrl}/${restaurant.slug}`,
        lastModified: new Date(restaurant.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Error fetching restaurants for sitemap:', error);
  }

  return [...staticPages, ...restaurantPages];
}
