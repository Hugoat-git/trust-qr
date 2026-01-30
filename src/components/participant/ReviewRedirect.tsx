"use client";

import { CheckCircle2, ExternalLink, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Restaurant } from "@/types";

interface ReviewRedirectProps {
  restaurant: Restaurant;
  onDone: () => void;
}

export function ReviewRedirect({ restaurant, onDone }: ReviewRedirectProps) {
  const [hasClickedReview, setHasClickedReview] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const handleReviewClick = () => {
    setHasClickedReview(true);
    window.open(restaurant.google_review_url, "_blank");
  };

  const handleConfirmReview = () => {
    setHasConfirmed(true);
  };

  return (
    <Card>
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
        {!hasClickedReview ? (
          <>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <p className="text-sm text-gray-600">
                Votre avis nous aide à améliorer notre service et permet à
                d'autres clients de nous découvrir. Merci ! 🙏
              </p>
            </div>

            <Button
              onClick={handleReviewClick}
              size="lg"
              className="w-full"
              style={{ backgroundColor: restaurant.primary_color }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Laisser un avis Google
            </Button>
          </>
        ) : !hasConfirmed ? (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Page Google ouverte !</span>
              </div>
              <p className="text-sm text-green-600">
                Prenez le temps de laisser votre avis, puis revenez ici.
              </p>
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-gray-500 mb-3 text-center">
                Vous avez laissé votre avis ?
              </p>
              <Button
                onClick={handleConfirmReview}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Oui, j'ai laissé mon avis
              </Button>
            </div>

            <button
              type="button"
              onClick={handleReviewClick}
              className="text-sm text-gray-400 hover:text-gray-600 w-full text-center"
            >
              Rouvrir la page Google
            </button>
          </>
        ) : (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
              <p className="font-medium text-green-700">
                Merci pour votre avis !
              </p>
            </div>

            <Button
              onClick={onDone}
              size="lg"
              className="w-full"
              style={{ backgroundColor: restaurant.primary_color }}
            >
              Découvrir ma réduction 🎁
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
