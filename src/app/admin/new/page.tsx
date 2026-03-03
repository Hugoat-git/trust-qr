'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Store, ArrowLeft } from 'lucide-react';
import { QRLoader } from '@/components/ui/qr-loader';
import Link from 'next/link';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

export default function NewRestaurantPage() {
  const router = useRouter();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(generateSlug(value));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Le nom du restaurant est requis');
      return;
    }

    if (!slug.trim()) {
      toast.error('Le slug est requis');
      return;
    }

    setCreating(true);

    try {
      const response = await fetch('/api/admin/restaurant/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erreur lors de la création');
        setCreating(false);
        return;
      }

      toast.success('Restaurant créé ! Complétez maintenant sa configuration.');
      router.push(`/admin/${data.slug}/onboarding`);
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Erreur lors de la création du restaurant');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Back link */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à mes restaurants
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Créer un nouveau restaurant</h1>
          <p className="text-muted-foreground">
            Renseignez les informations de base, vous pourrez compléter le reste ensuite
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de base</CardTitle>
            <CardDescription>
              Ces informations permettront de créer votre page de fidélité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du restaurant *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Le Petit Bistrot"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL de votre page *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">trustqr.dev/</span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="le-petit-bistrot"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cette URL sera utilisée par vos clients pour accéder à votre page de fidélité
              </p>
            </div>

            <div className="pt-4 flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating || !name.trim() || !slug.trim()}
                className="flex-1"
              >
                {creating ? (
                  <>
                    <QRLoader size={16} className="mr-2" />
                    Création...
                  </>
                ) : (
                  <>
                    <Store className="w-4 h-4 mr-2" />
                    Créer le restaurant
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
