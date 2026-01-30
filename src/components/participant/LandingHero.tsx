"use client";

import { Gift } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Restaurant } from "@/types";

interface LandingHeroProps {
  restaurant: Restaurant;
  onStart: () => void;
}

export function LandingHero({ restaurant, onStart }: LandingHeroProps) {
  return (
    <Card className="text-center">
      <CardContent className="pt-8 pb-8 space-y-6">
        {restaurant.logo_url ? (
          <div className="w-24 h-24 mx-auto relative rounded-lg overflow-hidden">
            <Image
              src={restaurant.logo_url}
              alt={restaurant.name}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div
            className="w-24 h-24 mx-auto rounded-lg flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: restaurant.primary_color }}
          >
            {restaurant.name.charAt(0)}
          </div>
        )}

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <p className="text-gray-600">Merci pour votre visite !</p>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 space-y-2">
          <Gift className="w-8 h-8 mx-auto text-orange-500" />
          <p className="font-medium">Tentez de gagner jusqu'à</p>
          <p
            className="text-4xl font-bold"
            style={{ color: restaurant.primary_color }}
          >
            -50€
          </p>
          <p className="text-sm text-gray-500">sur votre prochaine visite</p>
        </div>

        <Button
          onClick={onStart}
          size="lg"
          className="w-full text-lg py-6"
          style={{ backgroundColor: restaurant.primary_color }}
        >
          Tenter ma chance 🎁
        </Button>

        <p className="text-xs text-gray-400">
          En participant, vous acceptez de recevoir votre bon par email
        </p>
      </CardContent>
    </Card>
  );
}
