import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { SettingsForm } from '@/components/admin/settings-form';
import { InfoTooltip } from '@/components/admin/info-tooltip';
import type { Restaurant } from '@/types';

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
          <InfoTooltip
            title="Configuration"
            description="Personnalisez votre restaurant : nom, logo, couleur, lien Google Avis et les gains de la roue. Les modifications sont sauvegardées instantanément."
            tips={[
              "Le lien Google Avis est essentiel pour la vérification des avis",
              "Choisissez un pack de gains ou créez le vôtre",
              "La couleur primaire s'applique à toute votre page participant",
            ]}
          />
        </div>
        <p className="text-muted-foreground mt-1">
          Configuration de votre restaurant
        </p>
      </div>

      {/* Settings Form */}
      <SettingsForm restaurant={restaurant} />
    </div>
  );
}
