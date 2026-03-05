import type { Metadata } from 'next';
import Link from 'next/link';
import { Oswald, JetBrains_Mono } from 'next/font/google';
import {
  QrCode,
  Star,
  Gift,
  TrendingUp,
  Users,
  Zap,
  Check,
  X,
} from 'lucide-react';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { HowItWorks } from '@/components/landing/how-it-works';
import { DemoVideoButton } from '@/components/landing/demo-video-button';

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TrustQR — Collectez des avis Google et fidélisez vos clients',
  description:
    'TrustQR transforme chaque client en ambassadeur : collectez des avis Google, fidélisez avec des réductions gamifiées et construisez votre base CRM. Via un simple QR code.',
  openGraph: {
    title: 'TrustQR — Collectez des avis Google et fidélisez vos clients',
    description:
      'Transformez chaque client en ambassadeur grâce à un QR code intelligent.',
    url: 'https://trustqr.dev',
    siteName: 'TrustQR',
    locale: 'fr_FR',
    type: 'website',
  },
};


const pricingPlans = [
  {
    name: 'Gratuit',
    price: '0',
    description: 'Pour tester sans risque',
    badge: 'Sans CB',
    badgeVariant: 'muted' as const,
    features: [
      { label: "Jusqu'à 6 avis Google collectés", included: true },
      { label: '1 QR code offert', included: true },
      { label: 'Dashboard analytics basique', included: true },
      { label: 'Page participant personnalisée', included: false },
      { label: 'Mini CRM (emails/téléphones)', included: false },
    ],
    cta: 'Commencer gratuitement',
    ctaVariant: 'muted' as const,
    ctaLink: '/admin/register',
  },
  {
    name: 'Starter',
    price: '39',
    description: 'Pour démarrer sérieusement',
    features: [
      { label: 'Avis illimités au-delà de 6', included: true },
      { label: '1 restaurant', included: true },
      { label: 'Supports QR livrés (max 10)', included: true },
      { label: 'Mini CRM (emails/téléphones)', included: true },
      { label: 'Campagnes emailing automatiques', included: false },
    ],
    cta: 'Choisir Starter',
    ctaVariant: 'muted' as const,
    ctaLink: '/admin/register',
  },
  {
    name: 'Pro',
    price: '79',
    description: 'Le plus populaire',
    highlight: true,
    badge: '⭐ Recommandé',
    badgeVariant: 'primary' as const,
    features: [
      { label: 'Tout le pack Starter', included: true },
      { label: "Jusqu'à 3 restaurants", included: true },
      { label: 'Analytics Google Business', included: true },
      { label: 'Campagnes emailing automatiques', included: true },
      { label: 'Agent IA réponses personnalisées', included: true },
    ],
    cta: 'Choisir Pro',
    ctaVariant: 'primary' as const,
    ctaLink: '/admin/register',
    setup: '79€ de frais de setup',
  },
  {
    name: 'Enterprise',
    price: '149',
    description: 'Pour les groupes ambitieux',
    disabled: true,
    badge: 'Bientôt',
    badgeVariant: 'disabled' as const,
    features: [
      { label: 'Restaurants illimités', included: true },
      { label: 'QR codes NFC + physiques premium', included: true },
      { label: 'Account manager dédié', included: true },
      { label: 'Formation équipe incluse', included: true },
      { label: 'Intégrations sur mesure', included: true },
    ],
    cta: 'Bientôt disponible',
    ctaVariant: 'disabled' as const,
  },
];

export default function HomePage() {
  return (
    <div className={`${oswald.variable} ${jetbrainsMono.variable} min-h-screen bg-[#141414] text-white`}>

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[#3F3835]/40 bg-[#141414]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-8 lg:px-[120px]">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#B55933]">
              <span className="[font-family:var(--font-oswald)] text-sm font-bold text-white">T</span>
            </div>
            <span className="[font-family:var(--font-oswald)] text-lg font-bold text-white">TrustQR</span>
          </div>
          {/* Nav */}
          <nav className="hidden items-center gap-10 md:flex">
            {['Fonctionnalités', 'Tarifs', 'Démo'].map((item, i) => (
              <a
                key={item}
                href={i === 0 ? '#fonctionnalites' : i === 1 ? '#tarifs' : '/demo-resto'}
                className="[font-family:var(--font-jetbrains)] text-sm text-[#A1887D] transition-colors hover:text-white"
              >
                {item}
              </a>
            ))}
          </nav>
          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="hidden [font-family:var(--font-jetbrains)] text-sm text-[#A1887D] transition-colors hover:text-white sm:block"
            >
              Connexion
            </Link>
            <Link
              href="/admin/register"
              className="rounded-lg bg-[#B55933] px-5 py-2 [font-family:var(--font-jetbrains)] text-sm font-bold text-[#141414] transition-colors hover:bg-[#c4633d]"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#141414] pb-0 pt-20 lg:pt-32">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-[#B55933] opacity-[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-[380px] w-[380px] rounded-full bg-[#A1887D] opacity-[0.05] blur-3xl" />

        <div className="relative mx-auto max-w-[960px] px-6 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#B55933]/25 bg-[#3F3835] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A1887D]" />
            <span className="[font-family:var(--font-jetbrains)] text-xs font-semibold text-[#A1887D]">
              // essai_gratuit · sans_carte_bancaire
            </span>
            <span className="rounded bg-[#B55933]/20 px-2 py-0.5 [font-family:var(--font-jetbrains)] text-[10px] font-bold text-[#B55933]">
              [BETA]
            </span>
          </div>

          {/* Headline */}
          <h1 className="[font-family:var(--font-oswald)] text-5xl font-bold uppercase leading-none tracking-tight text-white sm:text-6xl lg:text-7xl">
            Transformez chaque client
            <br />
            en ambassadeur
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-7 max-w-2xl [font-family:var(--font-jetbrains)] text-base leading-relaxed text-[#A1887D] sm:text-lg">
            Collectez des avis Google. Fidélisez avec des réductions gamifiées.
            <br className="hidden sm:block" />
            Construisez votre base CRM. Le tout en moins de 2 minutes.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/admin/register"
              className="rounded-2xl bg-[#B55933] px-10 py-4 [font-family:var(--font-jetbrains)] text-sm font-bold text-[#141414] transition-colors hover:bg-[#c4633d]"
            >
              Essayer gratuitement →
            </Link>
            <DemoVideoButton />
          </div>

          {/* Trust */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            {['✓ 6 avis offerts', '✓ Sans CB', '✓ Annulez à tout moment'].map((t) => (
              <span key={t} className="[font-family:var(--font-jetbrains)] text-xs text-[#A1887D]">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-12 border-t border-[#3F3835] bg-[#1C1917]">
          <div className="mx-auto flex max-w-[1440px] items-center justify-center divide-x divide-[#3F3835] px-8 lg:px-[120px]">
            {[
              { value: '6 avis', label: "offerts à l'inscription" },
              { value: '< 2 min', label: 'pour démarrer' },
              { value: '0€', label: 'sans engagement', accent: 'muted' },
            ].map(({ value, label, accent }) => (
              <div key={label} className="flex-1 py-5 text-center">
                <p className={`[font-family:var(--font-oswald)] text-2xl font-bold ${accent === 'muted' ? 'text-[#A1887D]' : 'text-[#B55933]'}`}>
                  {value}
                </p>
                <p className="mt-0.5 [font-family:var(--font-jetbrains)] text-xs text-[#A1887D]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── FEATURES ───────────────────────────────────────────────── */}
      <section id="fonctionnalites" className="bg-[#1C1917] px-6 py-20 lg:px-[120px] lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          {/* Header */}
          <div className="mb-16 text-center">
            <p className="mb-3 [font-family:var(--font-jetbrains)] text-xs text-[#4E4E4E]">
              // fonctionnalites
            </p>
            <h2 className="[font-family:var(--font-oswald)] text-4xl font-bold uppercase text-white lg:text-5xl">
              Tout ce qu&apos;il vous faut
            </h2>
            <p className="mt-4 [font-family:var(--font-jetbrains)] text-sm text-[#A1887D]">
              Une solution complète pour fidéliser vos clients et booster votre visibilité
            </p>
          </div>

          {/* Bento Grid */}
          <BentoGrid className="lg:grid-cols-3 lg:auto-rows-[200px]">
            {/* QR Code — wide (2 cols) */}
            <BentoCard
              name="QR Code unique"
              className="col-span-1 lg:col-span-2"
              Icon={QrCode}
              description="Chaque restaurant a son propre QR code à afficher en caisse ou sur table. Généré en 30 secondes, personnalisable à vos couleurs."
              href="/admin/register"
              cta="Créer mon QR code"
              background={
                <div className="absolute inset-0 flex items-center justify-end pr-10 pt-6">
                  <div className="flex gap-3 opacity-25">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex flex-col gap-3">
                        {[...Array(5)].map((_, j) => (
                          <div
                            key={j}
                            className="rounded bg-[#B55933]"
                            style={{
                              width: `${(i + j) % 3 === 0 ? 20 : (i + j) % 2 === 0 ? 10 : 14}px`,
                              height: `${(i + j) % 3 === 0 ? 20 : (i + j) % 2 === 0 ? 10 : 14}px`,
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              }
            />

            {/* Avis Google — tall (1 col × 2 rows) */}
            <BentoCard
              name="Collecte d'avis Google"
              className="col-span-1 lg:row-span-2"
              Icon={Star}
              description="Redirigez vos clients vers Google pour booster votre réputation en ligne automatiquement après chaque visite."
              href="/admin/register"
              cta="Booster mes avis"
              background={
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 opacity-20">
                  {[
                    { stars: 5, name: 'Marie L.' },
                    { stars: 5, name: 'Pierre D.' },
                    { stars: 4, name: 'Sophie M.' },
                    { stars: 5, name: 'Julien R.' },
                  ].map(({ stars, name }) => (
                    <div key={name} className="w-full rounded-lg border border-[#3F3835] bg-[#3F3835]/40 p-2">
                      <div className="flex gap-0.5">
                        {[...Array(stars)].map((_, j) => (
                          <Star key={j} className="h-2.5 w-2.5 fill-[#B55933] text-[#B55933]" />
                        ))}
                      </div>
                      <div className="mt-1 h-1.5 w-16 rounded bg-[#A1887D]" />
                    </div>
                  ))}
                </div>
              }
            />

            {/* Réductions gamifiées — highlighted square */}
            <BentoCard
              name="Réductions gamifiées"
              className="col-span-1 border-[#B55933]/60 bg-[#261C17]"
              Icon={Gift}
              description="Vos clients retournent des cartes pour découvrir leur réduction. Fun, engageant, mémorable."
              href="/demo-resto"
              cta="Voir la démo"
              background={
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-30">
                  {['−10%', '−15%', '−5%'].map((v) => (
                    <div
                      key={v}
                      className="flex h-14 w-11 items-center justify-center rounded-xl border border-[#B55933] bg-[#B55933]/15 [font-family:var(--font-oswald)] text-sm font-bold text-[#B55933]"
                    >
                      {v}
                    </div>
                  ))}
                </div>
              }
            />

            {/* Dashboard — square */}
            <BentoCard
              name="Dashboard analytics"
              className="col-span-1"
              Icon={TrendingUp}
              description="Suivez vos participations, taux de conversion et avis en temps réel."
              href="/admin/register"
              cta="Voir le dashboard"
              background={
                <div className="absolute inset-x-0 bottom-10 flex items-end justify-center gap-1.5 px-6 opacity-25">
                  {[35, 58, 42, 75, 55, 88, 70, 60].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-[#B55933]"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              }
            />

            {/* CRM — wide (2 cols) */}
            <BentoCard
              name="Base clients CRM"
              className="col-span-1 lg:col-span-2"
              Icon={Users}
              description="Récupérez emails et téléphones de vos clients pour vos futures campagnes marketing et relances automatiques."
              href="/admin/register"
              cta="Construire mon CRM"
              background={
                <div className="absolute inset-0 flex items-center justify-end pr-10 opacity-20">
                  <div className="flex flex-col gap-2.5">
                    {[
                      { w: 'w-40' },
                      { w: 'w-32' },
                      { w: 'w-36' },
                      { w: 'w-28' },
                    ].map(({ w }, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-[#B55933]" />
                        <div className="flex flex-col gap-1">
                          <div className={`h-2 ${w} rounded bg-[#A1887D]`} />
                          <div className="h-1.5 w-20 rounded bg-[#3F3835]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              }
            />

            {/* Emails auto — Pro, square */}
            <BentoCard
              name="Emails automatiques"
              className="col-span-1"
              Icon={Zap}
              description="Envoyez automatiquement les bons de réduction par email dès qu'un client participe."
              href="/admin/register"
              cta="Activer les emails"
              pro
              background={
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 opacity-25">
                  {[
                    { w: 'w-full', label: 'Bon de réduction' },
                    { w: 'w-4/5', label: 'Merci !' },
                    { w: 'w-3/5', label: 'Revenez !' },
                  ].map(({ w, label }) => (
                    <div key={label} className={`${w} rounded border border-[#B55933]/40 bg-[#B55933]/10 px-3 py-1.5`}>
                      <div className="h-2 w-16 rounded bg-[#B55933]" />
                    </div>
                  ))}
                </div>
              }
            />
          </BentoGrid>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────── */}
      <section id="tarifs" className="bg-[#141414] px-6 py-20 lg:px-[120px] lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          {/* Header */}
          <div className="mb-16 text-center">
            <p className="mb-3 [font-family:var(--font-jetbrains)] text-xs text-[#4E4E4E]">
              // tarifs
            </p>
            <h2 className="[font-family:var(--font-oswald)] text-4xl font-bold uppercase text-white lg:text-5xl">
              Tarifs simples et transparents
            </h2>
            <p className="mt-4 [font-family:var(--font-jetbrains)] text-sm text-[#A1887D]">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col overflow-hidden rounded-2xl border transition-all ${
                  plan.highlight
                    ? 'border-[#B55933] bg-[#261C17]'
                    : plan.disabled
                      ? 'border-[#3F3835] bg-[#1C1917] opacity-60'
                      : 'border-[#3F3835] bg-[#1C1917]'
                }`}
              >
                {/* Orange top bar for Pro */}
                {plan.highlight && <div className="h-1 w-full bg-[#B55933]" />}

                <div className="flex flex-col gap-2 p-6 pb-5">
                  {plan.badge && (
                    <span
                      className={`inline-flex w-fit rounded px-2.5 py-1 [font-family:var(--font-jetbrains)] text-[10px] font-bold ${
                        plan.badgeVariant === 'primary'
                          ? 'bg-[#B55933] text-[#141414]'
                          : plan.badgeVariant === 'disabled'
                            ? 'bg-[#3F3835] text-[#4E4E4E]'
                            : 'bg-[#3F3835] text-[#A1887D]'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  )}
                  <h3
                    className={`[font-family:var(--font-oswald)] text-xl font-bold ${
                      plan.highlight ? 'text-[#B55933]' : plan.disabled ? 'text-[#4E4E4E]' : 'text-white'
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p className="[font-family:var(--font-jetbrains)] text-xs text-[#A1887D]">
                    {plan.description}
                  </p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span
                      className={`[font-family:var(--font-oswald)] text-4xl font-bold ${
                        plan.disabled ? 'text-[#4E4E4E]' : 'text-white'
                      }`}
                    >
                      {plan.price}€
                    </span>
                    <span className="[font-family:var(--font-jetbrains)] text-xs text-[#4E4E4E]">
                      / mois
                    </span>
                  </div>
                  {plan.setup && (
                    <p className="[font-family:var(--font-jetbrains)] text-[10px] text-[#4E4E4E]">
                      {plan.setup}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className={`h-px w-full ${plan.highlight ? 'bg-[#B55933]/25' : 'bg-[#3F3835]'}`} />

                {/* Features */}
                <div className="flex flex-1 flex-col gap-2.5 p-6">
                  {plan.features.map((feat) => (
                    <div key={feat.label} className="flex items-start gap-2.5">
                      {feat.included ? (
                        <Check
                          className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${plan.highlight ? 'text-[#B55933]' : 'text-[#A1887D]'}`}
                        />
                      ) : (
                        <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4E4E4E]" />
                      )}
                      <span
                        className={`[font-family:var(--font-jetbrains)] text-xs ${
                          feat.included
                            ? plan.highlight
                              ? 'text-white'
                              : 'text-[#A1887D]'
                            : 'text-[#4E4E4E]'
                        }`}
                      >
                        {feat.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="p-6 pt-0">
                  {plan.ctaLink && !plan.disabled ? (
                    <Link
                      href={plan.ctaLink}
                      className={`flex w-full items-center justify-center rounded-lg py-2.5 [font-family:var(--font-jetbrains)] text-sm font-bold transition-colors ${
                        plan.ctaVariant === 'primary'
                          ? 'bg-[#B55933] text-[#141414] hover:bg-[#c4633d]'
                          : 'bg-[#3F3835] text-[#A1887D] hover:bg-[#4a4440]'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-[#282828] py-2.5 [font-family:var(--font-jetbrains)] text-sm font-bold text-[#4E4E4E]"
                    >
                      {plan.cta}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center [font-family:var(--font-jetbrains)] text-xs text-[#4E4E4E]">
            Les frais de setup couvrent la configuration initiale et la livraison de vos supports QR.
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────────── */}
      <section className="bg-[#261C17] px-6 py-20 lg:px-[120px] lg:py-24">
        <div className="mx-auto max-w-[1440px] text-center">
          <p className="mb-4 [font-family:var(--font-jetbrains)] text-xs text-[#4E4E4E]">
            // pret_a_demarrer
          </p>
          <h2 className="[font-family:var(--font-oswald)] text-4xl font-bold uppercase text-white lg:text-5xl">
            Prêt à fidéliser vos clients ?
          </h2>
          <p className="mx-auto mt-5 max-w-lg [font-family:var(--font-jetbrains)] text-sm leading-relaxed text-[#A1887D]">
            Commencez gratuitement avec 6 avis offerts. Aucune carte bancaire requise.
          </p>
          <div className="mt-10">
            <Link
              href="/admin/register"
              className="inline-flex items-center rounded-2xl bg-[#B55933] px-12 py-4 [font-family:var(--font-jetbrains)] text-sm font-bold text-[#141414] transition-colors hover:bg-[#c4633d]"
            >
              Créer mon compte gratuitement →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[#3F3835] bg-[#0E0C0B] px-6 py-8 lg:px-[120px]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#B55933]">
              <span className="[font-family:var(--font-oswald)] text-xs font-bold text-white">T</span>
            </div>
            <span className="[font-family:var(--font-oswald)] text-base font-bold text-white">TrustQR</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { label: 'Mentions légales', href: '/mentions-legales' },
              { label: 'Confidentialité', href: '/confidentialite' },
              { label: 'CGV', href: '/cgv' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="[font-family:var(--font-jetbrains)] text-xs text-[#4E4E4E] transition-colors hover:text-[#A1887D]"
              >
                {label}
              </Link>
            ))}
          </div>

          <p className="[font-family:var(--font-jetbrains)] text-xs text-[#3F3835]">
            © {new Date().getFullYear()} TrustQR
          </p>
        </div>
      </footer>
    </div>
  );
}
