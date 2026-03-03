import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité de TrustQR',
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-primary hover:underline text-sm">
          ← Retour à l'accueil
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-8">
          Politique de confidentialité
        </h1>

        <div className="prose prose-gray max-w-none">
          <p className="lead">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <h2>1. Collecte des données</h2>
          <p>
            Nous collectons les données suivantes lors de votre utilisation de
            notre service :
          </p>
          <ul>
            <li>Adresse email</li>
            <li>Prénom</li>
            <li>Numéro de téléphone (optionnel)</li>
            <li>Adresse IP</li>
            <li>Informations de navigation (user agent)</li>
          </ul>

          <h2>2. Utilisation des données</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul>
            <li>Gérer votre participation au jeu concours</li>
            <li>Vous envoyer votre bon de réduction par email</li>
            <li>Permettre au restaurant de vous contacter</li>
            <li>Améliorer nos services</li>
          </ul>

          <h2>3. Partage des données</h2>
          <p>
            Vos données sont partagées avec le restaurant auquel vous avez
            participé. Elles ne sont jamais vendues à des tiers.
          </p>

          <h2>4. Conservation des données</h2>
          <p>
            Vos données sont conservées pendant une durée de 3 ans à compter de
            votre dernière interaction avec notre service.
          </p>

          <h2>5. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul>
            <li>Droit d'accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement</li>
            <li>Droit à la portabilité</li>
            <li>Droit d'opposition</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous à : [votre email]
          </p>

          <h2>6. Cookies</h2>
          <p>
            Nous utilisons uniquement des cookies techniques nécessaires au bon
            fonctionnement du site (authentification, sessions).
          </p>

          <h2>7. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité appropriées pour
            protéger vos données contre tout accès non autorisé.
          </p>

          <h2>8. Contact</h2>
          <p>
            Pour toute question relative à cette politique, contactez-nous à :
            [votre email]
          </p>
        </div>
      </div>
    </div>
  );
}
