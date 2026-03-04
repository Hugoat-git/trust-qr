'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogoUpload } from '@/components/ui/logo-upload';
import { LogoutButton } from '@/components/admin/logout-button';
import { toast } from 'sonner';
import { Save, Palette, Link as LinkIcon, Clock, Gift, Search, CheckCircle2, AlertCircle, Building2, LogOut, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRLoader } from '@/components/ui/qr-loader';
import type { Restaurant, Prize } from '@/types';

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

interface SettingsFormProps {
  restaurant: Restaurant;
}

export function SettingsForm({ restaurant }: SettingsFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [gbpErrorDialog, setGbpErrorDialog] = useState(false);
  const isGBPConnected = !!(restaurant.google_location_name);

  // Show toast/dialog on return from OAuth callback
  useEffect(() => {
    if (searchParams.get('gbp_connected') === '1') {
      toast.success('Compte Google Business connecté avec succès !');
    } else if (searchParams.get('gbp_connected_no_location') === '1') {
      toast.success('Compte connecté, mais aucun établissement trouvé automatiquement.');
    } else if (searchParams.get('gbp_no_business') === '1' || searchParams.get('gbp_error')) {
      setGbpErrorDialog(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDisconnectGBP = async () => {
    if (!confirm('Déconnecter le compte Google Business ? La vérification des avis reviendra en mode Places API.')) return;
    setDisconnecting(true);
    try {
      const res = await fetch('/api/auth/google-business/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: restaurant.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Compte Google Business déconnecté');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la déconnexion');
    } finally {
      setDisconnecting(false);
    }
  };
  const [logoUrl, setLogoUrl] = useState<string | null>(restaurant.logo_url);
  const [name, setName] = useState(restaurant.name);
  const [primaryColor, setPrimaryColor] = useState(restaurant.primary_color);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(restaurant.google_review_url);
  const [googlePlaceIdOverride, setGooglePlaceIdOverride] = useState(restaurant.google_place_id ?? '');
  const [voucherValidityDays, setVoucherValidityDays] = useState(restaurant.voucher_validity_days);

  // Place ID test state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    placeId: string;
    reviewCount: number;
    latestReviews: { time: number; rating: number; author_name: string }[];
  } | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const parsedPrizes = (typeof restaurant.prizes === 'string'
    ? JSON.parse(restaurant.prizes)
    : restaurant.prizes) as Prize[];
  const [prizes, setPrizes] = useState<Prize[]>(parsedPrizes);

  // Detect which pack matches current prizes
  const detectCurrentPack = (): string => {
    for (const pack of PRIZE_PACKS) {
      if (pack.id === 'custom') continue;
      if (pack.prizes.length !== parsedPrizes.length) continue;
      const matches = pack.prizes.every((pp, i) =>
        parsedPrizes[i] && Number(pp.value) === Number(parsedPrizes[i].value) && Number(pp.probability) === Number(parsedPrizes[i].probability)
      );
      if (matches) return pack.id;
    }
    return 'custom';
  };

  const [selectedPack, setSelectedPack] = useState(detectCurrentPack);
  const [showCustomPrizes, setShowCustomPrizes] = useState(selectedPack === 'custom');

  const handleLogoUpload = (url: string) => {
    setLogoUrl(url);
  };

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

  const handleTestPlaceId = async () => {
    setTesting(true);
    setTestResult(null);
    setTestError(null);

    try {
      const params = new URLSearchParams();
      if (googlePlaceIdOverride.trim()) {
        params.set('placeId', googlePlaceIdOverride.trim());
      } else {
        params.set('reviewUrl', googleReviewUrl.trim());
        params.set('name', name.trim());
      }

      const response = await fetch(`/api/admin/restaurant/test-place-id?${params}`);
      const data = await response.json();

      if (!response.ok) {
        setTestError(data.error || 'Erreur lors du test');
      } else {
        setTestResult(data);
        // Auto-fill the Place ID field if it was resolved automatically
        if (!googlePlaceIdOverride.trim() && data.placeId) {
          setGooglePlaceIdOverride(data.placeId);
        }
      }
    } catch {
      setTestError('Erreur réseau lors du test');
    } finally {
      setTesting(false);
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
      toast.error(`Les probabilités doivent totaliser 100% (actuellement ${totalProbability}%)`);
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
          logoUrl: logoUrl,
          primaryColor,
          googleReviewUrl: googleReviewUrl.trim(),
          googlePlaceIdOverride: googlePlaceIdOverride.trim() || undefined,
          voucherValidityDays,
          prizes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      toast.success('Paramètres sauvegardés !');
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      const message = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle>Logo du restaurant</CardTitle>
          <CardDescription>
            Uploadez votre logo pour personnaliser votre page et vos emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogoUpload
            restaurantId={restaurant.id}
            currentLogoUrl={logoUrl}
            onUploadComplete={handleLogoUpload}
            primaryColor={primaryColor}
          />
        </CardContent>
      </Card>

      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>Détails de votre établissement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du restaurant</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Le Petit Bistrot"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Couleur principale
            </Label>
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="color"
                id="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-0 flex-shrink-0"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-32 flex-shrink-0"
              />
              <div
                className="flex-1 min-w-[80px] h-12 rounded-lg flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Aperçu
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avis Google */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Avis Google
          </CardTitle>
          <CardDescription>Lien vers votre page Google pour les avis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google">Lien Google Avis</Label>
            <Input
              id="google"
              value={googleReviewUrl}
              onChange={(e) => { setGoogleReviewUrl(e.target.value); setTestResult(null); setTestError(null); }}
              placeholder="https://g.page/r/xxx/review"
            />
            <p className="text-xs text-muted-foreground">
              Trouvez ce lien dans Google Business Profile
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placeId" className="flex items-center gap-2">
              Google Place ID
              <span className="text-xs font-normal text-muted-foreground">(optionnel — détecté automatiquement)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="placeId"
                value={googlePlaceIdOverride}
                onChange={(e) => { setGooglePlaceIdOverride(e.target.value); setTestResult(null); setTestError(null); }}
                placeholder="ChIJxxxxxxxxxxxxxxxx"
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTestPlaceId}
                disabled={testing || (!googleReviewUrl.trim() && !googlePlaceIdOverride.trim())}
              >
                {testing ? <QRLoader size={16} className="mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                Tester
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Entrez manuellement si la détection auto est incorrecte. Utilisez "Tester" pour vérifier.
            </p>
          </div>

          {/* Place ID test result */}
          {testError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{testError}</p>
            </div>
          )}

          {testResult && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                Place ID vérifié
              </div>
              <p className="text-xs text-muted-foreground font-mono">{testResult.placeId}</p>
              <p className="text-sm text-foreground">
                <span className="font-semibold">{testResult.reviewCount}</span> avis Google détectés
              </p>
              {testResult.latestReviews.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Derniers avis :</p>
                  {testResult.latestReviews.map((r, i) => (
                    <div key={i} className="text-xs flex items-center gap-2 text-muted-foreground">
                      <span>{'⭐'.repeat(r.rating)}</span>
                      <span>{r.author_name}</span>
                      <span className="ml-auto">{new Date(r.time * 1000).toLocaleDateString('fr-FR')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="validity" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Validité des vouchers (jours)
            </Label>
            <Input
              id="validity"
              type="number"
              min={1}
              max={365}
              value={voucherValidityDays}
              onChange={(e) => setVoucherValidityDays(parseInt(e.target.value) || 30)}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Google Business Profile OAuth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Connexion Google Business
          </CardTitle>
          <CardDescription>
            Connectez votre fiche Google Business pour une détection des avis en temps réel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGBPConnected ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Compte connecté</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono break-all">
                    {restaurant.google_location_name}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    Les avis sont vérifiés en temps réel via votre fiche Google Business
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDisconnectGBP}
                disabled={disconnecting}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-500/10"
              >
                {disconnecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
                Déconnecter
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted border border-border">
                <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Non connecté</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sans connexion, les avis sont vérifiés via l'API Places (cache de 24-72h). La connexion permet une détection quasi-instantanée.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                asChild
              >
                <a href={`/api/auth/google-business?restaurantId=${restaurant.id}&slug=${restaurant.slug}`}>
                  <Building2 className="w-4 h-4 mr-2" />
                  Connecter mon compte Google Business
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration des lots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Configuration des lots
          </CardTitle>
          <CardDescription>
            Choisissez un pack adapté à votre type d'établissement
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
              <p className="text-sm font-medium text-foreground">Configuration personnalisée</p>
              {prizes.map((prize, index) => (
                <div
                  key={index}
                  className="flex flex-wrap items-start gap-3 p-4 bg-muted rounded-lg"
                >
                  <Input
                    value={prize.emoji}
                    onChange={(e) => handlePrizeChange(index, 'emoji', e.target.value)}
                    className="w-14 text-center text-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-[100px]">
                    <Label className="text-xs text-muted-foreground">Réduction (%)</Label>
                    <Input
                      type="number"
                      value={prize.value}
                      onChange={(e) => handlePrizeChange(index, 'value', parseInt(e.target.value) || 0)}
                      min={1}
                      max={100}
                    />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <Label className="text-xs text-muted-foreground">Label</Label>
                    <Input
                      value={prize.label}
                      onChange={(e) => handlePrizeChange(index, 'label', e.target.value)}
                      placeholder="-10%"
                    />
                  </div>
                  <div className="w-full sm:w-24">
                    <Label className="text-xs text-muted-foreground">Probabilité (%)</Label>
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
                  <span className="text-red-500 text-xs">(doit être 100%)</span>
                )}
              </div>
            </div>
          )}

          {/* Show selected pack summary when not custom */}
          {!showCustomPrizes && selectedPack !== 'custom' && (
            <div className="bg-muted rounded-lg p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">Réductions du pack</p>
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

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !name.trim() || !googleReviewUrl.trim()}
          size="lg"
        >
          {saving ? (
            <>
              <QRLoader size={16} className="mr-2" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder les modifications
            </>
          )}
        </Button>
      </div>

      {/* Compte */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="text-base text-red-600 dark:text-red-400 flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Compte
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Vous déconnecter de votre session administrateur.
          </p>
          <LogoutButton variant="destructive" size="sm" className="shrink-0" />
        </CardContent>
      </Card>

      {/* GBP Error Dialog */}
      <Dialog open={gbpErrorDialog} onOpenChange={setGbpErrorDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Connexion Google Business
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-foreground">
              Votre compte Google a bien été autorisé, mais nous n'avons trouvé <strong>aucune fiche Google Business</strong> associée.
            </p>
            <p className="text-sm text-muted-foreground">
              Cela arrive si vous n'avez pas encore de profil d'établissement Google, ou si l'API My Business n'est pas activée dans votre console Google Cloud.
            </p>

            {/* Reassurance block */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <p className="text-xs text-green-700 dark:text-green-300">
                <strong>Aucun impact sur le fonctionnement</strong> — Votre espace TrustQR fonctionne parfaitement sans cette connexion. Les avis sont vérifiés automatiquement via l'API Google Places.
              </p>
            </div>

            <Button className="w-full" onClick={() => setGbpErrorDialog(false)}>
              J'ai compris
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
