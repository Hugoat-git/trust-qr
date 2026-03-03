'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { QRScanner } from '@/components/admin/qr-scanner';
import { QrCode, Plus, Pencil, Trash2, Check, X, ScanLine } from 'lucide-react';
import { QRLoader } from '@/components/ui/qr-loader';
import type { QRCode as QRCodeType } from '@/types';
import { InfoTooltip } from '@/components/admin/info-tooltip';

export default function QRCodesPage() {
  const pathname = usePathname();
  const slug = pathname.split('/')[2];

  const [qrCodes, setQrCodes] = useState<QRCodeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [linking, setLinking] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Fetch restaurant ID first
  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const res = await fetch(`/api/admin/restaurant?slug=${slug}`);
        const data = await res.json();
        if (res.ok && data.restaurant) {
          setRestaurantId(data.restaurant.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        setLoading(false);
      }
    }
    if (slug) fetchRestaurant();
  }, [slug]);

  // Fetch QR codes when we have the restaurant ID
  const fetchQRCodes = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/qr-codes?restaurantId=${restaurantId}`);
      const data = await res.json();
      if (res.ok) {
        setQrCodes(data.qrCodes || []);
      }
    } catch (err) {
      console.error('Error fetching QR codes:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchQRCodes();
  }, [fetchQRCodes]);

  const handleScan = async (code: string) => {
    setShowScanner(false);
    setLinking(true);

    try {
      const res = await fetch('/api/admin/qr-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la liaison');
        return;
      }

      toast.success(`QR code ${code} lie avec succes !`);
      fetchQRCodes();
    } catch (err) {
      toast.error('Erreur reseau');
    } finally {
      setLinking(false);
    }
  };

  const handleRename = async (qrCodeId: string) => {
    try {
      const res = await fetch('/api/admin/qr-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeId, name: editName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors du renommage');
        return;
      }

      toast.success('QR code renomme');
      setEditingId(null);
      setEditName('');
      fetchQRCodes();
    } catch {
      toast.error('Erreur reseau');
    }
  };

  const handleUnlink = async (qrCodeId: string, qrName: string | null) => {
    const label = qrName || 'ce QR code';
    if (!confirm(`Delier ${label} ? Le QR code ne redirigera plus vers votre restaurant.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/qr-codes?qrCodeId=${qrCodeId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Erreur');
        return;
      }

      toast.success('QR code delie');
      fetchQRCodes();
    } catch {
      toast.error('Erreur reseau');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">QR Codes</h1>
            <InfoTooltip
              title="Gestion des QR Codes"
              description="Liez vos QR codes physiques à votre restaurant. Chaque QR code redirige automatiquement les clients vers votre page de participation."
              tips={[
                "Scannez un QR code avec la caméra pour le lier",
                "Renommez vos QR codes pour les identifier facilement (ex: Table 1, Comptoir)",
                "Le compteur de scans vous montre l'utilisation de chaque QR",
              ]}
            />
          </div>
          <p className="text-muted-foreground mt-1">Liez vos QR codes physiques a votre restaurant</p>
        </div>
        <Button onClick={() => setShowScanner(true)} disabled={linking || !restaurantId}>
          {linking ? (
            <QRLoader size={16} className="mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Lier un QR code
        </Button>
      </div>

      {/* QR code list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <QRLoader size={24} className="text-muted-foreground" />
        </div>
      ) : qrCodes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full">
                <QrCode className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">Aucun QR code lie</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Scannez votre QR code physique pour le lier a votre restaurant.
                  Les clients qui scanneront ce QR seront rediriges vers votre page de fidelite.
                </p>
              </div>
              <Button onClick={() => setShowScanner(true)} disabled={!restaurantId}>
                <ScanLine className="w-4 h-4 mr-2" />
                Scanner un QR code
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {qrCodes.map((qr) => (
            <Card key={qr.id}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-primary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {editingId === qr.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nom du QR code (ex: Table 1)"
                          className="h-8 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(qr.id);
                            if (e.key === 'Escape') { setEditingId(null); setEditName(''); }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRename(qr.id)}
                          className="p-1 text-green-600 hover:bg-green-500/10 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingId(null); setEditName(''); }}
                          className="p-1 text-muted-foreground hover:bg-accent rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-foreground truncate">
                          {qr.name || 'QR code sans nom'}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{qr.code}</p>
                      </>
                    )}
                  </div>

                  {/* Scan count */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-foreground">{qr.scan_count}</p>
                    <p className="text-xs text-muted-foreground">scans</p>
                  </div>

                  {/* Actions */}
                  {editingId !== qr.id && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => { setEditingId(qr.id); setEditName(qr.name || ''); }}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                        title="Renommer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnlink(qr.id, qr.name)}
                        className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Scanner modal */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
