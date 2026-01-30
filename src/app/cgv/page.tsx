import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente',
  description: 'CGV de QR Fidélité',
};

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-primary hover:underline text-sm">
          ← Retour à l'accueil
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-8">
          Conditions Générales de Vente
        </h1>

        <div className="prose prose-gray max-w-none">
          <p className="lead">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <h2>Article 1 - Objet</h2>
          <p>
            Les présentes conditions générales de vente régissent les relations
            contractuelles entre QR Fidélité et ses clients professionnels
            (restaurants, commerces).
          </p>

          <h2>Article 2 - Services proposés</h2>
          <p>QR Fidélité propose les services suivants :</p>
          <ul>
            <li>Pack Essentiel : Solution de fidélisation avec QR code générique</li>
            <li>Pack Pro : Solution avec QR codes personnalisés</li>
            <li>Pack Premium : Solution avec cartes NFC (à venir)</li>
          </ul>

          <h2>Article 3 - Prix</h2>
          <p>
            Les prix sont indiqués en euros HT. La TVA applicable sera ajoutée
            lors de la facturation.
          </p>
          <ul>
            <li>Pack Essentiel : 29€/mois</li>
            <li>Pack Pro : 79€/mois + 79€ de frais de setup</li>
            <li>Pack Premium : 149€/mois + 199€ de frais de setup</li>
          </ul>

          <h2>Article 4 - Paiement</h2>
          <p>
            Le paiement s'effectue par carte bancaire via notre prestataire de
            paiement sécurisé. Les abonnements sont facturés mensuellement.
          </p>

          <h2>Article 5 - Durée et résiliation</h2>
          <p>
            L'abonnement est sans engagement. Vous pouvez résilier à tout moment
            depuis votre espace client. La résiliation prend effet à la fin de
            la période de facturation en cours.
          </p>

          <h2>Article 6 - Données</h2>
          <p>
            Les données collectées via le service restent la propriété du
            client. En cas de résiliation, les données peuvent être exportées
            pendant 30 jours.
          </p>

          <h2>Article 7 - Responsabilité</h2>
          <p>
            QR Fidélité s'engage à fournir un service de qualité mais ne peut
            être tenu responsable des dommages indirects liés à l'utilisation du
            service.
          </p>

          <h2>Article 8 - Support</h2>
          <p>
            Le support est disponible par email. Les clients Pro et Premium
            bénéficient d'un support prioritaire.
          </p>

          <h2>Article 9 - Modification des CGV</h2>
          <p>
            QR Fidélité se réserve le droit de modifier les présentes CGV. Les
            clients seront informés par email de toute modification.
          </p>

          <h2>Article 10 - Droit applicable</h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige,
            les tribunaux français seront seuls compétents.
          </p>
        </div>
      </div>
    </div>
  );
}
