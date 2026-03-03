---
name: gen-qr
description: Generate a batch of QR codes via the TrustQR API
disable-model-invocation: true
---

# Generate QR Codes

Generate a batch of unlinked QR codes in the database.

## Usage

The user can specify a count (default: 20, max: 500) and target environment (dev or prod).

## Steps

1. Ask which environment: local (`localhost:3000`) or production (`trustqr.dev`)
2. Ask how many codes to generate (default: 20)
3. Run the curl command using the `QR_GENERATE_SECRET` from `.env.local`
4. Display the generated codes and their URLs

## Commands

### Local
```bash
curl -X POST http://localhost:3000/api/admin/qr-codes/generate \
  -H "Content-Type: application/json" \
  -d '{"count": COUNT, "secret": "SECRET"}'
```

### Production
```bash
curl -X POST https://trustqr.dev/api/admin/qr-codes/generate \
  -H "Content-Type: application/json" \
  -d '{"count": COUNT, "secret": "SECRET"}'
```

## Important
- Never hardcode the secret in output — read it from `.env.local` (`QR_GENERATE_SECRET`)
- Each code is 8 characters: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no O/0/I/1)
- Generated codes are unlinked — a restaurant owner links them via the QR scanner in the admin dashboard
