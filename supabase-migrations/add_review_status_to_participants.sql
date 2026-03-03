-- Ajouter les colonnes pour le suivi de la verification des avis Google
ALTER TABLE participants ADD COLUMN review_status TEXT DEFAULT 'skipped';
ALTER TABLE participants ADD COLUMN initial_review_count INTEGER;

-- Index pour les requetes de verification (filtre sur review_status = 'pending')
CREATE INDEX IF NOT EXISTS idx_participants_review_status ON participants (review_status) WHERE review_status = 'pending';
