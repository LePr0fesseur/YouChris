import { prisma } from "@/lib/prisma";
import { VideoGrid } from "@/components/videos/VideoGrid";
import { Crown } from "lucide-react";
import type { Metadata } from "next";
import type { VideoCard } from "@/types";

export const metadata: Metadata = {
  title: "Vidéos Premium",
};

export const dynamic = "force-dynamic";

export default async function PremiumVideosPage() {
  const videos = await prisma.video.findMany({
    where: { status: "PREMIUM" },
    include: { tags: true },
    orderBy: { publishedAt: "desc" },
  }) as VideoCard[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <Crown className="w-5 h-5 text-amber-400" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Vidéos Premium
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Contenu exclusif réservé aux membres abonnés
          </p>
        </div>
      </div>

      <VideoGrid
        videos={videos}
        emptyMessage="Aucune vidéo premium pour l'instant. Revenez bientôt !"
      />
    </div>
  );
}
