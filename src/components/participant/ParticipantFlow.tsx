"use client";

import { useState } from "react";
import type { Restaurant, Step } from "@/types";
import { CaptureForm } from "./CaptureForm";
import { LandingHero } from "./LandingHero";
import { ResultScreen } from "./ResultScreen";
import { ReviewRedirect } from "./ReviewRedirect";
import { SpinWheel } from "./SpinWheel";

interface ParticipantFlowProps {
  restaurant: Restaurant;
}

interface ParticipationData {
  email: string;
  firstName: string;
  phone?: string;
}

interface ResultData {
  prizeLabel: string;
  prizeValue: number;
  voucherCode: string;
  expiresAt: string;
  reviewStatus: 'pending' | 'verified' | 'expired' | 'skipped';
}

function hexToRgba(hex: string, alpha: number): string {
  // Remove # if present
  const cleanHex = hex.replace("#", "");

  // Parse hex values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ParticipantFlow({ restaurant }: ParticipantFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>("landing");
  const [participationData, setParticipationData] =
    useState<ParticipationData | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [initialReviewCount, setInitialReviewCount] = useState<number>(-1);
  const [initialLatestReviewTime, setInitialLatestReviewTime] = useState<number | null>(null);

  const handleStartClick = () => {
    setCurrentStep("form");
  };

  const handleFormSubmit = (data: ParticipationData) => {
    setParticipationData(data);
    setCurrentStep("review");
  };

  const handleReviewDone = (reviewCount: number, latestReviewTime: number | null) => {
    setInitialReviewCount(reviewCount);
    setInitialLatestReviewTime(latestReviewTime);
    setCurrentStep("spin");
  };

  const handleSpinComplete = (result: ResultData) => {
    setResultData(result);
    setCurrentStep("result");
  };

  const bgColor = restaurant.primary_color.startsWith("#")
    ? hexToRgba(restaurant.primary_color, 0.06)
    : `${restaurant.primary_color}10`;

  // Override la variable CSS --primary pour que toutes les classes Tailwind
  // (bg-primary, text-primary, border-primary) utilisent la couleur du restaurant
  const cssVars = {
    backgroundColor: bgColor,
    '--primary': restaurant.primary_color,
    '--primary-foreground': '#ffffff',
  } as React.CSSProperties;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={cssVars}
    >
      <div className="w-full max-w-md">
        {currentStep === "landing" && (
          <LandingHero restaurant={restaurant} onStart={handleStartClick} />
        )}

        {currentStep === "form" && (
          <CaptureForm restaurant={restaurant} onSubmit={handleFormSubmit} />
        )}

        {currentStep === "review" && (
          <ReviewRedirect restaurant={restaurant} onDone={handleReviewDone} />
        )}

        {currentStep === "spin" && participationData && (
          <SpinWheel
            restaurant={restaurant}
            participationData={participationData}
            initialReviewCount={initialReviewCount}
            initialLatestReviewTime={initialLatestReviewTime}
            onComplete={handleSpinComplete}
          />
        )}

        {currentStep === "result" && resultData && (
          <ResultScreen restaurant={restaurant} result={resultData} />
        )}
      </div>
    </main>
  );
}
