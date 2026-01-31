'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Circle, Upload, Palette, Link as LinkIcon, Gift, Clock, Rocket } from 'lucide-react';
import type { Prize } from '@/types';

const defaultPrizes: Prize[] = [
  { value: 5, label: '-5%', emoji: '🎁', probability: 40 },
  { value: 10, label: '-10%', emoji: '🎉', probability: 30 },
  { value: 15, label: '-15%', emoji: '🔥', probability: 15 },
  { value: 20, label: '-20%', emoji: '⭐', probability: 10 },
  { value: 25, label: '-25%', emoji: '💎', probability: 4 },
  { value: 50, label: '-50%', emoji: '🏆', probability: 1 },
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

export default function OnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [voucherValidityDays, setVoucherValidityDays] = useState(30);
  const [prizes, setPrizes] = useState<Prize[]>(defaultPrizes);

  // Progress tracking
  const steps = [
    { id: 'name', label: 'Nom du restaurant', completed: name.length > 0 },
    { id: 'logo', label: 'Logo (optionnel)', completed: logoUrl.length > 0 },
    { id: 'color', label: 'Couleur principale', completed: true },
    { id: 'google', label: 'Lien Google Avis', completed: googleReviewUrl.length > 0 },
    { id: 'prizes', label: 'Configuration des lots', completed: prizes.length > 0 },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  useEffect(() => {
    async function fetchRestaurant() {
      const response = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single();

      // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference workaround
      const data = response.data as any;
      const error = response.error;

      if (error || !data) {
        console.error('Error fetching restaurant:', error);
        toast.error('Erreur lors du chargement');
        return;
      }

      const parsedPrizes = typeof data.prizes === 'string'
        ? JSON.parse(data.prizes)
        : data.prizes || defaultPrizes;

      setRestaurant(data as RestaurantData);
      setName(data.name || '');
      setLogoUrl(data.logo_url || '');
      setPrimaryColor(data.primary_color || '#10b981');
      setGoogleReviewUrl(data.google_review_url || '');
      setVoucherValidityDays(data.voucher_validity_days || 30);
      setPrizes(parsedPrizes);
      setLoading(false);
    }

    fetchRestaurant();
  }, [slug, supabase]);

  const handlePrizeChange = (index: number, field: keyof Prize, value: string | number) => {
    setPrizes(prev => prev.map((prize, i) => {
      if (i !== index) return prize;
      return { ...prize, [field]: value };
    }));
  };

  const handleSave = async () => {
    if (!restaurant) return;

    // Validation
    if (!name.trim()) {
      toast.error('Le nom du restaurant est requis');
      return;
    }

    if (!googleReviewUrl.trim()) {
      toast.error('Le lien Google Avis est requis');
      return;
    }

    // Vérifier que les probabilités totalisent 100%
    const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
    if (totalProbability !== 100) {
      toast.error(`Les probabilités doivent totaliser 100% (actuellement ${totalProbability}%)`);
      return;
    }

    setSaving(true);

    try {
      // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference workaround
      const { error } = await (supabase
        .from('restaurants') as any)
        .update({
          name: name.trim(),
          logo_url: logoUrl.trim() || null,
          primary_color: primaryColor,
          google_review_url: googleReviewUrl.trim(),
          voucher_validity_days: voucherValidityDays,
          prizes: prizes,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', restaurant.id);

      if (error) throw error;

      toast.success('Configuration sauvegardée !');
      router.push(`/admin/${slug}`);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Rocket className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Configuration de votre restaurant</h1>
        <p className="text-gray-500">
          Complétez les informations ci-dessous pour activer votre page de fidélité
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression</span>
            <span className="text-sm text-gray-500">{completedSteps}/{steps.length} étapes</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center text-center">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                <span className="text-xs text-gray-500 mt-1">{step.label}</span>
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
            <Label htmlFor="logo" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              URL du logo (optionnel)
            </Label>
            <Input
              id="logo"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://exemple.com/logo.png"
            />
            {logoUrl && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg flex justify-center">
                <img
                  src={logoUrl}
                  alt="Preview"
                  className="max-h-20 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
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
                Aperçu
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
            Le lien vers lequel les participants seront redirigés pour laisser un avis
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
            <p className="text-xs text-gray-500">
              Trouvez ce lien dans Google Business Profile → Demander des avis
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validity" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Validité des bons (jours)
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

      {/* Configuration des lots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Configuration des lots
          </CardTitle>
          <CardDescription>
            Définissez les réductions et leurs probabilités (total = 100%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prizes.map((prize, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <Input
                  value={prize.emoji}
                  onChange={(e) => handlePrizeChange(index, 'emoji', e.target.value)}
                  className="w-16 text-center text-xl"
                />
                <div className="flex-1">
                  <Label className="text-xs text-gray-500">Réduction (%)</Label>
                  <Input
                    type="number"
                    value={prize.value}
                    onChange={(e) => handlePrizeChange(index, 'value', parseInt(e.target.value) || 0)}
                    min={1}
                    max={100}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-gray-500">Label</Label>
                  <Input
                    value={prize.label}
                    onChange={(e) => handlePrizeChange(index, 'label', e.target.value)}
                    placeholder="-10%"
                  />
                </div>
                <div className="w-24">
                  <Label className="text-xs text-gray-500">Probabilité (%)</Label>
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

            {/* Total des probabilités */}
            <div className="flex justify-end items-center gap-2 text-sm">
              <span className="text-gray-500">Total:</span>
              <span className={`font-bold ${prizes.reduce((s, p) => s + p.probability, 0) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                {prizes.reduce((s, p) => s + p.probability, 0)}%
              </span>
              {prizes.reduce((s, p) => s + p.probability, 0) !== 100 && (
                <span className="text-red-500 text-xs">(doit être 100%)</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
