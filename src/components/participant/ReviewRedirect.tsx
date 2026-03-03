"use client";

import { CheckCircle2, ExternalLink, Star, ArrowDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Restaurant } from "@/types";

interface ReviewRedirectProps {
  restaurant: Restaurant;
  onDone: (initialReviewCount: number, latestReviewTime: number | null) => void;
}

export function ReviewRedirect({ restaurant, onDone }: ReviewRedirectProps) {
  const [hasClickedReview, setHasClickedReview] = useState(false);
  const [hasReturnedToTab, setHasReturnedToTab] = useState(false);
  const [initialReviewCount, setInitialReviewCount] = useState<number | null>(null);
  const [latestReviewTime, setLatestReviewTime] = useState<number | null>(null);

  // Fetch initial review count + timestamp of most recent review (baseline before leaving review)
  useEffect(() => {
    const fetchReviewCount = async () => {
      try {
        const response = await fetch(`/api/review-count?restaurantId=${restaurant.id}`);
        const data = await response.json();
        setInitialReviewCount(data.reviewCount ?? -1);
        setLatestReviewTime(data.latestReviewTime ?? null);
      } catch (error) {
        console.error("Error fetching review count:", error);
        setInitialReviewCount(-1);
        setLatestReviewTime(null);
      }
    };
    fetchReviewCount();
  }, [restaurant.id]);

  // Detect when user comes back to this tab after leaving for Google
  const handleVisibilityChange = useCallback(() => {
    if (hasClickedReview && document.visibilityState === "visible") {
      setHasReturnedToTab(true);
    }
  }, [hasClickedReview]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [handleVisibilityChange]);

  const handleReviewClick = () => {
    setHasClickedReview(true);
    window.open(restaurant.google_review_url, "_blank");
  };

  const handleConfirmReview = () => {
    onDone(initialReviewCount ?? -1, latestReviewTime);
  };

  // ── Pre-click: ask for review ──
  if (!hasClickedReview) {
    return (
      <Card className="w-full border-0 shadow-none rounded-none bg-transparent">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-2">
            <Star className="w-8 h-8 text-amber-500" />
          </div>
          <CardTitle className="text-xl">Une dernière étape !</CardTitle>
          <p className="text-sm text-gray-500">
            Laissez-nous un avis Google pour débloquer votre réduction
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <p className="text-sm text-gray-600">
              Votre avis nous aide à améliorer notre service et permet à
              d'autres clients de nous découvrir. Merci ! 🙏
            </p>
          </div>

          {/* Pre-reminder: plant the seed */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
            <ArrowDown className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
            <p className="text-xs text-amber-700 font-medium">
              Après votre avis, revenez ici pour récupérer votre réduction
            </p>
          </div>

          <Button
            onClick={handleReviewClick}
            size="lg"
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Laisser un avis Google
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Post-click: waiting for user to come back ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full overflow-hidden border-0 shadow-none rounded-none bg-transparent">
        {/* ── Prominent animated banner ── */}
        <div
          className="relative px-5 py-5 text-center overflow-hidden"
          style={{ backgroundColor: restaurant.primary_color }}
        >
          {/* Subtle shimmer effect */}
          <div
            className="pointer-events-none absolute inset-0 animate-shimmer"
            style={{
              background: `linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)`,
              backgroundSize: "200% 100%",
            }}
          />

          <AnimatePresence mode="wait">
            {hasReturnedToTab ? (
              // ── User has returned! Celebrate ──
              <motion.div
                key="returned"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.1 }}
                  className="w-12 h-12 mx-auto mb-2 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-white font-bold text-lg">
                  Super, vous êtes de retour ! 🎉
                </h3>
                <p className="text-white/80 text-sm mt-1">
                  Cliquez ci-dessous pour découvrir votre réduction
                </p>
              </motion.div>
            ) : (
              // ── Waiting for user to return ──
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
                {/* Pulsing dot */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="relative flex h-3 w-3">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                      style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
                    />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                  </span>
                  <span className="text-white/90 text-xs font-semibold uppercase tracking-wider">
                    En attente
                  </span>
                </div>

                <h3 className="text-white font-bold text-lg leading-snug">
                  Revenez ici après votre avis
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  Ne fermez pas cette page !
                </p>

                {/* Bouncing arrow */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="mt-3 flex justify-center"
                >
                  <ArrowDown className="w-5 h-5 text-white/60" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Body ── */}
        <CardContent className="pt-5 space-y-4">
          {hasReturnedToTab ? (
            <Button
              onClick={handleConfirmReview}
              size="lg"
              className="w-full h-12 text-base font-semibold"
            >
              Découvrir ma réduction 🎁
            </Button>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Page Google ouverte !</span>
                </div>
                <p className="text-sm text-green-600">
                  Prenez le temps de laisser votre avis, puis revenez sur cette page.
                </p>
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-500 mb-3 text-center">
                  Vous avez laissé votre avis ?
                </p>
                <Button
                  onClick={handleConfirmReview}
                  size="lg"
                  className="w-full"
                >
                  Découvrir ma réduction 🎁
                </Button>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={handleReviewClick}
            className="text-sm text-gray-400 hover:text-gray-600 w-full text-center"
          >
            Rouvrir la page Google
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
