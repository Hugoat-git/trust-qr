# TrustQR

## Commands

```bash
npm run dev       # Dev server (localhost:3000)
npm run build     # Production build
npm run lint      # Biome check
npm run format    # Biome format
```

## Tech Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase, shadcn/ui
Linter: Biome (not ESLint). Email: Resend. Charts: Recharts. Animations: framer-motion.

## Architecture

```
src/
  app/
    [slug]/          # Participant-facing pages (restaurant by slug)
    admin/[slug]/    # Admin dashboard (protected by middleware)
    api/admin/       # Admin API routes (auth required via getAuthUser())
    api/participate/ # Public participation endpoint
    api/cron/        # Scheduled jobs (CRON_SECRET required)
    go/[code]/       # QR code redirect
  components/
    admin/           # Dashboard components (forms, charts, scanner)
    participant/     # Participant flow (capture, spin wheel, result)
    ui/              # shadcn/ui base components
  lib/
    auth.ts          # getAuthUser() helper for API route protection
    supabase.ts      # supabaseAdmin (service role)
    supabase-browser.ts / supabase-server.ts  # Client/server Supabase clients
    email.ts         # Resend email templates
    branding.ts      # Brand colors and constants
```

## Key Patterns

- Admin API routes use `getAuthUser()` from `src/lib/auth.ts` for auth
- Middleware protects `/admin/*` pages but NOT `/api/admin/*` routes (hence getAuthUser)
- Participant pages use restaurant's `primaryColor`, admin uses branding colors
- Dark mode via next-themes (attribute="class"), CSS vars in globals.css
- Use semantic color tokens: `text-foreground`, `text-muted-foreground`, `bg-card`, `bg-muted`

## Gotchas

- Card component has built-in `py-6 gap-6` — don't add extra pt/pb on CardContent
- Recharts ResponsiveContainer needs `min-w-0` on parent + `overflow-hidden` on Card
- QRLoader at size < 20px uses CSS spinner fallback (not the animated QR)
- Supabase types need `as any` casts for qr_codes table (not in generated types yet)
- Cloudinary preset/folder names are "qr-fidelite" (legacy config, don't rename)
- CSS variables use raw hex values (not HSL) in globals.css

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL (https://trustqr.dev), NEXT_PUBLIC_APP_URL
RESEND_API_KEY, EMAIL_FROM, GOOGLE_PLACES_API_KEY
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
QR_GENERATE_SECRET, CRON_SECRET, N8N_WEBHOOK_URL (optional)
```
