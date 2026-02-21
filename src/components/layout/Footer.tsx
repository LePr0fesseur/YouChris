import Link from "next/link";
import { Shield, Youtube, Twitter, Github } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-bold text-[var(--foreground)]">
                Les Vidéos de Chris
              </span>
            </Link>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Contenu de qualité sur la cybersécurité, le hardware,
              les tutoriels tech et le gaming.
            </p>
            {/* Réseaux sociaux */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.youtube.com/@lesvideosdechris"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                aria-label="Chaîne YouTube"
              >
                <Youtube className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-[var(--muted)] hover:text-sky-400 hover:bg-sky-400/10 transition-colors"
                aria-label="Twitter/X"
              >
                <Twitter className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/30 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Accueil" },
                { href: "/videos", label: "Toutes les vidéos" },
                { href: "/premium", label: "Devenir Premium" },
                { href: "/member/dashboard", label: "Mon espace" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
              Informations légales
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/mentions-legales", label: "Mentions légales" },
                {
                  href: "/politique-confidentialite",
                  label: "Politique de confidentialité",
                },
                { href: "/cgu", label: "Conditions générales" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted)]">
            © {currentYear} Les Vidéos de Chris. Tous droits réservés.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Hébergé en France 🇫🇷 — Conforme RGPD
          </p>
        </div>
      </div>
    </footer>
  );
}
