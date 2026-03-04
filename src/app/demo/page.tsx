'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { brand } from '@/lib/branding';
import {
  Users,
  Ticket,
  ShieldCheck,
  UserPlus,
  CalendarDays,
  Star,
  TrendingUp,
  ArrowUpRight,
  CheckCircle,
  Clock,
  XCircle,
  Search,
} from 'lucide-react';
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

const ACCENT = brand.orange;

// --- Fake data ---
const stats = {
  totalParticipants: 342,
  participantsToday: 8,
  participantsThisWeek: 47,
  participantsLastWeek: 39,
  vouchersUsed: 127,
  reviewsVerified: 201,
  reviewsPending: 67,
  reviewsExpired: 42,
  reviewsSkipped: 32,
  totalQRScans: 891,
};

const participationsByDay = [
  { date: '19/02', count: 14 },
  { date: '20/02', count: 22 },
  { date: '21/02', count: 18 },
  { date: '22/02', count: 9 },
  { date: '23/02', count: 31 },
  { date: '24/02', count: 27 },
  { date: '25/02', count: 19 },
  { date: '26/02', count: 11 },
  { date: '27/02', count: 24 },
  { date: '28/02', count: 33 },
  { date: '01/03', count: 29 },
  { date: '02/03', count: 16 },
  { date: '03/03', count: 41 },
  { date: '04/03', count: 8 },
];

const participationsByMonth = [
  { label: 'Oct', count: 48 },
  { label: 'Nov', count: 73 },
  { label: 'Déc', count: 91 },
  { label: 'Jan', count: 118 },
  { label: 'Fév', count: 156 },
  { label: 'Mar', count: 184 },
];

const funnelData = [
  { label: 'Page scannée', count: 891 },
  { label: 'Formulaire rempli', count: 542 },
  { label: 'Avis laissé', count: 389 },
  { label: 'Roue tournée', count: 342 },
  { label: 'Résultat vu', count: 342 },
];

const INITIAL_REVIEW_COUNT = 47;
const CURRENT_REVIEW_COUNT = 89;

// biome-ignore lint/suspicious/noExplicitAny: Recharts tooltip
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl px-3 py-2 text-sm">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-bold text-foreground tabular-nums">{payload[0].value}</p>
    </div>
  );
}

export default function DemoPage() {
  const weeklyChange = Math.round(
    ((stats.participantsThisWeek - stats.participantsLastWeek) / stats.participantsLastWeek) * 100
  );
  const totalReviews =
    stats.reviewsVerified + stats.reviewsPending + stats.reviewsExpired + stats.reviewsSkipped;
  const verificationRate =
    totalReviews > 0 ? Math.round((stats.reviewsVerified / totalReviews) * 100) : 0;
  const voucherRate =
    stats.totalParticipants > 0
      ? Math.round((stats.vouchersUsed / stats.totalParticipants) * 100)
      : 0;
  const reviewsGained = CURRENT_REVIEW_COUNT - INITIAL_REVIEW_COUNT;
  const funnelMax = funnelData[0].count;

  const reviewPieData = [
    { name: 'Vérifiés', value: stats.reviewsVerified, color: '#22c55e' },
    { name: 'En attente', value: stats.reviewsPending, color: '#f59e0b' },
    { name: 'Expirés', value: stats.reviewsExpired, color: '#ef4444' },
    { name: 'Ignorés', value: stats.reviewsSkipped, color: brand.chestnut },
  ].filter((d) => d.value > 0);

  const statCards = [
    {
      label: "Aujourd'hui",
      value: stats.participantsToday,
      icon: UserPlus,
      color: '#3b82f6',
    },
    {
      label: 'Cette semaine',
      value: stats.participantsThisWeek,
      icon: CalendarDays,
      color: '#3b82f6',
      change: weeklyChange,
    },
    { label: 'Total', value: stats.totalParticipants, icon: Users, color: '#3b82f6' },
    { label: 'Bons utilisés', value: stats.vouchersUsed, icon: Ticket, color: '#22c55e' },
    {
      label: 'Avis vérifiés',
      value: stats.reviewsVerified,
      icon: ShieldCheck,
      color: '#22c55e',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="bg-primary/10 border-b border-primary/20 py-2 px-4 text-center text-sm font-medium text-primary">
        Mode démonstration — Les données présentées sont fictives
      </div>

      {/* Header */}
      <div className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: ACCENT }}
          >
            LB
          </div>
          <div>
            <p className="font-semibold text-foreground">Le Bistro Parisien</p>
            <p className="text-xs text-muted-foreground">Tableau de bord</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs tracking-widest">
          DÉMO
        </Badge>
      </div>

      <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
        {/* Row 0: Google Reviews + Voucher Search */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Google Reviews */}
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Star className="w-4 h-4" style={{ color: ACCENT }} />
                Avis Google
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold tabular-nums text-foreground">
                    {INITIAL_REVIEW_COUNT}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Au départ</p>
                </div>
                <ArrowUpRight className="w-6 h-6 text-muted-foreground shrink-0" />
                <div className="text-center">
                  <p className="text-4xl font-bold tabular-nums" style={{ color: ACCENT }}>
                    {CURRENT_REVIEW_COUNT}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Aujourd'hui</p>
                </div>
                <div className="ml-auto">
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400 text-sm px-3 py-1">
                    +{reviewsGained} avis
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voucher verification (static demo) */}
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ticket className="w-4 h-4 text-green-500" />
                Vérification bon de réduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Code bon (ex: AB12CD34)"
                  defaultValue="AB12CD34"
                  readOnly
                  className="uppercase"
                />
                <Button disabled className="shrink-0">
                  <Search className="w-4 h-4 mr-2" />
                  Vérifier
                </Button>
              </div>
              <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground text-sm">Marie Dupont</p>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400 text-xs">
                    Valide
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Café offert · Code: AB12CD34
                </p>
                <p className="text-xs text-muted-foreground">
                  Expire le 15/04/2026 · Avis vérifié ✓
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 1: Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {statCards.map(({ label, value, icon: Icon, color, change }) => (
            <Card key={label} className="min-w-0 overflow-hidden">
              <CardContent>
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  {change !== undefined && (
                    <span
                      className={`text-xs font-medium flex items-center gap-0.5 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}
                    >
                      <ArrowUpRight
                        className={`w-3 h-3 ${change < 0 ? 'rotate-90' : ''}`}
                      />
                      {Math.abs(change)}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold tabular-nums text-foreground mt-2">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Row 2: Area chart + Pie chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: ACCENT }} />
                Participations (14 jours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={192}>
                <AreaChart data={participationsByDay}>
                  <defs>
                    <linearGradient id="demoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ACCENT} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={ACCENT} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval={1}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={ACCENT}
                    strokeWidth={2}
                    fill="url(#demoGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Statut des avis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  <ResponsiveContainer width={110} height={110}>
                    <PieChart>
                      <Pie
                        data={reviewPieData}
                        dataKey="value"
                        innerRadius={28}
                        outerRadius={48}
                        paddingAngle={2}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {reviewPieData.map((entry, i) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: static data
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {reviewPieData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground text-xs">{entry.name}</span>
                      </div>
                      <span className="font-semibold tabular-nums text-foreground text-sm">
                        {entry.value}
                      </span>
                    </div>
                  ))}
                  <div className="pt-1.5 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Taux de vérification :{' '}
                      <span className="font-semibold text-foreground">{verificationRate}%</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Monthly + Funnel + Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Monthly bar chart */}
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tendance mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={participationsByMonth}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill={ACCENT} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Funnel */}
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Entonnoir de conversion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {funnelData.map((step, i) => {
                const prev = i > 0 ? funnelData[i - 1].count : step.count;
                const convRate = i > 0 ? Math.round((step.count / prev) * 100) : 100;
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static data
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{step.label}</span>
                      <div className="flex items-center gap-2">
                        {i > 0 && (
                          <span className="text-muted-foreground tabular-nums">{convRate}%</span>
                        )}
                        <span className="font-semibold tabular-nums text-foreground">
                          {step.count}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(step.count / funnelMax) * 100}%`,
                          backgroundColor: ACCENT,
                          opacity: 1 - i * 0.14,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Usage rates */}
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taux d'utilisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vouchers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" />
                    Bons de réduction
                  </p>
                  <span className="text-sm font-bold tabular-nums" style={{ color: ACCENT }}>
                    {voucherRate}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="48" height="48" className="shrink-0 -rotate-90">
                    <circle cx="24" cy="24" r="18" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                    <circle
                      cx="24" cy="24" r="18" fill="none"
                      stroke={ACCENT} strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - voucherRate / 100)}`}
                    />
                  </svg>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {stats.vouchersUsed} utilisés
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {stats.totalParticipants - stats.vouchersUsed} en attente
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Avis Google
                  </p>
                  <span className="text-sm font-bold tabular-nums text-green-500">
                    {verificationRate}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="48" height="48" className="shrink-0 -rotate-90">
                    <circle cx="24" cy="24" r="18" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                    <circle
                      cx="24" cy="24" r="18" fill="none"
                      stroke="#22c55e" strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - verificationRate / 100)}`}
                    />
                  </svg>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {stats.reviewsVerified} vérifiés
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {stats.reviewsPending} en attente
                    </p>
                    <p className="flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-red-400" />
                      {stats.reviewsExpired} expirés
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
