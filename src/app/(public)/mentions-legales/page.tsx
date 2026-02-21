import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
};

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">
        Mentions légales
      </h1>
      <p className="text-sm text-[var(--muted)]">
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          1. Éditeur du site
        </h2>
        <div className="glass rounded-xl p-5 text-sm text-[var(--muted)] space-y-2">
          <p>
            <strong className="text-[var(--foreground)]">Nom :</strong> Chris
          </p>
          <p>
            <strong className="text-[var(--foreground)]">Site web :</strong>{" "}
            Les Vidéos de Chris
          </p>
          <p>
            <strong className="text-[var(--foreground)]">Chaîne YouTube :</strong>{" "}
            <a
              href="https://www.youtube.com/@lesvideosdechris"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              @lesvideosdechris
            </a>
          </p>
          <p>
            <strong className="text-[var(--foreground)]">Contact :</strong>{" "}
            contact@lesvideosdechris.fr
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          2. Hébergement
        </h2>
        <div className="glass rounded-xl p-5 text-sm text-[var(--muted)] space-y-2">
          <p>
            Ce site est hébergé sur des serveurs localisés en Europe.
            L&apos;infrastructure utilise Docker et des services conformes au RGPD.
          </p>
          <p>
            Le stockage des vidéos exclusives est assuré par Cloudflare R2 (ou
            un service S3-compatible), dont les serveurs sont localisés conformément
            aux obligations légales.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          3. Propriété intellectuelle
        </h2>
        <p className="text-sm text-[var(--muted)]">
          L&apos;ensemble des contenus présents sur ce site (vidéos, textes, images,
          graphismes, logo) sont la propriété exclusive de leur auteur et sont
          protégés par les lois françaises et internationales relatives à la
          propriété intellectuelle. Toute reproduction, représentation,
          modification, publication ou adaptation de tout ou partie de ces
          éléments, quel que soit le moyen ou le procédé utilisé, est
          interdite sans autorisation écrite préalable.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          4. Limitation de responsabilité
        </h2>
        <p className="text-sm text-[var(--muted)]">
          L&apos;éditeur du site ne saurait être tenu responsable des dommages
          directs ou indirects causés au matériel de l&apos;utilisateur, lors de
          l&apos;accès au site, et résultant soit de l&apos;utilisation d&apos;un matériel
          ne répondant pas aux spécifications indiquées, soit de l&apos;apparition
          d&apos;un bug ou d&apos;une incompatibilité.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          5. Contact
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Pour toute question concernant ce site ou son contenu :{" "}
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
