import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardPreview } from '@/components/home/CardPreview';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { TrustQRLogo } from '@/components/ui/trustqr-logo';
import {
  QrCode,
  Star,
  Gift,
  TrendingUp,
  Users,
  Zap,
  ChevronRight,
  Check,
  X,
  Sparkles,
  Package,
  Bot,
  BarChart3,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'TrustQR — Collectez des avis Google et fidélisez vos clients',
  description:
    'TrustQR transforme chaque client en ambassadeur : collectez des avis Google, fidélisez avec des réductions gamifiées et construisez votre base CRM. Via un simple QR code.',
  keywords: [
    'avis Google restaurant',
    'fidélisation client restaurant',
    'QR code restaurant',
    'collecte avis Google',
    'programme fidélité restaurant',
  ],
  openGraph: {
    title: 'TrustQR — Collectez des avis Google et fidélisez vos clients',
    description:
      'Transformez chaque client en ambassadeur grâce à un QR code intelligent. Avis Google, réductions gamifiées, CRM.',
    url: 'https://trustqr.dev',
    siteName: 'TrustQR',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function HomePage() {
  const features = [
    {
      icon: QrCode,
      title: 'QR Code unique',
      description: 'Chaque restaurant a son propre QR code à afficher en caisse ou sur table.',
    },
    {
      icon: Star,
      title: 'Collecte d\'avis Google',
      description: 'Redirigez vos clients vers Google pour booster votre réputation en ligne.',
    },
    {
      icon: Gift,
      title: 'Réductions gamifiées',
      description: 'Vos clients retournent des cartes pour découvrir leur réduction. Fun et engageant !',
    },
    {
      icon: TrendingUp,
      title: 'Dashboard analytics',
      description: 'Suivez vos participations, taux de conversion et avis en temps réel.',
    },
    {
      icon: Users,
      title: 'Base clients CRM',
      description: 'Récupérez emails et téléphones pour vos futures campagnes marketing.',
    },
    {
      icon: Zap,
      title: 'Emails automatiques',
      description: 'Envoyez automatiquement les bons de réduction par email.',
    },
  ];

  const steps = [
    { number: '1', icon: QrCode, title: 'Le client scanne', description: 'QR code en caisse ou sur table' },
    { number: '2', icon: Gift, title: 'Il joue', description: 'Retourne une carte pour gagner' },
    { number: '3', icon: Star, title: 'Il laisse un avis', description: 'Redirection vers Google Reviews' },
    { number: '4', icon: TrendingUp, title: 'Il revient', description: 'Avec son bon de réduction' },
  ];

  const pricingPlans = [
    {
      name: 'Gratuit',
      price: '0',
      period: '',
      description: 'Pour tester sans risque',
      highlight: false,
      badge: 'Sans CB',
      badgeColor: 'bg-green-100 text-green-700',
      features: [
        { label: 'Jusqu\'à 6 avis Google collectés', included: true },
        { label: '1 QR code offert', included: true },
        { label: 'Dashboard analytics basique', included: true },
        { label: 'Page participant personnalisée', included: false },
        { label: 'Mini CRM (emails/téléphones)', included: false },
        { label: 'Supports QR livrés chez vous', included: false },
        { label: 'Agent IA réponses aux avis', included: false },
      ],
      cta: 'Commencer gratuitement',
      ctaVariant: 'outline' as const,
      ctaLink: '/admin/register',
    },
    {
      name: 'Starter',
      price: '39',
      period: '/mois',
      description: 'Pour démarrer sérieusement',
      highlight: false,
      badge: null,
      features: [
        { label: 'Avis illimités au-delà de 6', included: true },
        { label: '1 restaurant', included: true },
        { label: 'Supports QR livrés (jusqu\'à 10)', included: true },
        { label: 'Mini CRM (emails/téléphones)', included: true },
        { label: 'Dashboard analytics complet', included: true },
        { label: 'Campagnes emailing automatiques', included: false },
        { label: 'Agent IA réponses aux avis', included: false },
      ],
      cta: 'Choisir Starter',
      ctaVariant: 'outline' as const,
      ctaLink: '/admin/register',
    },
    {
      name: 'Pro',
      price: '79',
      period: '/mois',
      description: 'Le plus populaire',
      highlight: true,
      badge: 'Recommandé',
      badgeColor: 'bg-primary text-white',
      features: [
        { label: 'Tout le pack Starter', included: true },
        { label: 'Jusqu\'à 3 restaurants', included: true },
        { label: 'Analytics Google Business', included: true },
        { label: 'Campagnes emailing automatiques', included: true },
        { label: 'Agent IA réponses personnalisées', included: true },
        { label: 'QR codes personnalisés (logo + couleurs)', included: true },
        { label: 'Supports QR illimités (max 10/restau)', included: true },
      ],
      cta: 'Choisir Pro',
      ctaVariant: 'default' as const,
      ctaLink: '/admin/register',
      setup: '79€ de frais de setup',
    },
    {
      name: 'Enterprise',
      price: '149',
      period: '/mois',
      description: 'Pour les groupes ambitieux',
      highlight: false,
      badge: 'Bientôt',
      badgeColor: 'bg-gray-200 text-gray-600',
      disabled: true,
      features: [
        { label: 'Tout le pack Pro', included: true },
        { label: 'Restaurants illimités', included: true },
        { label: 'Page participant entièrement custom', included: true },
        { label: 'QR codes NFC + physiques premium', included: true },
        { label: 'Account manager dédié', included: true },
        { label: 'Formation équipe incluse', included: true },
        { label: 'Intégrations sur mesure', included: true },
      ],
      cta: 'Bientôt disponible',
      ctaVariant: 'outline' as const,
      setup: '199€ de frais de setup',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrustQRLogo size={28} className="text-primary" />
            <span className="font-semibold text-gray-900">TrustQR</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#fonctionnalites" className="text-sm text-gray-600 hover:text-gray-900">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="text-sm text-gray-600 hover:text-gray-900">
              Tarifs
            </a>
            <Link href="/demo-resto" className="text-sm text-gray-600 hover:text-gray-900">
              Démo
            </Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/admin/login" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">
              Connexion
            </Link>
            <Button asChild size="sm">
              <Link href="/admin/register">Commencer</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero — split layout */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Essai gratuit · Sans carte bancaire
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Transformez chaque client en
                <span className="text-primary"> ambassadeur</span>
              </h1>
              <p className="mt-5 text-lg text-gray-600 max-w-lg">
                Collectez des avis Google, fidélisez vos clients avec des réductions gamifiées
                et construisez votre base CRM. Le tout via un simple QR code.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="text-base">
                  <Link href="/admin/register">
                    Essayer gratuitement
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link href="/demo-resto">Voir la démo</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                6 avis offerts · Pas de carte bancaire · Annulez à tout moment
              </p>
            </div>

            {/* Right: interactive card demo */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 text-center">
                  <p className="text-gray-400 text-sm mb-4">
                    <Sparkles className="w-3.5 h-3.5 inline mr-1 opacity-60" />
                    L'expérience client en action
                  </p>
                  <CardPreview />
                  <div className="mt-6 relative inline-block">
                    <div className="absolute inset-0 bg-primary blur-xl opacity-40 animate-pulse rounded-full" />
                    <Button
                      asChild
                      className="relative bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                    >
                      <Link href="/demo-resto">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Tenter ma chance
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-8 px-4 sm:px-6 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {[
              { icon: Gift, value: '6 avis', label: 'offerts à l\'inscription' },
              { icon: Zap, value: '< 2 min', label: 'pour démarrer' },
              { icon: Users, value: '0€', label: 'sans engagement CB' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <Icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                <p className="text-base sm:text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">
            Comment ça marche ?
          </h2>
          <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
            Un parcours simple et engageant pour vos clients
          </p>

          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+2.25rem)] right-0 h-px bg-gradient-to-r from-gray-300 to-gray-100" />
                )}
                <div className="relative z-10 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="mt-2 text-xs font-semibold text-primary">Étape {step.number}</div>
                <h3 className="mt-1 font-semibold text-gray-900 text-sm sm:text-base">{step.title}</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">
            Tout ce qu'il vous faut
          </h2>
          <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
            Une solution complète pour fidéliser vos clients et booster votre visibilité
          </p>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-gray-100">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Pricing */}
      <section id="tarifs" className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">
            Tarifs simples et transparents
          </h2>
          <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
            Commencez gratuitement, évoluez selon vos besoins
          </p>

          {/* Pro features highlight */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            {[
              { icon: BarChart3, label: 'Analytics Google Business' },
              { icon: Bot, label: 'Agent IA réponses aux avis' },
              { icon: Package, label: 'Supports QR livrés chez vous' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-1.5">
                <Icon className="w-4 h-4 text-primary" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.highlight
                    ? 'border-primary shadow-lg ring-1 ring-primary/20'
                    : 'border-gray-200'
                } ${plan.disabled ? 'opacity-70' : ''}`}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                      plan.badgeColor || 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </CardHeader>
                <CardContent className="pt-0 flex flex-col flex-1">
                  <div className="text-center py-4">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    <span className="text-gray-500">{plan.period}</span>
                    {plan.setup && (
                      <p className="text-xs text-gray-400 mt-1">{plan.setup}</p>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.label} className="flex items-start gap-2 text-sm">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                          {feature.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild={!plan.disabled}
                    variant={plan.ctaVariant}
                    className="w-full mt-auto"
                    disabled={plan.disabled}
                  >
                    {plan.disabled ? (
                      <span>{plan.cta}</span>
                    ) : (
                      <Link href={plan.ctaLink ?? '/admin/register'}>{plan.cta}</Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Les frais de setup couvrent la configuration initiale et la livraison de vos supports QR.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Prêt à fidéliser vos clients ?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/80">
            Commencez gratuitement avec 6 avis offerts. Aucune carte bancaire requise.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link href="/admin/register">
                Créer mon compte gratuitement
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrustQRLogo size={24} className="text-primary" />
              <span className="text-sm text-gray-600">TrustQR</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-sm text-gray-500 flex-wrap justify-center">
              <Link href="/mentions-legales" className="hover:text-gray-900">
                Mentions légales
              </Link>
              <Link href="/confidentialite" className="hover:text-gray-900">
                Confidentialité
              </Link>
              <Link href="/cgv" className="hover:text-gray-900">
                CGV
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} TrustQR
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
