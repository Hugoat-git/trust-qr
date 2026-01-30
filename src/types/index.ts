export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  google_review_url: string;
  google_place_id: string | null;
  prizes: Prize[];
  voucher_validity_days: number;
  crm_type: string;
  crm_webhook_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Prize {
  value: number;
  probability: number;
  label: string;
  emoji: string;
}

export interface Participant {
  id: string;
  restaurant_id: string;
  email: string;
  first_name: string;
  phone: string | null;
  prize_value: number;
  prize_label: string;
  voucher_code: string;
  voucher_expires_at: string;
  voucher_used: boolean;
  voucher_used_at: string | null;
  review_clicked_at: string | null;
  review_verified: boolean;
  review_verified_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type Step = "landing" | "form" | "review" | "spin" | "result";
