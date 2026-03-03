import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { DashboardClient } from '@/components/admin/dashboard-client';
import { InfoTooltip } from '@/components/admin/info-tooltip';
import { FREE_PLAN_LIMIT } from '@/lib/branding';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface ParticipantRow {
  id: string;
  prize_value: number;
  voucher_used: boolean;
  review_clicked_at: string | null;
  review_status: string;
  created_at: string;
}

interface PageViewRow {
  step: string | null;
  created_at: string;
}

interface QRCodeRow {
  scan_count: number;
}

async function getDashboardData(slug: string) {
  // Fetch restaurant
  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .select('id, name, slug, logo_url, primary_color, google_place_id, initial_review_count, plan, confirmed_reviews_count')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  const restaurant = data as {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string;
    google_place_id: string | null;
    initial_review_count: number | null;
    plan: string;
    confirmed_reviews_count: number;
  };

  // Fetch participants
  const { data: participantsData } = await supabaseAdmin
    .from('participants')
    .select('id, prize_value, voucher_used, review_clicked_at, review_status, created_at')
    .eq('restaurant_id', restaurant.id);

  const participants = (participantsData || []) as ParticipantRow[];

  // Fetch page views
  const { data: pageViewsData } = await supabaseAdmin
    .from('page_views')
    .select('step, created_at')
    .eq('restaurant_id', restaurant.id);

  const pageViews = (pageViewsData || []) as PageViewRow[];

  // Fetch QR code scans
  const { data: qrCodesData } = await supabaseAdmin
    .from('qr_codes')
    .select('scan_count')
    .eq('restaurant_id', restaurant.id);

  const qrCodes = (qrCodesData || []) as QRCodeRow[];

  // === Compute stats ===
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Start of this week (Monday)
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  thisWeekStart.setHours(0, 0, 0, 0);

  // Start of last week
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  // Start of this month
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats = {
    totalParticipants: participants.length,
    vouchersUsed: participants.filter(p => p.voucher_used).length,
    reviewsVerified: participants.filter(p => p.review_status === 'verified').length,
    reviewsPending: participants.filter(p => p.review_status === 'pending').length,
    reviewsExpired: participants.filter(p => p.review_status === 'expired').length,
    reviewsSkipped: participants.filter(p => p.review_status === 'skipped').length,
    totalQRScans: qrCodes.reduce((sum, qr) => sum + qr.scan_count, 0),
    participantsToday: participants.filter(p => p.created_at.startsWith(todayStr)).length,
    participantsThisWeek: participants.filter(p => new Date(p.created_at) >= thisWeekStart).length,
    participantsLastWeek: participants.filter(p => {
      const d = new Date(p.created_at);
      return d >= lastWeekStart && d < thisWeekStart;
    }).length,
    participantsThisMonth: participants.filter(p => new Date(p.created_at) >= thisMonthStart).length,
  };

  // === Participations by day (last 14 days) ===
  const participationsByDay = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const dayStr = date.toISOString().split('T')[0];
    return {
      date: dayStr,
      count: participants.filter(p => p.created_at.startsWith(dayStr)).length,
    };
  });

  // === Participations by month (last 6 months) ===
  const participationsByMonth = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return {
      date: monthStr,
      count: participants.filter(p => p.created_at.startsWith(monthStr)).length,
    };
  });

  // === Funnel data from page_views ===
  const stepOrder = ['landing', 'form', 'review', 'spin', 'result'];
  const stepLabels: Record<string, string> = {
    landing: 'Page visitée',
    form: 'Formulaire rempli',
    review: 'Avis Google',
    spin: 'Roue tournée',
    result: 'Résultat affiché',
  };

  const funnelData = stepOrder.map(step => ({
    step,
    label: stepLabels[step] || step,
    count: pageViews.filter(pv => pv.step === step).length,
  }));

  return { restaurant, stats, participationsByDay, participationsByMonth, funnelData };
}

export default async function AdminDashboard({ params }: PageProps) {
  const { slug } = await params;
  const data = await getDashboardData(slug);

  if (!data) {
    notFound();
  }

  const { restaurant, stats, participationsByDay, participationsByMonth, funnelData } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <InfoTooltip
            title="Vue d'ensemble"
            description="Retrouvez ici toutes les statistiques clés de votre restaurant : participations, avis Google, taux de conversion et tendances."
            tips={[
              "Les avis Google sont mis à jour en temps réel",
              "Validez vos vouchers dans la section 'Vérification rapide'",
            ]}
          />
        </div>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble — {restaurant.name}
        </p>
      </div>

      <DashboardClient
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        primaryColor={restaurant.primary_color}
        initialReviewCount={restaurant.initial_review_count}
        plan={restaurant.plan}
        confirmedReviewsCount={restaurant.confirmed_reviews_count}
        stats={stats}
        participationsByDay={participationsByDay}
        participationsByMonth={participationsByMonth}
        funnelData={funnelData}
        slug={slug}
      />
    </div>
  );
}
