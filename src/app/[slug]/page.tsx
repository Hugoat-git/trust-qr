import { notFound } from "next/navigation";
import { ParticipantFlow } from "@/components/participant/ParticipantFlow";
import { supabase } from "@/lib/supabase";
import { FREE_PLAN_LIMIT } from "@/lib/branding";
import type { Database } from "@/types/database";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type RestaurantRow = Database["public"]["Tables"]["restaurants"]["Row"];

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params;

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    notFound();
  }

  const restaurant = data as RestaurantRow;

  // Bloquer si le restaurant a atteint la limite freemium
  if (restaurant.plan === 'free' && restaurant.confirmed_reviews_count >= FREE_PLAN_LIMIT) {
    notFound();
  }

  // Parse prizes (stocké en JSONB)
  const restaurantWithPrizes = {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name,
    logo_url: restaurant.logo_url,
    primary_color: restaurant.primary_color,
    google_review_url: restaurant.google_review_url,
    google_place_id: restaurant.google_place_id,
    voucher_validity_days: restaurant.voucher_validity_days,
    crm_type: restaurant.crm_type,
    crm_webhook_url: restaurant.crm_webhook_url,
    user_id: restaurant.user_id,
    plan: restaurant.plan,
    stripe_customer_id: restaurant.stripe_customer_id,
    stripe_subscription_id: restaurant.stripe_subscription_id,
    confirmed_reviews_count: restaurant.confirmed_reviews_count,
    is_active: restaurant.is_active,
    created_at: restaurant.created_at,
    updated_at: restaurant.updated_at,
    prizes:
      typeof restaurant.prizes === "string"
        ? JSON.parse(restaurant.prizes)
        : restaurant.prizes,
  };

  return <ParticipantFlow restaurant={restaurantWithPrizes} />;
}
