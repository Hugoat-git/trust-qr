'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2, CheckCircle } from 'lucide-react';

interface TestimonialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestimonialForm({ open, onOpenChange }: TestimonialFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    restaurantName: '',
    city: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rating: rating || undefined }),
      });
      if (res.ok) {
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setSuccess(false);
      setRating(0);
      setForm({ firstName: '', restaurantName: '', city: '', message: '' });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <DialogTitle>Merci pour votre témoignage !</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Nous l'examinerons et l'afficherons bientôt sur notre site.
            </p>
            <Button onClick={() => handleClose(false)}>Fermer</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Partagez votre expérience</DialogTitle>
              <DialogDescription>
                Votre témoignage sera affiché après validation. Merci de votre confiance !
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    placeholder="Marie"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    placeholder="Lyon"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="restaurantName">Nom du restaurant *</Label>
                <Input
                  id="restaurantName"
                  placeholder="Le Petit Bistrot"
                  required
                  value={form.restaurantName}
                  onChange={(e) => setForm((f) => ({ ...f, restaurantName: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Note (optionnel)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Votre témoignage *</Label>
                <Textarea
                  id="message"
                  placeholder="Depuis qu'on utilise TrustQR, nos avis Google ont explosé..."
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer mon témoignage'
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
