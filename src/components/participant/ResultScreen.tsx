"use client";

import { motion } from "framer-motion";
import { Calendar, Check, CheckCircle2, Copy, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Restaurant } from "@/types";

interface ResultData {
  prizeLabel: string;
  prizeValue: number;
  voucherCode: string;
  expiresAt: string;
}

interface ResultScreenProps {
  restaurant: Restaurant;
  result: ResultData;
}

export function ResultScreen({ restaurant, result }: ResultScreenProps) {
  const [copied, setCopied] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(result.voucherCode);
      setCopied(true);
      toast.success("Code copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le code");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="py-8 text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          >
            <CheckCircle2
              className="w-16 h-16 mx-auto"
              style={{ color: restaurant.primary_color }}
            />
          </motion.div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Bravo !</h2>
            <p className="text-gray-600">Vous avez gagné</p>
          </div>

          <div
            className="text-5xl font-bold"
            style={{ color: restaurant.primary_color }}
          >
            {result.prizeLabel}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <p className="text-sm text-gray-500">Votre code de réduction</p>
            <div className="flex items-center justify-center gap-2">
              <code
                className="text-2xl font-mono font-bold tracking-wider px-4 py-2 bg-white rounded border-2 border-dashed"
                style={{ borderColor: restaurant.primary_color }}
              >
                {result.voucherCode}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              <span>Un email de confirmation vous a été envoyé</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Valable jusqu'au {formatDate(result.expiresAt)}</span>
            </div>
          </div>

          <div
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 text-sm"
            style={{ borderLeft: `4px solid ${restaurant.primary_color}` }}
          >
            <p className="font-medium text-gray-700">
              Présentez ce code en caisse lors de votre prochaine visite chez{" "}
              <span style={{ color: restaurant.primary_color }}>
                {restaurant.name}
              </span>
            </p>
          </div>

          <p className="text-xs text-gray-400">
            Merci de votre confiance et à très bientôt !
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
