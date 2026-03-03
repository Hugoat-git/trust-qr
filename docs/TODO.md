# TODO - TrustQR

## Design & UX
- [ ] Améliorer landing page (Buy Template et adapter à nos détails)

## Fonctionnalités
- [ ] Tester la mise en place/connexion des QR

## Intégrations

## Lancement MVP

### Assets
- [ ] Créer `public/favicon.ico` (logo TrustQR)
- [ ] Créer `public/og-image.png` (1200x630, branding TrustQR)

### Git
- [ ] Commit propre de tout le travail
- [ ] Push sur main

### Base de données
- [ ] Nettoyer les participants de test (`DELETE FROM participants`)
- [ ] Nettoyer les QR codes liés de test
- [ ] Supprimer les restaurants de test (garder les vrais)

### Vérification post-deploy
- [ ] Landing page charge sur trustqr.dev
- [ ] Inscription email + confirmation
- [ ] Google OAuth fonctionne
- [ ] Dashboard admin accessible
- [ ] Flow participant complet (scan → avis → jeu → email voucher)
- [ ] Routes `/api/admin/*` retournent 401 sans auth
- [ ] CRON retourne 401 sans Bearer token