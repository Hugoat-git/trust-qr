import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales de QR Fidélité',
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-primary hover:underline text-sm">
          ← Retour à l'accueil
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-8">
          Mentions légales
        </h1>

        <div className="prose prose-gray max-w-none">
          <h2>Éditeur du site</h2>
          <p>
            QR Fidélité<br />
            [Votre adresse]<br />
            [Votre email de contact]<br />
            [Votre numéro SIRET]
          </p>

          <h2>Directeur de la publication</h2>
          <p>[Nom du directeur de publication]</p>

          <h2>Hébergement</h2>
          <p>
            Ce site est hébergé par :<br />
            Vercel Inc.<br />
            440 N Barranca Ave #4133<br />
            Covina, CA 91723<br />
            États-Unis
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L'ensemble de ce site relève de la législation française et
            internationale sur le droit d'auteur et la propriété intellectuelle.
            Tous les droits de reproduction sont réservés, y compris pour les
            documents téléchargeables et les représentations iconographiques et
            photographiques.
          </p>

          <h2>Données personnelles</h2>
          <p>
            Les informations concernant la collecte et le traitement des données
            personnelles sont disponibles dans notre{' '}
            <Link href="/confidentialite" className="text-primary hover:underline">
              Politique de confidentialité
            </Link>
            .
          </p>

          <h2>Cookies</h2>
          <p>
            Ce site utilise des cookies techniques nécessaires à son
            fonctionnement. Pour plus d'informations, consultez notre{' '}
            <Link href="/confidentialite" className="text-primary hover:underline">
              Politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
