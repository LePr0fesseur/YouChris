import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatViews } from "@/lib/utils";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestion des vidéos — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const videos = await prisma.video.findMany({
    include: { tags: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Gestion des vidéos
        </h1>
        <Button asChild size="sm">
          <Link href="/admin/videos/new">
            <Plus className="w-4 h-4" aria-hidden="true" />
            Nouvelle vidéo
          </Link>
        </Button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">
                  Titre
                </th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium hidden md:table-cell">
                  Source
                </th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium">
                  Statut
                </th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium hidden lg:table-cell">
                  Vues
                </th>
                <th className="text-left px-4 py-3 text-[var(--muted)] font-medium hidden lg:table-cell">
                  Date
                </th>
                <th className="text-right px-4 py-3 text-[var(--muted)] font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr
                  key={video.id}
                  className="border-b border-[var(--border)]/50 hover:bg-[var(--border)]/10 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {video.thumbnailUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-14 rounded aspect-video object-cover shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-[var(--foreground)] font-medium truncate max-w-[200px]">
                          {video.title}
                        </p>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          /videos/{video.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant={video.source === "EXCLUSIVE" ? "default" : "secondary"}>
                      {video.source === "YOUTUBE" ? "YouTube" : "Exclusif"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        video.status === "PUBLIC"
                          ? "success"
                          : video.status === "PREMIUM"
                          ? "premium"
                          : "secondary"
                      }
                    >
                      {video.status === "PUBLIC"
                        ? "Public"
                        : video.status === "PREMIUM"
                        ? "Premium"
                        : "Brouillon"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] hidden lg:table-cell">
                    {formatViews(video.views)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] hidden lg:table-cell text-xs">
                    {formatDate(video.publishedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/videos/${video.slug}`} target="_blank" aria-label="Voir la vidéo">
                          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/videos/${video.id}/edit`} aria-label="Modifier la vidéo">
                          <Edit className="w-3.5 h-3.5" aria-hidden="true" />
                        </Link>
                      </Button>
                      <AdminDeleteVideoButton videoId={video.id} videoTitle={video.title} />
                    </div>
                  </td>
                </tr>
              ))}
              {videos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[var(--muted)]">
                    Aucune vidéo. Synchronisez avec YouTube ou créez une vidéo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Composant client pour la suppression
import { AdminDeleteVideoButton } from "@/components/admin/AdminDeleteVideoButton";
