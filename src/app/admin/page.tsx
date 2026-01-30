import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ChevronRight, Store } from 'lucide-react';

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

  // S'il n'y a qu'un seul restaurant, rediriger directement
  if (restaurants.length === 1) {
    redirect(`/admin/${restaurants[0].slug}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes restaurants</h1>
          <p className="text-gray-500 mt-1">
            Sélectionnez un restaurant pour accéder à son tableau de bord
          </p>
        </div>

        <div className="grid gap-4">
          {restaurants.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun restaurant configuré</p>
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
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Store className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{restaurant.name}</p>
                          <p className="text-sm text-gray-500">/{restaurant.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            restaurant.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {restaurant.is_active ? 'Actif' : 'Inactif'}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
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
