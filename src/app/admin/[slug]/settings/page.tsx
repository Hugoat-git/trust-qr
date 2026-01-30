import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Prize, Restaurant } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getRestaurantSettings(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Restaurant;
}

export default async function SettingsPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantSettings(slug);

  if (!restaurant) {
    notFound();
  }

  const prizes = (typeof restaurant.prizes === 'string'
    ? JSON.parse(restaurant.prizes)
    : restaurant.prizes) as Prize[];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 mt-1">
          Configuration de votre restaurant
        </p>
      </div>

      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>Détails de votre établissement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nom</p>
              <p className="font-medium">{restaurant.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Slug</p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{restaurant.slug}</code>
            </div>
            <div>
              <p className="text-sm text-gray-500">Couleur principale</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: restaurant.primary_color }}
                />
                <code className="text-sm">{restaurant.primary_color}</code>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <Badge className={restaurant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {restaurant.is_active ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lien avis Google */}
      <Card>
        <CardHeader>
          <CardTitle>Avis Google</CardTitle>
          <CardDescription>Lien vers votre page Google pour les avis</CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href={restaurant.google_review_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all"
          >
            {restaurant.google_review_url}
          </a>
        </CardContent>
      </Card>

      {/* Configuration des lots */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration des lots</CardTitle>
          <CardDescription>Probabilités et valeurs des réductions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prizes.map((prize, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{prize.emoji}</span>
                  <div>
                    <p className="font-medium">{prize.label}</p>
                    <p className="text-sm text-gray-500">Valeur: {prize.value}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{prize.probability}%</p>
                  <p className="text-sm text-gray-500">probabilité</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validité vouchers */}
      <Card>
        <CardHeader>
          <CardTitle>Validité des vouchers</CardTitle>
          <CardDescription>Durée de validité des bons de réduction</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{restaurant.voucher_validity_days} jours</p>
        </CardContent>
      </Card>

      {/* Note */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="py-4">
          <p className="text-sm text-yellow-800">
            Pour modifier ces paramètres, contactez l'administrateur de la plateforme.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
