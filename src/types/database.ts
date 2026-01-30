export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          logo_url: string | null;
          primary_color: string;
          google_review_url: string;
          google_place_id: string | null;
          prizes: unknown;
          voucher_validity_days: number;
          crm_type: string;
          crm_webhook_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["restaurants"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["restaurants"]["Insert"]>;
      };
      participants: {
        Row: {
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
        };
        Insert: Omit<
          Database["public"]["Tables"]["participants"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["participants"]["Insert"]>;
      };
      page_views: {
        Row: {
          id: string;
          restaurant_id: string;
          session_id: string | null;
          step: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["page_views"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["page_views"]["Insert"]>;
      };
    };
  };
}
