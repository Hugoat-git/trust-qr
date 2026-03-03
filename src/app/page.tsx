import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardPreview } from '@/components/home/CardPreview';
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
} from 'lucide-react';

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
    {
      number: '1',
      title: 'Le client scanne',
      description: 'QR code en caisse ou sur table',
    },
    {
      number: '2',
      title: 'Il laisse un avis',
      description: 'Redirection vers Google Reviews',
    },
    {
      number: '3',
      title: 'Il joue',
      description: 'Retourne une carte pour gagner',
    },
    {
      number: '4',
      title: 'Il revient',
      description: 'Avec son bon de réduction',
    },
  ];

  const pricingPlans = [
    {
      name: 'Essentiel',
      price: '29',
      period: '/mois',
      description: 'Parfait pour démarrer',
      highlight: false,
      features: [
        { label: 'URL personnalisée', included: true },
        { label: 'Template QR Canva gratuit', included: true },
        { label: 'Dashboard analytics', included: true },
        { label: 'Participations illimitées', included: true },
        { label: 'Base CRM (emails/téléphones)', included: true },
        { label: 'QR codes personnalisés', included: false },
        { label: 'Support prioritaire', included: false },
      ],
      cta: 'Commencer gratuitement',
      ctaVariant: 'outline' as const,
    },
    {
      name: 'Pro',
      price: '79',
      period: '/mois',
      description: 'Le plus populaire',
      highlight: true,
      badge: 'Recommandé',
      features: [
        { label: 'Tout le pack Essentiel', included: true },
        { label: '5 QR codes personnalisés', included: true },
        { label: 'Logo au centre du QR', included: true },
        { label: 'Couleurs de votre charte', included: true },
        { label: 'Tracking par QR code', included: true },
        { label: 'Impression pro incluse', included: true },
        { label: 'Support prioritaire', included: true },
      ],
      cta: 'Choisir Pro',
      ctaVariant: 'default' as const,
      setup: '79€ de frais de setup',
    },
    {
      name: 'Premium',
      price: '149',
      period: '/mois',
      description: 'Pour les ambitieux',
      highlight: false,
      badge: 'Bientôt',
      disabled: true,
      features: [
        { label: 'Tout le pack Pro', included: true },
        { label: '10 cartes NFC + QR', included: true },
        { label: 'Installation sur table', included: true },
        { label: 'Tap NFC sans caméra', included: true },
        { label: 'Analytics par table', included: true },
        { label: 'Account manager dédié', included: true },
        { label: 'Formation équipe', included: true },
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
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="text-sm text-gray-600 hover:text-gray-900">
              Connexion
            </Link>
            <Button asChild size="sm">
              <Link href="/admin/register">Commencer</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            +500 avis Google générés ce mois
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Transformez chaque client en
            <span className="text-primary"> ambassadeur</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Collectez des avis Google, fidélisez vos clients avec des réductions gamifiées
            et construisez votre base CRM. Le tout via un simple QR code.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
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
            Pas de carte bancaire requise · Annulez à tout moment
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Comment ça marche ?
          </h2>
          <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
            Un parcours simple et engageant pour vos clients
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200" />
                )}
                <div className="relative z-10 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                  {step.number}
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Card Preview / Try Demo */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-primary rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-primary rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Découvrez l'expérience client
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Vos clients choisissent une carte et découvrent leur réduction. Simple, fun et efficace !
              </p>

              {/* Card Preview Animation */}
              <div className="mb-8">
                <CardPreview />
              </div>

              {/* CTA Button with emphasis */}
              <div className="relative inline-block">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-primary blur-xl opacity-50 animate-pulse rounded-full" />
                <Button
                  asChild
                  size="lg"
                  className="relative text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  <Link href="/demo-resto">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Tenter ma chance
                  </Link>
                </Button>
              </div>

              <p className="mt-4 text-gray-500 text-sm">
                Testez gratuitement · Aucune inscription requise
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Tout ce qu'il vous faut
          </h2>
          <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
            Une solution complète pour fidéliser vos clients et booster votre visibilité
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* Pricing */}
      <section id="tarifs" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Tarifs simples et transparents
          </h2>
          <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
            Choisissez le plan adapté à votre établissement
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.highlight
                    ? 'border-primary shadow-lg scale-105'
                    : 'border-gray-200'
                } ${plan.disabled ? 'opacity-75' : ''}`}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full ${
                      plan.highlight
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center py-4">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    <span className="text-gray-500">{plan.period}</span>
                    {plan.setup && (
                      <p className="text-xs text-gray-400 mt-1">{plan.setup}</p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature.label} className="flex items-center gap-2 text-sm">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
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
                    className="w-full"
                    disabled={plan.disabled}
                  >
                    {plan.disabled ? (
                      <span>{plan.cta}</span>
                    ) : (
                      <Link href="/admin/register">{plan.cta}</Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white">
            Prêt à fidéliser vos clients ?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Rejoignez les restaurants qui utilisent TrustQR pour booster leur réputation
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
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrustQRLogo size={24} className="text-primary" />
              <span className="text-sm text-gray-600">TrustQR</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
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
