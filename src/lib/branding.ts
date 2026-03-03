/**
 * TrustQR — Admin SaaS Branding
 *
 * Palette warm-dark inspirée du design Virtus.
 * Ces couleurs ne s'appliquent qu'à l'interface admin.
 * Les pages participants utilisent les couleurs du restaurant.
 */

export const brand = {
  /** Warm muted — texte secondaire dark mode */
  chestnut: '#a1887d',
  /** Accent principal / CTA */
  orange: '#c4633d',
  /** Texte muted dark mode */
  oak: '#958a82',
  /** Recessed surface inside cards dark */
  brown: '#201f1d',
  /** Fond cards dark */
  wolf: '#282828',
  /** Fond principal dark */
  sooty: '#151413',
} as const;

/** Nombre d'avis vérifiés avant paywall */
export const FREE_PLAN_LIMIT = 6;

/** Variantes claires dérivées */
export const brandLight = {
  /** Fond page */
  background: '#faf8f6',
  /** Fond cards */
  card: '#ffffff',
  /** Bordures */
  border: '#e8e0dc',
  /** Surface secondaire */
  muted: '#f3eeeb',
  /** Texte secondaire */
  mutedForeground: '#6b5e57',
} as const;
