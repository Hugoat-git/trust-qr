import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ChevronRight, Store, Plus } from 'lucide-react';

interface RestaurantData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
}

export default async function AdminIndexPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Récupérer tous les restaurants (pour l'instant tous, plus tard on filtrera par user)
  const { data } = await supabaseAdmin
    .from('restaurants')
    .select('id, name, slug, logo_url, is_active')
    .order('name');

  const restaurants = (data || []) as RestaurantData[];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes restaurants</h1>
          <p className="text-muted-foreground mt-1">
            Sélectionnez un restaurant pour accéder à son tableau de bord
          </p>
        </div>

        <div className="grid gap-4">
          {/* Bouton créer un nouveau restaurant */}
          <Link href="/admin/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 border-primary/30 bg-primary/5 hover:bg-primary/10">
              <CardContent className="py-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary">Créer un nouveau restaurant</p>
                    <p className="text-sm text-primary/70">Ajouter un établissement à votre compte</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {restaurants.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun restaurant configuré</p>
              </CardContent>
            </Card>
          ) : (
            restaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/admin/${restaurant.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {restaurant.logo_url ? (
                          <img
                            src={restaurant.logo_url}
                            alt={restaurant.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Store className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground">{restaurant.name}</p>
                          <p className="text-sm text-muted-foreground">/{restaurant.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            restaurant.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {restaurant.is_active ? 'Actif' : 'Inactif'}
                        </span>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
