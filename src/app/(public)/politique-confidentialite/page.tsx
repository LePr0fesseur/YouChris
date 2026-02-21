import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">
        Politique de confidentialité
      </h1>
      <p className="text-sm text-[var(--muted)]">
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          1. Données collectées
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Nous collectons uniquement les données strictement nécessaires au
          fonctionnement du service :
        </p>
        <ul className="text-sm text-[var(--muted)] list-disc list-inside space-y-1">
          <li>Adresse email (obligatoire pour la création de compte)</li>
          <li>Prénom ou pseudo (optionnel)</li>
          <li>Mot de passe haché (nous ne stockons jamais votre mot de passe en clair)</li>
          <li>
            Données de paiement : gérées exclusivement par Stripe (nous n&apos;avons
            accès qu&apos;à un identifiant client anonymisé)
          </li>
          <li>Logs de connexion (date, adresse IP anonymisée après 90 jours)</li>
          <li>Commentaires publiés sur les vidéos</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          2. Finalités du traitement
        </h2>
        <ul className="text-sm text-[var(--muted)] list-disc list-inside space-y-1">
          <li>Gestion de votre compte et authentification</li>
          <li>Traitement de votre abonnement Premium</li>
          <li>Envoi d&apos;emails transactionnels (confirmation, réinitialisation)</li>
          <li>Sécurité et prévention de la fraude</li>
          <li>Conformité légale</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          3. Base légale
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Le traitement de vos données repose sur :
        </p>
        <ul className="text-sm text-[var(--muted)] list-disc list-inside space-y-1">
          <li>L&apos;exécution du contrat (compte utilisateur, abonnement)</li>
          <li>Votre consentement (cookies analytiques)</li>
          <li>L&apos;intérêt légitime (sécurité, logs)</li>
          <li>Les obligations légales</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          4. Durée de conservation
        </h2>
        <ul className="text-sm text-[var(--muted)] list-disc list-inside space-y-1">
          <li>Données de compte : durée de vie du compte + 30 jours</li>
          <li>Adresses IP dans les logs : anonymisées après 90 jours</li>
          <li>Données de paiement : conservées par Stripe selon leurs propres règles</li>
          <li>Consentement cookies : 1 an</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          5. Vos droits
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Conformément au RGPD, vous disposez des droits suivants :
        </p>
        <ul className="text-sm text-[var(--muted)] list-disc list-inside space-y-1">
          <li>
            <strong className="text-[var(--foreground)]">Droit d&apos;accès</strong> :
            téléchargez vos données depuis votre espace membre
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Droit de rectification</strong> :
            modifiez vos informations depuis votre profil
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Droit à l&apos;effacement</strong> :
            supprimez votre compte depuis votre espace membre
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Droit à la portabilité</strong> :
            export JSON disponible dans votre espace membre
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Droit d&apos;opposition</strong> :
            contactez-nous par email
          </li>
        </ul>
        <p className="text-sm text-[var(--muted)]">
          Vous pouvez également introduire une réclamation auprès de la{" "}
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            CNIL
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          6. Cookies
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Nous utilisons uniquement des cookies essentiels au fonctionnement du
          site. Aucun cookie tiers n&apos;est déposé sans votre consentement explicite.
          Vous pouvez gérer vos préférences via la bannière de gestion des cookies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          7. Contact DPO
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Pour toute question relative à vos données personnelles :{" "}
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
