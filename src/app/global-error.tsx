'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💥</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Erreur critique
            </h1>
            <p className="text-gray-500 mb-8 max-w-md">
              Une erreur inattendue s'est produite. Veuillez rafraîchir la page.
            </p>
            <Button onClick={reset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Rafraîchir la page
            </Button>
            {error.digest && (
              <p className="mt-6 text-xs text-gray-400">
                Code erreur : {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
