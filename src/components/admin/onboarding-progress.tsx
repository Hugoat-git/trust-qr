'use client';

import Link from 'next/link';
import { Rocket, ChevronRight } from 'lucide-react';

const DEFAULT_COLOR = '#10b981';

interface OnboardingProgressProps {
  slug: string;
  name: string;
  googleReviewUrl: string;
  logoUrl: string | null;
  primaryColor: string;
  hasLinkedQR?: boolean;
}

export function OnboardingProgress({
  slug,
  name,
  googleReviewUrl,
  logoUrl,
  primaryColor,
  hasLinkedQR,
}: OnboardingProgressProps) {
  const steps = [
    { id: 'name', completed: name && name.length > 0 },
    { id: 'logo', completed: logoUrl && logoUrl.length > 0 },
    { id: 'color', completed: primaryColor && primaryColor !== DEFAULT_COLOR },
    { id: 'google', completed: googleReviewUrl && googleReviewUrl.length > 0 },
    { id: 'qr', completed: !!hasLinkedQR },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;
  const isComplete = completedSteps === totalSteps;

  if (isComplete) {
    return null;
  }

  // SVG circle props
  const size = 40;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="mx-4 mb-4">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
        <Link href={`/admin/${slug}/onboarding`} className="flex items-center gap-4 group">
          {/* Cercle de progression */}
          <div className="relative flex-shrink-0">
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-muted"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-primary transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Texte */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              Configuration
            </p>
            <p className="text-xs text-muted-foreground">
              {completedSteps}/{totalSteps} etapes completees
            </p>
          </div>

          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
