-- Script pour créer un restaurant de test dans Supabase
-- Exécute ce script dans l'éditeur SQL de Supabase

INSERT INTO restaurants (
  slug,
  name,
  logo_url,
  primary_color,
  google_review_url,
  google_place_id,
  prizes,
  voucher_validity_days,
  crm_type,
  crm_webhook_url,
  is_active
) VALUES (
  'test-resto',
  'Restaurant Test',
  'https://via.placeholder.com/200x200',
  '#FF6B35',
  'https://www.google.com/maps',
  NULL,
  '[
    {"value": 5, "probability": 40, "label": "-5€", "emoji": "🎁"},
    {"value": 10, "probability": 30, "label": "-10€", "emoji": "🎉"},
    {"value": 20, "probability": 20, "label": "-20€", "emoji": "💎"},
    {"value": 50, "probability": 10, "label": "-50€", "emoji": "🏆"}
  ]'::jsonb,
  30,
  'none',
  NULL,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  prizes = EXCLUDED.prizes,
  is_active = EXCLUDED.is_active;
