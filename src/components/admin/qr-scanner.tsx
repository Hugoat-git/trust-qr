'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRLoader } from '@/components/ui/qr-loader';

interface QRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  expectedDomain?: string;
}

export function QRScanner({ onScan, onClose, expectedDomain }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef(false);
  const containerRef = useRef<string>('qr-scanner-' + Math.random().toString(36).slice(2));

  const stopScanner = async () => {
    if (scannerRef.current && isRunningRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // Scanner already stopped
      }
      isRunningRef.current = false;
    }
  };

  useEffect(() => {
    const scanner = new Html5Qrcode(containerRef.current);
    scannerRef.current = scanner;

    const handleSuccess = (decodedText: string) => {
      const code = extractCodeFromUrl(decodedText, expectedDomain);
      if (code) {
        stopScanner();
        onScan(code);
      } else {
        setError(`QR code non reconnu. URL scannée: ${decodedText}`);
      }
    };

    const scanConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

    // Try back camera first, then fall back to front camera, then any camera
    scanner
      .start({ facingMode: 'environment' }, scanConfig, handleSuccess, () => {})
      .then(() => {
        isRunningRef.current = true;
        setStarting(false);
      })
      .catch(() => {
        // Back camera failed — try front camera
        return scanner
          .start({ facingMode: 'user' }, scanConfig, handleSuccess, () => {})
          .then(() => {
            isRunningRef.current = true;
            setStarting(false);
          });
      })
      .catch((err) => {
        setStarting(false);
        const errStr = err?.toString?.() || '';
        if (errStr.includes('NotAllowedError')) {
          setError(
            "Accès à la caméra refusé. Autorisez l'accès dans les paramètres de votre navigateur."
          );
        } else if (errStr.includes('NotFoundError') || errStr.includes('NotReadableError')) {
          setError('Aucune caméra détectée sur cet appareil.');
        } else {
          setError(`Erreur caméra: ${err}`);
        }
      });

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    setError(null);
    setStarting(true);

    const scanner = scannerRef.current;
    if (!scanner) return;

    const scanConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

    const handleSuccess = (decodedText: string) => {
      const code = extractCodeFromUrl(decodedText, expectedDomain);
      if (code) {
        stopScanner();
        onScan(code);
      } else {
        setError(`QR code non reconnu. URL scannée: ${decodedText}`);
      }
    };

    scanner
      .start({ facingMode: 'environment' }, scanConfig, handleSuccess, () => {})
      .then(() => {
        isRunningRef.current = true;
        setStarting(false);
      })
      .catch(() => {
        return scanner
          .start({ facingMode: 'user' }, scanConfig, handleSuccess, () => {})
          .then(() => {
            isRunningRef.current = true;
            setStarting(false);
          });
      })
      .catch((err) => {
        setStarting(false);
        setError(`Erreur caméra: ${err}`);
      });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Lier un QR Code</h3>
          <button
            type="button"
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner area */}
        <div className="p-4 space-y-4">
          <div className="relative bg-black rounded-xl overflow-hidden aspect-square">
            <div id={containerRef.current} className="w-full h-full" />
            {starting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white gap-3">
                <QRLoader size={32} style={{ '--qr-loader-color': '#f5f5f5' } as React.CSSProperties} />
                <p className="text-sm">Démarrage de la caméra...</p>
              </div>
            )}
          </div>

          {error ? (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleRetry}
              >
                Réessayer
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Camera className="w-4 h-4" />
              <p>Pointez la caméra vers votre QR code physique</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Extract the QR code identifier from a scanned URL.
 * Expected format: https://domain.com/go/ABC123XY
 */
function extractCodeFromUrl(url: string, expectedDomain?: string): string | null {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);

    // Look for /go/{code} pattern
    if (pathParts.length >= 2 && pathParts[0] === 'go') {
      return pathParts[1].toUpperCase();
    }

    return null;
  } catch {
    // If it's not a valid URL, check if it's just a raw code (8 alphanumeric chars)
    const cleaned = url.trim().toUpperCase();
    if (/^[A-Z2-9]{8}$/.test(cleaned)) {
      return cleaned;
    }
    return null;
  }
}
