"use client";

import { motion } from "framer-motion";
import { Calendar, Check, CheckCircle2, Copy, Mail, Clock, Loader2 } from "lucide-react";
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
  reviewStatus: 'pending' | 'verified' | 'expired' | 'skipped';
}

interface ResultScreenProps {
  restaurant: Restaurant;
  result: ResultData;
}

export function ResultScreen({ restaurant, result }: ResultScreenProps) {
  const [copied, setCopied] = useState(false);
  const isPending = result.reviewStatus === 'pending';

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
            {isPending ? (
              <Clock
                className="w-16 h-16 mx-auto text-amber-500"
              />
            ) : (
              <CheckCircle2
                className="w-16 h-16 mx-auto text-primary"
              />
            )}
          </motion.div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold">
              {isPending ? "Félicitations !" : "Bravo !"}
            </h2>
            <p className="text-muted-foreground">Vous avez gagné</p>
          </div>

          <div className="text-5xl font-bold text-primary">

            {result.prizeLabel}
          </div>

          {isPending ? (
            // Affichage en attente de vérification
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-center gap-2 text-amber-700">
                <Loader2 className="w-5 h-5 text-amber-700 animate-spin" />
                <span className="font-medium">Vérification en cours</span>
              </div>
              <p className="text-sm text-amber-600">
                Votre code promo vous sera envoyé par email dès que votre avis Google sera vérifié.
              </p>
              <p className="text-xs text-amber-500">
                Généralement sous 30 minutes
              </p>
            </div>
          ) : (
            // Affichage normal avec code
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <p className="text-sm text-muted-foreground">Votre code de réduction</p>
              <div className="flex items-center justify-center gap-2">
                <code
                  className="text-2xl font-mono font-bold tracking-wider px-4 py-2 bg-white rounded border-2 border-dashed border-primary"
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
          )}

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              <span>
                {isPending
                  ? "Vous recevrez votre code par email après vérification"
                  : "Un email de confirmation vous a été envoyé"}
              </span>
            </div>
            {!isPending && (
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Valable jusqu'au {formatDate(result.expiresAt)}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Merci de votre confiance et à très bientôt !
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
