import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Crown, Check, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon abonnement",
};

interface PageProps {
  searchParams: Promise<{ success?: string }>;
}

export default async function SubscriptionPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = await searchParams;
  const justSubscribed = params.success === "true";

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: { subscription: true },
  });

  const isPremium = isSubscriptionActive(user?.subscription ?? null);
  const sub = user?.subscription;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8">
        Mon abonnement
      </h1>

      {justSubscribed && (
        <div className="rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/20 px-6 py-4 mb-6 flex items-center gap-3">
          <Check className="w-5 h-5 text-[var(--success)] shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold text-[var(--success)]">
              Bienvenue dans le Premium !
            </p>
            <p className="text-sm text-[var(--muted)]">
              Votre abonnement est activé. Profitez de tout le contenu exclusif.
            </p>
          </div>
        </div>
      )}

      {isPremium && sub ? (
        <div className="glass rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)]">
                Abonnement Premium
              </p>
              <p className="text-sm text-[var(--success)]">Actif</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--muted)]">Prochaine facturation</p>
              <p className="text-[var(--foreground)] font-medium">
                {formatDate(sub.currentPeriodEnd)}
              </p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Depuis</p>
              <p className="text-[var(--foreground)] font-medium">
                {formatDate(sub.currentPeriodStart)}
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-4">
            <p className="text-sm text-[var(--muted)] mb-3">
              Gérez votre abonnement (factures, changement de carte, annulation)
              via le portail sécurisé Stripe :
            </p>
            <form action="/api/stripe/portal" method="post">
              <Button variant="secondary" type="submit">
                Gérer mon abonnement Stripe
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="glass rounded-xl p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mx-auto">
            <Crown className="w-7 h-7 text-[var(--muted)]" aria-hidden="true" />
          </div>

          <div>
            <p className="font-semibold text-[var(--foreground)] mb-1">
              {sub?.status === "PAST_DUE" ? "Paiement en attente" : "Aucun abonnement actif"}
            </p>
            {sub?.status === "PAST_DUE" && (
              <div className="flex items-center gap-2 justify-center text-amber-400 text-sm mt-2">
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                <span>Votre paiement a échoué. Veuillez mettre à jour votre moyen de paiement.</span>
              </div>
            )}
            <p className="text-sm text-[var(--muted)] mt-2">
              Abonnez-vous au Premium pour accéder à tout le contenu exclusif.
            </p>
          </div>

          {sub?.stripeSubscriptionId ? (
            <form action="/api/stripe/portal" method="post">
              <Button type="submit" variant="secondary">
                Mettre à jour le paiement
              </Button>
            </form>
          ) : (
            <Button variant="premium" asChild>
              <Link href="/premium">
                <Crown className="w-4 h-4" aria-hidden="true" />
                Découvrir Premium
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
