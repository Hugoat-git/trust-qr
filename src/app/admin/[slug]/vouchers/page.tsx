'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Ticket,
  Gift,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from 'lucide-react';
import { QRLoader } from '@/components/ui/qr-loader';
import { InfoTooltip } from '@/components/admin/info-tooltip';

interface VoucherInfo {
  id: string;
  voucher_code: string;
  first_name: string;
  email: string;
  prize_label: string;
  prize_value: number;
  voucher_used: boolean;
  voucher_used_at: string | null;
  voucher_expires_at: string;
  review_status: string;
  created_at: string;
}

export default function VouchersPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [code, setCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [voucher, setVoucher] = useState<VoucherInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSearching(true);
    setError(null);
    setVoucher(null);

    try {
      const response = await fetch(`/api/admin/voucher?slug=${slug}&code=${code.trim().toUpperCase()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Voucher non trouvé');
        return;
      }

      setVoucher(data.voucher);
    } catch {
      setError('Erreur lors de la recherche');
    } finally {
      setIsSearching(false);
    }
  };

  const handleValidate = async () => {
    if (!voucher) return;

    setIsValidating(true);

    try {
      const response = await fetch('/api/admin/voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucherId: voucher.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erreur lors de la validation');
        return;
      }

      toast.success('Voucher validé avec succès !');
      setVoucher({ ...voucher, voucher_used: true, voucher_used_at: new Date().toISOString() });
    } catch {
      toast.error('Erreur lors de la validation');
    } finally {
      setIsValidating(false);
    }
  };

  const isExpired = voucher && new Date(voucher.voucher_expires_at) < new Date();
  const isReviewPending = voucher?.review_status === 'pending';
  const isReviewExpired = voucher?.review_status === 'expired';
  const canValidate = voucher && !voucher.voucher_used && !isExpired && !isReviewPending && !isReviewExpired;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">Validation Vouchers</h1>
          <InfoTooltip
            title="Validation en caisse"
            description="Quand un client présente son voucher, saisissez le code ici pour le valider. Le voucher ne peut être validé que si l'avis Google a été vérifié par le système."
            tips={[
              "Le code voucher se trouve sur le téléphone du client",
              "Un voucher ne peut être utilisé qu'une seule fois",
              "Vérifiez que l'avis Google est marqué 'Vérifié' avant de valider",
            ]}
          />
        </div>
        <p className="text-muted-foreground mt-1">
          Saisissez un code voucher pour le valider en caisse
        </p>
      </div>

      {/* Search form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Rechercher un voucher
          </CardTitle>
          <CardDescription>
            Entrez le code à 8 caractères présent sur le bon du client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Ex: ABC12345"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="flex-1 font-mono text-lg uppercase tracking-wider"
              maxLength={8}
            />
            <Button type="submit" disabled={isSearching || !code.trim()}>
              {isSearching ? (
                <QRLoader size={16} />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="ml-2">Rechercher</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error message */}
      {error && (
        <Card className="border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 text-red-600">
              <XCircle className="w-6 h-6" />
              <span className="font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voucher result */}
      {voucher && (
        <Card className={voucher.voucher_used ? 'border-border' : 'border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Voucher trouvé
              </CardTitle>
              {voucher.voucher_used ? (
                <Badge className="bg-muted text-muted-foreground">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Déjà utilisé
                </Badge>
              ) : isExpired ? (
                <Badge className="bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400">
                  <XCircle className="w-3 h-3 mr-1" />
                  Expiré
                </Badge>
              ) : (
                <Badge className="bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400">
                  <Clock className="w-3 h-3 mr-1" />
                  Valide
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-semibold text-foreground">{voucher.first_name}</p>
                <p className="text-sm text-muted-foreground">{voucher.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Code</p>
                <code className="text-xl font-mono font-bold text-foreground">
                  {voucher.voucher_code}
                </code>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Réduction</p>
                <p className="text-2xl font-bold text-primary">{voucher.prize_label}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expire le</p>
                <p className="font-medium text-foreground">
                  {new Date(voucher.voucher_expires_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Avis Google</p>
                {voucher.review_status === 'verified' ? (
                  <p className="font-medium text-green-600 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Vérifié
                  </p>
                ) : voucher.review_status === 'pending' ? (
                  <p className="font-medium text-amber-600 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4" /> En attente de vérification
                  </p>
                ) : voucher.review_status === 'expired' ? (
                  <p className="font-medium text-red-600 flex items-center gap-1">
                    <ShieldX className="w-4 h-4" /> Non déposé à temps
                  </p>
                ) : (
                  <p className="font-medium text-muted-foreground flex items-center gap-1">
                    Non requis
                  </p>
                )}
              </div>
            </div>

            {voucher.voucher_used && voucher.voucher_used_at && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Utilisé le{' '}
                  {new Date(voucher.voucher_used_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}

            {!voucher.voucher_used && !isExpired && (
              <div className="pt-4 border-t border-border space-y-2">
                {(isReviewPending || isReviewExpired) && (
                  <p className="text-sm text-amber-600 text-center">
                    {isReviewPending
                      ? "Le voucher ne peut pas être validé tant que l'avis Google n'est pas vérifié."
                      : "Le voucher ne peut pas être validé car l'avis Google n'a pas été déposé à temps."}
                  </p>
                )}
                <Button
                  onClick={handleValidate}
                  disabled={isValidating || !canValidate}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {isValidating ? (
                    <QRLoader size={20} className="mr-2" />
                  ) : (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  )}
                  Valider ce voucher
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
