"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { QRLoader } from '@/components/ui/qr-loader';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Restaurant } from "@/types";

const formSchema = z.object({
  email: z.string().email("Email invalide"),
  firstName: z.string().min(2, "Prénom requis (min 2 caractères)"),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CaptureFormProps {
  restaurant: Restaurant;
  onSubmit: (data: FormData) => void;
  onBack?: () => void;
}

export function CaptureForm({
  restaurant,
  onSubmit,
  onBack,
}: CaptureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    // Simulate small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsSubmitting(false);
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute left-4 top-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <CardTitle className="text-xl">Vos coordonnées</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pour recevoir votre bon de réduction
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              placeholder="Votre prénom"
              {...register("firstName")}
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Téléphone <span className="text-muted-foreground">(optionnel)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="06 12 34 56 78"
              {...register("phone")}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <QRLoader size={16} className="mr-2" />
                Chargement...
              </>
            ) : (
              "Continuer"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Vos données sont utilisées uniquement pour vous envoyer votre bon et
            ne seront jamais partagées.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
