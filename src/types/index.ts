export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  google_review_url: string;
  google_place_id: string | null;
  user_id: string | null;
  plan: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  confirmed_reviews_count: number;
  prizes: Prize[];
  voucher_validity_days: number;
  crm_type: string;
  crm_webhook_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Google Business Profile OAuth (optional — set after connecting GBP account)
  google_refresh_token?: string | null;
  google_access_token?: string | null;
  google_token_expiry?: string | null;
  google_account_name?: string | null;
  google_location_name?: string | null;
}

export interface Prize {
  value: number;
  probability: number;
  label: string;
  emoji: string;
}

export type ReviewStatus = 'pending' | 'verified' | 'expired' | 'skipped';

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
  review_status: ReviewStatus;
  initial_review_count: number | null;
  initial_latest_review_time: number | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type Step = "landing" | "form" | "review" | "spin" | "result";

export interface QRCode {
  id: string;
  code: string;
  restaurant_id: string | null;
  name: string | null;
  scan_count: number;
  linked_at: string | null;
  created_at: string;
}
