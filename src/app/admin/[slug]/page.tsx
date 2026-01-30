import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Ticket, Star, TrendingUp } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface RestaurantData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
}

interface ParticipantData {
  id: string;
  prize_value: number;
  voucher_used: boolean;
  review_clicked_at: string | null;
  created_at: string;
}

async function getRestaurantStats(slug: string) {
  // Récupérer le restaurant
  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .select('id, name, slug, logo_url, primary_color')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  const restaurant = data as RestaurantData;

  // Récupérer les statistiques
  const { data: participantsData } = await supabaseAdmin
    .from('participants')
    .select('id, prize_value, voucher_used, review_clicked_at, created_at')
    .eq('restaurant_id', restaurant.id);

  const participants = (participantsData || []) as ParticipantData[];

  const stats = {
    totalParticipants: participants.length,
    vouchersUsed: participants.filter((p) => p.voucher_used).length,
    reviewClicks: participants.filter((p) => p.review_clicked_at).length,
    totalDiscountValue: participants.reduce((sum, p) => sum + (p.prize_value || 0), 0),
  };

  // Statistiques par jour (7 derniers jours)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const participationsByDay = last7Days.map((day) => ({
    date: day,
    count: participants.filter((p) => p.created_at.startsWith(day)).length,
  }));

  return { restaurant, stats, participationsByDay };
}

export default async function AdminDashboard({ params }: PageProps) {
  const { slug } = await params;
  const data = await getRestaurantStats(slug);

  if (!data) {
    notFound();
  }

  const { restaurant, stats, participationsByDay } = data;

  const statCards = [
    {
      title: 'Participants',
      value: stats.totalParticipants,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Vouchers utilisés',
      value: stats.vouchersUsed,
      icon: Ticket,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Clics avis Google',
      value: stats.reviewClicks,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Valeur totale réductions',
      value: `${stats.totalDiscountValue}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const maxCount = Math.max(...participationsByDay.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard - {restaurant.name}
        </h1>
        <p className="text-gray-500 mt-1">
          Vue d'ensemble de votre campagne de fidélité
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Participations (7 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-2">
            {participationsByDay.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center">
                  <span className="text-sm font-medium text-gray-900 mb-1">
                    {day.count}
                  </span>
                  <div
                    className="w-full bg-primary/80 rounded-t-md transition-all"
                    style={{
                      height: `${(day.count / maxCount) * 180}px`,
                      minHeight: day.count > 0 ? '20px' : '4px',
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('fr-FR', {
                    weekday: 'short',
                  })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Taux de conversion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Taux d'utilisation vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#22c55e"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(stats.vouchersUsed / Math.max(stats.totalParticipants, 1)) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                  {stats.totalParticipants > 0
                    ? Math.round((stats.vouchersUsed / stats.totalParticipants) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {stats.vouchersUsed} vouchers utilisés sur {stats.totalParticipants}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taux de clic avis Google</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#eab308"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(stats.reviewClicks / Math.max(stats.totalParticipants, 1)) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                  {stats.totalParticipants > 0
                    ? Math.round((stats.reviewClicks / stats.totalParticipants) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {stats.reviewClicks} clics sur {stats.totalParticipants} participants
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
