import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Crown, Shield, Video, MessageSquare, Star, Check } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Devenir Premium",
  description:
    "Accédez au contenu exclusif de Les Vidéos de Chris : tutoriels avancés, labs pratiques et vidéos inédites.",
};

const MONTHLY_PRICE = process.env.PREMIUM_MONTHLY_PRICE || "9.99";

export default async function PremiumPage() {
  const session = await auth();
  const userSubscription = session?.user
    ? await prisma.subscription.findUnique({
        where: { userId: session.user.id },
      })
    : null;
  const isAlreadyPremium = isSubscriptionActive(userSubscription);

  const features = [
    {
      icon: Video,
      title: "Vidéos exclusives",
      description: "Accès illimité à tous les tutoriels et vidéos premium.",
    },
    {
      icon: Shield,
      title: "Labs de cybersécurité",
      description: "Exercices pratiques guidés, CTF writeups complets.",
    },
    {
      icon: MessageSquare,
      title: "Section commentaires",
      description: "Échangez directement avec Chris et la communauté.",
    },
    {
      icon: Star,
      title: "Contenu en avant-première",
      description: "Accédez aux nouvelles vidéos avant tout le monde.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
          <Crown className="w-3.5 h-3.5" aria-hidden="true" />
          Abonnement Premium
        </div>
        <h1 className="text-4xl font-extrabold text-[var(--foreground)]">
          Passez au niveau supérieur
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-xl mx-auto">
          Rejoignez les membres premium et accédez à du contenu exclusif
          disponible nulle part ailleurs.
        </p>
      </div>

      {/* Carte de prix */}
      <div className="max-w-md mx-auto mb-12">
        <div className="relative rounded-2xl overflow-hidden border border-[var(--accent)]/40 bg-gradient-to-b from-indigo-950/50 to-[var(--surface)] p-8">
          {/* Badge populaire */}
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)]" aria-hidden="true" />

          <div className="text-center mb-6">
            <p className="text-[var(--muted)] text-sm mb-2">Premium mensuel</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-extrabold text-[var(--foreground)]">
                {MONTHLY_PRICE}€
              </span>
              <span className="text-[var(--muted)]">/mois</span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-2">
              Sans engagement — Annulable à tout moment
            </p>
          </div>

          <ul className="space-y-3 mb-8">
            {[
              "Accès illimité aux vidéos exclusives",
              "Labs de cybersécurité pratiques",
              "Section commentaires premium",
              "Contenu en avant-première",
              "Support prioritaire",
              "Annulation en 1 clic",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/40 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-[var(--accent)]" aria-hidden="true" />
                </div>
                <span className="text-[var(--foreground)]">{item}</span>
              </li>
            ))}
          </ul>

          {isAlreadyPremium ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-[var(--success)] font-semibold">
                ✓ Vous êtes déjà membre Premium
              </p>
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/member/subscription">Gérer mon abonnement</Link>
              </Button>
            </div>
          ) : session ? (
            <form action="/api/stripe/checkout" method="post">
              <Button variant="premium" size="lg" className="w-full" type="submit">
                <Crown className="w-4 h-4" aria-hidden="true" />
                Commencer l&apos;abonnement
              </Button>
            </form>
          ) : (
            <Button variant="premium" size="lg" className="w-full" asChild>
              <Link href="/login?redirect=/premium">
                <Crown className="w-4 h-4" aria-hidden="true" />
                Se connecter pour s&apos;abonner
              </Link>
            </Button>
          )}

          {/* Sécurité paiement */}
          <p className="text-center text-xs text-[var(--muted)] mt-4">
            Paiement sécurisé par Stripe · Conforme SCA/PSD2
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="glass rounded-xl p-5 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
              <feature.icon
                className="w-5 h-5 text-[var(--accent)]"
                aria-hidden="true"
              />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)] mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--muted)]">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          Questions fréquentes
        </h2>
        {[
          {
            q: "Puis-je annuler à tout moment ?",
            a: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace membre. Vous conservez l'accès jusqu'à la fin de la période payée.",
          },
          {
            q: "Quels modes de paiement sont acceptés ?",
            a: "Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express) via Stripe. Les données de paiement ne sont jamais stockées sur nos serveurs.",
          },
          {
            q: "Y a-t-il un engagement de durée ?",
            a: "Non, l'abonnement est mensuel et sans engagement. Vous payez mois par mois et pouvez annuler quand vous le souhaitez.",
          },
        ].map((item) => (
          <div
            key={item.q}
            className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-5"
          >
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              {item.q}
            </h3>
            <p className="text-sm text-[var(--muted)]">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
