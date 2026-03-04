# TODO - TrustQR

## Design & UX
- [ ] Améliorer landing page

## Fonctionnalités
- [ ] Tester la mise en place/connexion des QR

### Assets
- [ ] Créer `public/favicon.ico` (logo TrustQR)
- [ ] Créer `public/og-image.png` (1200x630, branding TrustQR)

### Base de données
- [ ] Nettoyer les participants de test (`DELETE FROM participants`)
- [ ] Nettoyer les QR codes liés de test
- [ ] Supprimer les restaurants de test (garder les vrais)

## Sécurité (backlog)
- [ ] **Rate limiting** sur les endpoints publics (`/api/participate`, `/api/review-count`) — ex: 10 req/min par IP via upstash/ratelimit
- [ ] **SSRF** dans `google-places.ts` — désactiver le redirect following (ajouter `redirect: 'error'` ou valider le domaine de destination)
- [ ] **Validation input** dans `participate/route.ts` — ajouter un schema Zod sur le body (email, firstName, restaurantId uuid...)
- [ ] **Timing-safe CRON** — remplacer la comparaison `===` du CRON_SECRET par `crypto.timingSafeEqual`
- [ ] **Email template injection** — sanitiser `firstName`, `restaurantName` avant injection dans les templates HTML

### Vérification post-deploy
- [ ] Landing page charge sur trustqr.dev
- [ ] Inscription email + confirmation
- [ ] Google OAuth fonctionne
- [ ] Dashboard admin accessible
- [ ] Flow participant complet (scan → avis → jeu → email voucher)
- [ ] Routes `/api/admin/*` retournent 401 sans auth, 403 si mauvais restaurant
- [ ] CRON retourne 401 sans Bearer token