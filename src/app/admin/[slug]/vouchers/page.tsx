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
  Loader2,
  Gift,
} from 'lucide-react';

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Validation Vouchers</h1>
        <p className="text-gray-500 mt-1">
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
                <Loader2 className="w-4 h-4 animate-spin" />
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
        <Card className="border-red-200 bg-red-50">
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
        <Card className={voucher.voucher_used ? 'border-gray-300 bg-gray-50' : 'border-green-200 bg-green-50'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Voucher trouvé
              </CardTitle>
              {voucher.voucher_used ? (
                <Badge className="bg-gray-200 text-gray-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Déjà utilisé
                </Badge>
              ) : isExpired ? (
                <Badge className="bg-red-100 text-red-800">
                  <XCircle className="w-3 h-3 mr-1" />
                  Expiré
                </Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Valide
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-semibold text-gray-900">{voucher.first_name}</p>
                <p className="text-sm text-gray-600">{voucher.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Code</p>
                <code className="text-xl font-mono font-bold text-gray-900">
                  {voucher.voucher_code}
                </code>
              </div>
              <div>
                <p className="text-sm text-gray-500">Réduction</p>
                <p className="text-2xl font-bold text-primary">{voucher.prize_label}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expire le</p>
                <p className="font-medium text-gray-900">
                  {new Date(voucher.voucher_expires_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {voucher.voucher_used && voucher.voucher_used_at && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
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
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={handleValidate}
                  disabled={isValidating}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {isValidating ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
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
