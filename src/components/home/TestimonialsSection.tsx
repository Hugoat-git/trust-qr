'use client';

import { useState } from 'react';
import { Marquee } from '@/components/magicui/marquee';
import { Button } from '@/components/ui/button';
import { TestimonialForm } from './TestimonialForm';
import { Star, MessageSquare } from 'lucide-react';

// Blurred placeholder cards — simulating future testimonials
const placeholders = [
  { initials: 'M.', stars: 5 },
  { initials: 'T.', stars: 5 },
  { initials: 'S.', stars: 4 },
  { initials: 'J.', stars: 5 },
  { initials: 'L.', stars: 5 },
  { initials: 'A.', stars: 4 },
];

function BlurredCard({ initials, stars }: { initials: string; stars: number }) {
  return (
    <div className="relative w-64 shrink-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm overflow-hidden">
      {/* Actual blurred content */}
      <div className="blur-sm select-none pointer-events-none">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500">
            {initials}
          </div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-24 mb-1.5" />
            <div className="h-2.5 bg-gray-100 rounded w-16" />
          </div>
        </div>
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: stars }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <div className="space-y-1.5">
          <div className="h-2.5 bg-gray-100 rounded w-full" />
          <div className="h-2.5 bg-gray-100 rounded w-5/6" />
          <div className="h-2.5 bg-gray-100 rounded w-4/6" />
        </div>
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/30" />
    </div>
  );
}

export function TestimonialsSection() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section className="py-20 px-6 bg-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Ce que pensent nos clients</h2>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Nous démarrons. Soyez parmi les premiers restaurants à partager votre expérience.
          </p>
        </div>

        {/* Blurred marquee */}
        <div className="relative">
          <Marquee pauseOnHover className="[--duration:35s]" repeat={3}>
            {placeholders.map((p, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static
              <BlurredCard key={i} {...p} />
            ))}
          </Marquee>

          {/* Centered overlay CTA */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl px-8 py-6 shadow-xl border border-gray-200 text-center max-w-sm mx-4">
              <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="font-semibold text-gray-900 mb-1">Soyez le premier à témoigner</p>
              <p className="text-sm text-gray-500 mb-4">
                Votre avis aide d'autres restaurateurs à nous faire confiance.
              </p>
              <Button onClick={() => setDialogOpen(true)} size="sm">
                Laisser mon témoignage
              </Button>
            </div>
          </div>
        </div>
      </div>

      <TestimonialForm open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  );
}
