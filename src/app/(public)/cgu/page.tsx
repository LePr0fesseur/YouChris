import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
};

const MONTHLY_PRICE = process.env.PREMIUM_MONTHLY_PRICE || "9.99";

export default function CGUPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">
        Conditions Générales d&apos;Utilisation
      </h1>
      <p className="text-sm text-[var(--muted)]">
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          1. Objet
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent
          l&apos;utilisation du site Les Vidéos de Chris et de ses services,
          notamment l&apos;accès aux contenus vidéo et l&apos;abonnement Premium.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          2. Accès au service
        </h2>
        <p className="text-sm text-[var(--muted)]">
          L&apos;accès aux contenus publics est libre et gratuit. L&apos;accès aux
          contenus Premium nécessite la création d&apos;un compte et la souscription
          d&apos;un abonnement payant.
        </p>
        <p className="text-sm text-[var(--muted)]">
          Pour créer un compte, vous devez avoir au moins 13 ans (ou 16 ans
          dans certains pays de l&apos;UE conformément au RGPD) et fournir
          une adresse email valide.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          3. Abonnement Premium
        </h2>
        <ul className="text-sm text-[var(--muted)] list-disc list-inside space-y-2">
          <li>
            Tarif : <strong className="text-[var(--foreground)]">{MONTHLY_PRICE}€ TTC / mois</strong>
          </li>
          <li>Facturation mensuelle, sans engagement de durée</li>
          <li>Accès immédiat dès validation du paiement</li>
          <li>
            Résiliation possible à tout moment depuis le portail client Stripe
          </li>
          <li>
            En cas de résiliation, l&apos;accès Premium est maintenu jusqu&apos;à la
            fin de la période payée
          </li>
          <li>
            Conformément à la directive PSD2, les paiements sont sécurisés
            et peuvent nécessiter une authentification forte (SCA)
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          4. Droit de rétractation
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Conformément à l&apos;article L221-28 du Code de la consommation, le
          droit de rétractation ne s&apos;applique pas aux contenus numériques
          dont l&apos;exécution a commencé avec votre accord avant l&apos;expiration
          du délai de rétractation. En souscrivant à l&apos;abonnement Premium
          et en accédant immédiatement aux contenus, vous renoncez expressément
          à votre droit de rétractation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          5. Utilisation acceptable
        </h2>
        <p className="text-sm text-[var(--muted)]">Il est interdit de :</p>
        <ul className="text-sm text-[var(--muted)] list-disc list-inside space-y-1">
          <li>Partager vos identifiants de connexion</li>
          <li>Télécharger, copier ou redistribuer les contenus exclusifs</li>
          <li>Contourner les mesures de protection des contenus</li>
          <li>Utiliser le service à des fins illégales ou frauduleuses</li>
          <li>Publier des commentaires offensants, diffamatoires ou illégaux</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          6. Propriété intellectuelle
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Tous les contenus disponibles sur le site (vidéos, textes, images)
          sont protégés par le droit d&apos;auteur. L&apos;abonnement Premium confère
          un droit d&apos;accès personnel et non transférable aux contenus exclusifs.
          Toute reproduction, distribution ou exploitation commerciale est
          strictement interdite.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          7. Modification des CGU
        </h2>
        <p className="text-sm text-[var(--muted)]">
          L&apos;éditeur se réserve le droit de modifier les présentes CGU à tout
          moment. Les utilisateurs seront informés de toute modification
          substantielle par email. La poursuite de l&apos;utilisation du service
          après notification vaut acceptation des nouvelles CGU.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          8. Droit applicable
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Les présentes CGU sont soumises au droit français. Tout litige
          relatif à leur interprétation ou exécution relève de la compétence
          des tribunaux français.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          9. Contact
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Pour toute question relative aux présentes CGU :{" "}
          <a
            href="mailto:contact@lesvideosdechris.fr"
            className="text-[var(--accent)] hover:underline"
          >
            contact@lesvideosdechris.fr
          </a>
        </p>
      </section>
    </div>
  );
}
