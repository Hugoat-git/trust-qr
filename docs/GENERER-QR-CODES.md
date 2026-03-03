# QR Codes — Comment ca marche

## Fonctionnement

1. **Toi** : tu generes un batch de codes uniques via l'API (ou avec `/gen-qr` dans Claude Code)
2. **Toi** : tu encodes chaque URL (`trustqr.dev/go/CODE`) dans un QR code physique (impression ou NFC)
3. **Le restaurateur** : il scanne son QR physique depuis son dashboard admin pour le lier a son restaurant
4. **Le client** : il scanne le QR → page de fidelite du restaurant → laisse un avis → gagne un bon

## Generer des QR codes

```bash
# Local
curl -X POST http://localhost:3000/api/admin/qr-codes/generate \
  -H "Content-Type: application/json" \
  -d '{"count": 20, "secret": "TON_SECRET"}'

# Production
curl -X POST https://trustqr.dev/api/admin/qr-codes/generate \
  -H "Content-Type: application/json" \
  -d '{"count": 20, "secret": "TON_SECRET"}'
```

Remplace `TON_SECRET` par `QR_GENERATE_SECRET` de `.env.local`. Max 500 par appel.

## Encoder en QR physiques

Chaque URL de la reponse (`trustqr.dev/go/ABC123XY`) doit etre encodee dans un QR physique :
- **NFC/programmable** : programme chacun avec l'URL
- **Impression** : utilise QR Code Monkey, Canva, ou un generateur en masse

## Lier un QR a un restaurant

Le restaurateur va dans **QR Codes** dans son dashboard, clique **"Lier un QR code"**, scanne son QR physique avec la camera, et le renomme (ex: "Table 1", "Comptoir").

## Notes

- Codes de 8 caracteres : `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (pas de O/0/I/1)
- 1 QR = 1 restaurant max. Deliable a tout moment depuis le dashboard
