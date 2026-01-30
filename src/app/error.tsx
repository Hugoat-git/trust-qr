'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Oups !</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Nous sommes désolés, quelque chose s'est mal passé. Veuillez réessayer.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-gray-400">
            Code erreur : {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
