'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, Circle, Palette, Link as LinkIcon, Gift, Clock, Rocket, X, ArrowRight, ChevronDown, QrCode, Camera } from 'lucide-react';
import { QRLoader } from '@/components/ui/qr-loader';
import { LogoUpload } from '@/components/ui/logo-upload';
import { QRScanner } from '@/components/admin/qr-scanner';
import type { Prize } from '@/types';

const DEFAULT_COLOR = '#10b981';

const PRIZE_PACKS: { id: string; name: string; description: string; prizes: Prize[] }[] = [
  {
    id: 'premium',
    name: 'Pack Premium',
    description: 'Restaurant gastronomique, bar a cocktails, spa — grosses reductions rares',
    prizes: [
      { value: 5, label: '-5%', emoji: '🎁', probability: 35 },
      { value: 10, label: '-10%', emoji: '🎉', probability: 30 },
      { value: 15, label: '-15%', emoji: '🔥', probability: 20 },
      { value: 20, label: '-20%', emoji: '⭐', probability: 10 },
      { value: 30, label: '-30%', emoji: '💎', probability: 4 },
      { value: 50, label: '-50%', emoji: '🏆', probability: 1 },
    ],
  },
  {
    id: 'fast-food',
    name: 'Pack Restauration Rapide',
    description: 'Fast-food, kebab, pizzeria — petites reductions frequentes',
    prizes: [
      { value: 5, label: '-5%', emoji: '🎁', probability: 45 },
      { value: 10, label: '-10%', emoji: '🎉', probability: 30 },
      { value: 15, label: '-15%', emoji: '🔥', probability: 15 },
      { value: 20, label: '-20%', emoji: '⭐', probability: 8 },
      { value: 25, label: '-25%', emoji: '💎', probability: 2 },
    ],
  },
  {
    id: 'brasserie',
    name: 'Pack Brasserie & Bistrot',
    description: 'Brasserie, bistrot, cafe — equilibre entre reductions et valeur',
    prizes: [
      { value: 5, label: '-5%', emoji: '🎁', probability: 40 },
      { value: 10, label: '-10%', emoji: '🎉', probability: 30 },
      { value: 15, label: '-15%', emoji: '🔥', probability: 15 },
      { value: 20, label: '-20%', emoji: '⭐', probability: 10 },
      { value: 25, label: '-25%', emoji: '💎', probability: 4 },
      { value: 50, label: '-50%', emoji: '🏆', probability: 1 },
    ],
  },
  {
    id: 'custom',
    name: 'Pack personnalise',
    description: 'Configurez vos propres reductions et probabilites',
    prizes: [],
  },
];

interface RestaurantData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  google_review_url: string;
  voucher_validity_days: number;
  prizes: Prize[];
  is_active: boolean;
}

interface OnboardingFormProps {
  restaurant: RestaurantData;
}

export function OnboardingForm({ restaurant }: OnboardingFormProps) {
  const router = useRouter();
  const slug = restaurant.slug;

  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [hasLinkedQR, setHasLinkedQR] = useState(false);
  const [linkingQR, setLinkingQR] = useState(false);

  // Form state
  const [name, setName] = useState(restaurant.name || '');
  const [logoUrl, setLogoUrl] = useState(restaurant.logo_url || '');
  const [primaryColor, setPrimaryColor] = useState(restaurant.primary_color || DEFAULT_COLOR);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(restaurant.google_review_url || '');
  const [voucherValidityDays, setVoucherValidityDays] = useState(restaurant.voucher_validity_days || 30);

  // Check if QR codes are already linked
  useState(() => {
    fetch(`/api/admin/qr-codes?restaurantId=${restaurant.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.qrCodes && data.qrCodes.length > 0) {
          setHasLinkedQR(true);
        }
      })
      .catch(() => {});
  });

  const handleQRScan = async (code: string) => {
    setShowScanner(false);
    setLinkingQR(true);
    try {
      const response = await fetch('/api/admin/qr-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: restaurant.id, code }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Erreur lors de la liaison du QR code');
        return;
      }
      toast.success('QR code lie avec succes !');
      setHasLinkedQR(true);
    } catch {
      toast.error('Erreur lors de la liaison du QR code');
    } finally {
      setLinkingQR(false);
    }
  };

  const parsedPrizes = typeof restaurant.prizes === 'string'
    ? JSON.parse(restaurant.prizes)
    : restaurant.prizes;
  const [prizes, setPrizes] = useState<Prize[]>(parsedPrizes);

  // Detect which pack is selected (or custom)
  const detectCurrentPack = (): string => {
    for (const pack of PRIZE_PACKS) {
      if (pack.id === 'custom') continue;
      if (pack.prizes.length !== prizes.length) continue;
      const matches = pack.prizes.every((pp, i) =>
        prizes[i] && Number(pp.value) === Number(prizes[i].value) && Number(pp.probability) === Number(prizes[i].probability)
      );
      if (matches) return pack.id;
    }
    return 'custom';
  };

  const [selectedPack, setSelectedPack] = useState(detectCurrentPack);
  const [showCustomPrizes, setShowCustomPrizes] = useState(selectedPack === 'custom');

  // Progress tracking - 5 meaningful steps
  const colorChanged = primaryColor !== DEFAULT_COLOR;
  const steps = [
    { id: 'name', label: 'Nom', completed: name.length > 0 },
    { id: 'logo', label: 'Logo', completed: logoUrl.length > 0 },
    { id: 'color', label: 'Couleur', completed: colorChanged },
    { id: 'google', label: 'Google Avis', completed: googleReviewUrl.length > 0 },
    { id: 'qr', label: 'QR Code', completed: hasLinkedQR },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const handlePrizeChange = (index: number, field: keyof Prize, value: string | number) => {
    setPrizes(prev => prev.map((prize, i) => {
      if (i !== index) return prize;
      return { ...prize, [field]: value };
    }));
    setSelectedPack('custom');
    setShowCustomPrizes(true);
  };

  const handlePackSelect = (packId: string) => {
    setSelectedPack(packId);
    if (packId === 'custom') {
      setShowCustomPrizes(true);
    } else {
      const pack = PRIZE_PACKS.find(p => p.id === packId);
      if (pack) {
        setPrizes([...pack.prizes]);
        setShowCustomPrizes(false);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Le nom du restaurant est requis');
      return;
    }

    if (!googleReviewUrl.trim()) {
      toast.error('Le lien Google Avis est requis');
      return;
    }

    const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
    if (totalProbability !== 100) {
      toast.error(`Les probabilites doivent totaliser 100% (actuellement ${totalProbability}%)`);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/admin/restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          name: name.trim(),
          logoUrl: logoUrl.trim() || null,
          primaryColor,
          googleReviewUrl: googleReviewUrl.trim(),
          voucherValidityDays,
          prizes,
          isFirstSetup: !restaurant.is_active,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      toast.success('Configuration sauvegardee !');
      setCompleted(true);
    } catch (error) {
      console.error('Save error:', error);
      const message = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(`onboarding_dismissed_${slug}`, 'true');
    router.push(`/admin/${slug}`);
  };

  const handleGoToDashboard = () => {
    localStorage.setItem(`onboarding_dismissed_${slug}`, 'true');
    router.push(`/admin/${slug}`);
    router.refresh();
  };

  if (completed) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Votre restaurant est pret !</h1>
          <p className="text-muted-foreground">
            La configuration est terminee. Votre page de fidelite est maintenant active.
          </p>
        </div>
        <Button onClick={handleGoToDashboard} size="lg">
          Acceder au dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="max-w-3xl mx-auto space-y-8"
      style={{ '--primary': primaryColor } as React.CSSProperties}
    >
      {/* Header */}
      <div className="relative text-center space-y-2">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-0 right-0 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent"
          title="Fermer et ne plus afficher"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Rocket className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Configuration de votre restaurant</h1>
        <p className="text-muted-foreground">
          Completez les informations ci-dessous pour activer votre page de fidelite
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression</span>
            <span className="text-sm text-muted-foreground">{completedSteps}/{steps.length} etapes</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 flex justify-around">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center text-center">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground/50" />
                )}
                <span className="text-xs text-muted-foreground mt-1">{step.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Informations de base
          </CardTitle>
          <CardDescription>Le nom et l'apparence de votre restaurant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du restaurant *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Le Petit Bistrot"
            />
          </div>

          <div className="space-y-2">
            <Label className="block mb-2">Logo (optionnel)</Label>
            <LogoUpload
              restaurantId={restaurant.id}
              currentLogoUrl={logoUrl || null}
              onUploadComplete={(url) => setLogoUrl(url)}
              primaryColor={primaryColor}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Couleur principale
            </Label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                id="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-32"
              />
              <div
                className="flex-1 h-12 rounded-lg flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Apercu
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lien Google */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Avis Google
          </CardTitle>
          <CardDescription>
            Le lien vers lequel les participants seront rediriges pour laisser un avis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google">Lien Google Avis *</Label>
            <Input
              id="google"
              value={googleReviewUrl}
              onChange={(e) => setGoogleReviewUrl(e.target.value)}
              placeholder="https://g.page/r/xxx/review"
            />
            <p className="text-xs text-muted-foreground">
              Trouvez ce lien dans Google Business Profile &rarr; Demander des avis
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validity" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Validite des bons (jours)
            </Label>
            <Input
              id="validity"
              type="number"
              min={1}
              max={365}
              value={voucherValidityDays}
              onChange={(e) => setVoucherValidityDays(parseInt(e.target.value) || 30)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuration des lots avec packs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Configuration des lots
          </CardTitle>
          <CardDescription>
            Choisissez un pack adapte a votre type d'etablissement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pack selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRIZE_PACKS.map((pack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => handlePackSelect(pack.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedPack === pack.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-border hover:bg-accent'
                }`}
              >
                <p className={`text-sm font-semibold ${selectedPack === pack.id ? 'text-primary' : 'text-foreground'}`}>
                  {pack.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{pack.description}</p>
                {pack.id !== 'custom' && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pack.prizes.map((p, i) => (
                      <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {p.emoji} {p.label}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Custom prizes editor */}
          {showCustomPrizes && (
            <div className="space-y-4 pt-4 border-t">
              <p className="text-sm font-medium text-foreground">Configuration personnalisee</p>
              {prizes.map((prize, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-muted rounded-lg"
                >
                  <Input
                    value={prize.emoji}
                    onChange={(e) => handlePrizeChange(index, 'emoji', e.target.value)}
                    className="w-16 text-center text-xl"
                  />
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Reduction (%)</Label>
                    <Input
                      type="number"
                      value={prize.value}
                      onChange={(e) => handlePrizeChange(index, 'value', parseInt(e.target.value) || 0)}
                      min={1}
                      max={100}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Label</Label>
                    <Input
                      value={prize.label}
                      onChange={(e) => handlePrizeChange(index, 'label', e.target.value)}
                      placeholder="-10%"
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-xs text-muted-foreground">Probabilite (%)</Label>
                    <Input
                      type="number"
                      value={prize.probability}
                      onChange={(e) => handlePrizeChange(index, 'probability', parseInt(e.target.value) || 0)}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-end items-center gap-2 text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className={`font-bold ${prizes.reduce((s, p) => s + p.probability, 0) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {prizes.reduce((s, p) => s + p.probability, 0)}%
                </span>
                {prizes.reduce((s, p) => s + p.probability, 0) !== 100 && (
                  <span className="text-red-500 text-xs">(doit etre 100%)</span>
                )}
              </div>
            </div>
          )}

          {/* Show selected pack summary when not custom */}
          {!showCustomPrizes && selectedPack !== 'custom' && (
            <div className="bg-muted rounded-lg p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">Reductions du pack</p>
                <button
                  type="button"
                  onClick={() => setShowCustomPrizes(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Modifier
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {prizes.map((p, i) => (
                  <div key={i} className="flex items-center gap-1 bg-card px-2 py-1 rounded-lg border text-xs">
                    <span>{p.emoji}</span>
                    <span className="font-medium">{p.label}</span>
                    <span className="text-muted-foreground">({p.probability}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code linking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Lier votre QR Code
          </CardTitle>
          <CardDescription>
            Scannez le QR code physique que vous avez recu pour le lier a votre restaurant
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasLinkedQR ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-900">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">QR Code lie !</p>
                <p className="text-sm text-green-600">
                  Vous pourrez en ajouter d'autres depuis le menu QR Codes.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-xl text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Utilisez la camera de votre telephone pour scanner le QR code physique fourni.
                </p>
                <Button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  disabled={linkingQR}
                  variant="outline"
                  className="w-full"
                >
                  {linkingQR ? (
                    <QRLoader size={16} className="mr-2" />
                  ) : (
                    <QrCode className="w-4 h-4 mr-2" />
                  )}
                  {linkingQR ? 'Liaison en cours...' : 'Scanner mon QR code'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/${slug}`)}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !name.trim() || !googleReviewUrl.trim()}
        >
          {saving ? (
            <>
              <QRLoader size={16} className="mr-2" />
              Sauvegarde...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Sauvegarder et activer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
