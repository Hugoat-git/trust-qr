'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { brand } from '@/lib/branding';
import { toast } from 'sonner';
import {
  Star,
  TrendingUp,
  Users,
  Ticket,
  ShieldCheck,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  UserPlus,
  CalendarDays,
  Search,
  Gift,
  ShieldAlert,
  ShieldX,
} from 'lucide-react';
import { QRLoader } from '@/components/ui/qr-loader';
import { UpgradePopup } from '@/components/admin/upgrade-popup';
import { FREE_PLAN_LIMIT } from '@/lib/branding';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

// Types
interface DashboardStats {
  totalParticipants: number;
  vouchersUsed: number;
  reviewsVerified: number;
  reviewsPending: number;
  reviewsExpired: number;
  reviewsSkipped: number;
  totalQRScans: number;
  participantsToday: number;
  participantsThisWeek: number;
  participantsLastWeek: number;
  participantsThisMonth: number;
}

interface DayData {
  date: string;
  count: number;
}

interface FunnelStep {
  step: string;
  label: string;
  count: number;
}

interface VoucherInfo {
  id: string;
  voucher_code: string;
  first_name: string;
  email: string;
  prize_label: string;
  prize_value: number;
  voucher_used: boolean;
  voucher_used_at: string | null;
  voucher_expires_at: string;
  review_status: string;
  created_at: string;
}

interface DashboardClientProps {
  restaurantId: string;
  restaurantName: string;
  primaryColor: string;
  initialReviewCount: number | null;
  plan: string;
  confirmedReviewsCount: number;
  stats: DashboardStats;
  participationsByDay: DayData[];
  participationsByMonth: DayData[];
  funnelData: FunnelStep[];
  slug: string;
}

const ACCENT = brand.orange;

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl shadow-black/10 dark:shadow-black/30 px-3 py-2 text-sm">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-bold text-foreground tabular-nums">{payload[0].value}</p>
    </div>
  );
}

export function DashboardClient({
  restaurantId,
  restaurantName,
  initialReviewCount,
  plan,
  confirmedReviewsCount,
  stats,
  participationsByDay,
  participationsByMonth,
  funnelData,
  slug,
}: DashboardClientProps) {
  const showUpgradePopup = plan === 'free' && confirmedReviewsCount >= FREE_PLAN_LIMIT;
  // Review state
  const [currentReviewCount, setCurrentReviewCount] = useState<number | null>(null);
  const [initialCount, setInitialCount] = useState(initialReviewCount ?? 0);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewResolved, setReviewResolved] = useState(false);

  // Voucher search state
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherSearching, setVoucherSearching] = useState(false);
  const [voucherValidating, setVoucherValidating] = useState(false);
  const [foundVoucher, setFoundVoucher] = useState<VoucherInfo | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch(`/api/review-count?restaurantId=${restaurantId}`);
        const data = await response.json();
        if (response.ok && data.reviewCount >= 0) {
          setCurrentReviewCount(data.reviewCount);
          setReviewResolved(true);
          if (initialReviewCount == null) {
            setInitialCount(data.reviewCount);
          }
        }
      } catch (error) {
        console.error('Error fetching review count:', error);
      } finally {
        setReviewLoading(false);
      }
    }
    fetchReviews();
  }, [restaurantId, initialReviewCount]);

  const currentCount = currentReviewCount ?? initialCount;
  const reviewsAdded = currentCount - initialCount;

  // Voucher search handlers
  const handleVoucherSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    setVoucherSearching(true);
    setVoucherError(null);
    setFoundVoucher(null);

    try {
      const response = await fetch(`/api/admin/voucher?slug=${slug}&code=${voucherCode.trim().toUpperCase()}`);
      const data = await response.json();

      if (!response.ok) {
        setVoucherError(data.error || 'Voucher non trouvé');
        return;
      }

      setFoundVoucher(data.voucher);
    } catch {
      setVoucherError('Erreur lors de la recherche');
    } finally {
      setVoucherSearching(false);
    }
  };

  const handleVoucherValidate = async () => {
    if (!foundVoucher) return;

    setVoucherValidating(true);
    try {
      const response = await fetch('/api/admin/voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucherId: foundVoucher.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erreur lors de la validation');
        return;
      }

      toast.success('Voucher validé avec succès !');
      setFoundVoucher({ ...foundVoucher, voucher_used: true, voucher_used_at: new Date().toISOString() });
    } catch {
      toast.error('Erreur lors de la validation');
    } finally {
      setVoucherValidating(false);
    }
  };

  const voucherIsExpired = foundVoucher && new Date(foundVoucher.voucher_expires_at) < new Date();
  const voucherReviewPending = foundVoucher?.review_status === 'pending';
  const voucherReviewExpired = foundVoucher?.review_status === 'expired';
  const canValidateVoucher = foundVoucher && !foundVoucher.voucher_used && !voucherIsExpired && !voucherReviewPending && !voucherReviewExpired;

  // Computed stats
  const voucherUsageRate = stats.totalParticipants > 0
    ? Math.round((stats.vouchersUsed / stats.totalParticipants) * 100) : 0;

  const reviewVerificationRate = (stats.reviewsVerified + stats.reviewsPending + stats.reviewsExpired) > 0
    ? Math.round((stats.reviewsVerified / (stats.reviewsVerified + stats.reviewsPending + stats.reviewsExpired)) * 100) : 0;

  const weekOverWeekChange = stats.participantsLastWeek > 0
    ? Math.round(((stats.participantsThisWeek - stats.participantsLastWeek) / stats.participantsLastWeek) * 100)
    : stats.participantsThisWeek > 0 ? 100 : 0;

  const reviewStatusData = [
    { name: 'Vérifiés', value: stats.reviewsVerified, color: '#22c55e' },
    { name: 'En attente', value: stats.reviewsPending, color: '#f59e0b' },
    { name: 'Expirés', value: stats.reviewsExpired, color: '#ef4444' },
    { name: 'Non requis', value: stats.reviewsSkipped, color: brand.chestnut },
  ].filter(d => d.value > 0);

  const chartData = participationsByDay.map(d => ({
    name: new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
    value: d.count,
  }));

  const monthlyData = participationsByMonth.map(d => ({
    name: new Date(d.date + '-01').toLocaleDateString('fr-FR', { month: 'short' }),
    value: d.count,
  }));

  const funnelMax = Math.max(...funnelData.map(f => f.count), 1);

  return (
    <div className="space-y-5">

      {showUpgradePopup && (
        <UpgradePopup restaurantName={restaurantName} confirmedReviews={confirmedReviewsCount} />
      )}

      {/* ===== ROW 0: Hero — Reviews Before/After + Voucher Check ===== */}
      <Card className="overflow-hidden">
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Google Reviews Before/After */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Avis Google
                </p>
                {reviewsAdded > 0 && reviewResolved && (
                  <Badge className="bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{reviewsAdded}
                  </Badge>
                )}
              </div>

              {reviewLoading ? (
                <div className="flex items-center justify-center py-8">
                  <QRLoader size={24} className="text-muted-foreground/50" />
                </div>
              ) : !reviewResolved ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Impossible de récupérer les avis Google.</p>
                  <p className="text-xs text-muted-foreground mt-1">Vérifiez votre lien dans les paramètres.</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Before */}
                  <div className="text-center px-5 py-4 bg-muted rounded-xl border border-border flex-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Avant</p>
                    <p className="text-3xl font-bold text-muted-foreground tabular-nums">{initialCount}</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    <ArrowRight className="w-5 h-5 text-primary" />
                    {reviewsAdded > 0 && (
                      <span className="text-[10px] font-bold text-green-500">+{reviewsAdded}</span>
                    )}
                  </div>

                  {/* After */}
                  <div className="text-center px-5 py-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20 flex-1">
                    <p className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">Maintenant</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 tabular-nums">{currentCount}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Voucher Quick Check */}
            <div className="lg:border-l lg:border-border lg:pl-6">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-4">
                <Ticket className="w-4 h-4" />
                Vérification rapide
              </p>

              <form onSubmit={handleVoucherSearch} className="flex gap-2">
                <Input
                  placeholder="Code voucher..."
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="flex-1 font-mono uppercase tracking-wider"
                  maxLength={8}
                />
                <Button type="submit" size="sm" disabled={voucherSearching || !voucherCode.trim()}>
                  {voucherSearching ? (
                    <QRLoader size={16} />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </form>

              {/* Voucher error */}
              {voucherError && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-500">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  {voucherError}
                </div>
              )}

              {/* Voucher result */}
              {foundVoucher && (
                <div className="mt-3 p-3 rounded-lg border border-border bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{foundVoucher.first_name}</span>
                    </div>
                    {foundVoucher.voucher_used ? (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" /> Utilisé
                      </Badge>
                    ) : voucherIsExpired ? (
                      <Badge variant="destructive" className="text-xs">Expiré</Badge>
                    ) : (
                      <Badge className="text-xs bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20">Valide</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div>
                      <span className="text-muted-foreground">Gain : </span>
                      <span className="font-semibold text-foreground">{foundVoucher.prize_label}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Code : </span>
                      <code className="font-mono font-semibold text-foreground">{foundVoucher.voucher_code}</code>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avis : </span>
                      {foundVoucher.review_status === 'verified' ? (
                        <span className="text-green-600 font-medium">Vérifié</span>
                      ) : foundVoucher.review_status === 'pending' ? (
                        <span className="text-amber-600 font-medium">En attente</span>
                      ) : foundVoucher.review_status === 'expired' ? (
                        <span className="text-red-600 font-medium">Non déposé</span>
                      ) : (
                        <span className="text-muted-foreground">Non requis</span>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expire : </span>
                      <span className="font-medium text-foreground">
                        {new Date(foundVoucher.voucher_expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  {!foundVoucher.voucher_used && !voucherIsExpired && (
                    <div className="mt-2">
                      {(voucherReviewPending || voucherReviewExpired) && (
                        <p className="text-[11px] text-amber-600 mb-2">
                          {voucherReviewPending
                            ? "Avis Google non encore vérifié."
                            : "Avis Google non déposé à temps."}
                        </p>
                      )}
                      <Button
                        onClick={handleVoucherValidate}
                        disabled={voucherValidating || !canValidateVoucher}
                        size="sm"
                        className="w-full"
                      >
                        {voucherValidating ? (
                          <QRLoader size={14} className="mr-1.5" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Valider
                      </Button>
                    </div>
                  )}

                  {foundVoucher.voucher_used && foundVoucher.voucher_used_at && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Utilisé le {new Date(foundVoucher.voucher_used_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== ROW 1: Stats (5 compact cards) ===== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { icon: UserPlus, value: stats.participantsToday, label: "Aujourd'hui", accent: 'primary' as const },
          { icon: CalendarDays, value: stats.participantsThisWeek, label: 'Cette semaine', accent: 'primary' as const, change: weekOverWeekChange },
          { icon: Users, value: stats.totalParticipants, label: 'Total', accent: 'primary' as const },
          { icon: Ticket, value: stats.vouchersUsed, label: 'Vouchers', accent: 'green' as const },
          { icon: ShieldCheck, value: stats.reviewsVerified, label: 'Avis vérifiés', accent: 'green' as const },
        ].map((stat) => (
          <Card key={stat.label} className="py-4 card-hover">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.accent === 'green' ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                  <stat.icon className={`w-4 h-4 ${stat.accent === 'green' ? 'text-green-600 dark:text-green-400' : 'text-primary'}`} />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                    {stat.change !== undefined && stat.change !== 0 && (
                      <span className={`text-[10px] font-semibold flex items-center ${stat.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        {stat.change > 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                        {stat.change > 0 ? '+' : ''}{stat.change}%
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ===== ROW 2: Charts (Participations + Review status) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Participations (14 jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorParticipations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ACCENT} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} className="fill-muted-foreground" />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="value" stroke={ACCENT} strokeWidth={2} fill="url(#colorParticipations)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Statut des avis</CardTitle>
          </CardHeader>
          <CardContent>
            {reviewStatusData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Aucune donnée
              </div>
            ) : (
              <div className="flex items-center gap-5 h-48 min-w-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={reviewStatusData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3} dataKey="value">
                        {reviewStatusData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2.5 flex-1">
                  {reviewStatusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                  {reviewVerificationRate > 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Taux : <span className="font-semibold text-green-600">{reviewVerificationRate}%</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== ROW 3: Monthly + Funnel ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {monthlyData.length > 1 && (
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Tendance mensuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} className="fill-muted-foreground" />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="value" fill={ACCENT} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {funnelData.some(f => f.count > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Entonnoir de conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {funnelData.map((step, index) => {
                  const percentage = Math.round((step.count / funnelMax) * 100);
                  const conversionFromPrev = index > 0 && funnelData[index - 1].count > 0
                    ? Math.round((step.count / funnelData[index - 1].count) * 100) : null;
                  return (
                    <div key={step.step}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-muted-foreground">{step.label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground">{step.count}</span>
                          {conversionFromPrev !== null && (
                            <span className="text-[10px] text-muted-foreground">({conversionFromPrev}%)</span>
                          )}
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: ACCENT, opacity: 1 - (index * 0.15) }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Taux d&apos;utilisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Vouchers */}
            <div className="flex items-center gap-5 min-w-0">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="48" className="stroke-muted" strokeWidth="10" fill="none" />
                  <circle cx="56" cy="56" r="48" stroke={ACCENT} strokeWidth="10" fill="none"
                    strokeDasharray={`${(voucherUsageRate / 100) * 301.6} 301.6`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                  {voucherUsageRate}%
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">Vouchers</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-sm text-muted-foreground">{stats.vouchersUsed} utilisés</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-sm text-muted-foreground">{stats.totalParticipants - stats.vouchersUsed} en attente</span>
                </div>
              </div>
            </div>

            {(stats.reviewsVerified + stats.reviewsPending + stats.reviewsExpired) > 0 && (
              <>
                <div className="border-t border-border" />
                {/* Avis */}
                <div className="flex items-center gap-5 min-w-0">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 112 112">
                      <circle cx="56" cy="56" r="48" className="stroke-muted" strokeWidth="10" fill="none" />
                      <circle cx="56" cy="56" r="48" stroke="#22c55e" strokeWidth="10" fill="none"
                        strokeDasharray={`${(reviewVerificationRate / 100) * 301.6} 301.6`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                      {reviewVerificationRate}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground">Avis Google</p>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-sm text-muted-foreground">{stats.reviewsVerified} vérifiés</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-sm text-muted-foreground">{stats.reviewsPending} en attente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-sm text-muted-foreground">{stats.reviewsExpired} expirés</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
