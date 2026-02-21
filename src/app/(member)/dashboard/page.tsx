import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VideoGrid } from "@/components/videos/VideoGrid";
import { Crown, Video, User, Calendar } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import type { VideoCard } from "@/types";

export const metadata: Metadata = {
  title: "Mon tableau de bord",
};

export default async function DashboardPage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: { subscription: true },
  });

  const isPremium = isSubscriptionActive(user?.subscription ?? null);

  // Dernières vidéos (premium si abonné, sinon publiques seulement)
  const latestVideos = await prisma.video.findMany({
    where: {
      status: {
        in: isPremium ? ["PUBLIC", "PREMIUM"] : ["PUBLIC"],
      },
    },
    include: { tags: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  }) as VideoCard[];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Bonjour {user?.name || session!.user.email.split("@")[0]} !
        </h1>
        <p className="text-[var(--muted)] mt-1">
          Bienvenue dans votre espace membre.
        </p>
      </div>

      {/* Statut abonnement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
              <User className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-[var(--muted)]">Compte</span>
          </div>
          <p className="text-[var(--foreground)] font-medium truncate">
            {user?.email}
          </p>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Membre depuis le {formatDate(user?.createdAt)}
          </p>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isPremium ? "bg-amber-500/10" : "bg-[var(--surface)]"}`}>
              <Crown className={`w-4 h-4 ${isPremium ? "text-amber-400" : "text-[var(--muted)]"}`} aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-[var(--muted)]">Abonnement</span>
          </div>
          {isPremium ? (
            <>
              <p className="text-amber-400 font-semibold">Premium actif</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Renouvellement le{" "}
                {formatDate(user?.subscription?.currentPeriodEnd)}
              </p>
            </>
          ) : (
            <>
              <p className="text-[var(--muted)]">Gratuit</p>
              <Button variant="premium" size="sm" className="mt-2" asChild>
                <Link href="/premium">Passer Premium</Link>
              </Button>
            </>
          )}
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Video className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-[var(--muted)]">Vidéos disponibles</span>
          </div>
          <p className="text-[var(--foreground)] font-medium">
            {isPremium ? "Toutes les vidéos" : "Vidéos publiques"}
          </p>
          <Button variant="ghost" size="sm" className="mt-2 px-0" asChild>
            <Link href="/videos">Parcourir →</Link>
          </Button>
        </div>
      </div>

      {/* Dernières vidéos */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Dernières vidéos
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/videos">Voir tout</Link>
          </Button>
        </div>
        <VideoGrid videos={latestVideos} />
      </div>

      {/* Liens rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/member/account"
          className="glass rounded-xl p-5 hover:border-[var(--accent)]/30 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Mon profil
              </p>
              <p className="text-xs text-[var(--muted)]">
                Gérer mes informations personnelles
              </p>
            </div>
          </div>
        </Link>

        {isPremium && (
          <Link
            href="/member/subscription"
            className="glass rounded-xl p-5 hover:border-amber-500/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[var(--muted)] group-hover:text-amber-400 transition-colors" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Mon abonnement
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Gérer ou annuler mon abonnement Premium
                </p>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
