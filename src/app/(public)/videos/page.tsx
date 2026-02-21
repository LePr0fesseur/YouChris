import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { VideoGrid, VideoGridSkeleton } from "@/components/videos/VideoGrid";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { videoSearchSchema } from "@/lib/validators";
import type { Metadata } from "next";
import type { VideoCard } from "@/types";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Catalogue vidéos",
  description:
    "Explorez toutes les vidéos de Chris sur la cybersécurité, le hardware, les tutoriels tech et le gaming.",
};

export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getVideos(params: {
  q?: string;
  tag?: string;
  sort?: string;
  page?: number;
}): Promise<{ videos: VideoCard[]; total: number; tags: { name: string; slug: string }[] }> {
  const { q, tag, sort = "date", page = 1 } = params;
  const pageSize = 12;
  const skip = (page - 1) * pageSize;

  // Conditions de filtrage
  const where: import("@prisma/client").Prisma.VideoWhereInput = {
    status: { in: ["PUBLIC", "PREMIUM"] },
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(tag ? { tags: { some: { slug: tag } } } : {}),
  };

  // Tri
  const orderBy: import("@prisma/client").Prisma.VideoOrderByWithRelationInput =
    sort === "views"
      ? { views: "desc" }
      : sort === "title"
      ? { title: "asc" }
      : { publishedAt: "desc" };

  const [videos, total, allTags] = await Promise.all([
    prisma.video.findMany({
      where,
      include: { tags: true },
      orderBy,
      take: pageSize,
      skip,
    }),
    prisma.video.count({ where }),
    prisma.tag.findMany({
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    videos: videos.map((v) => ({ ...v, publishedAt: v.publishedAt })),
    total,
    tags: allTags,
  };
}

async function VideosContent({
  q,
  tag,
  sort,
  page,
}: {
  q?: string;
  tag?: string;
  sort?: string;
  page?: number;
}) {
  const { videos, total, tags } = await getVideos({ q, tag, sort, page });
  const currentPage = page || 1;
  const pageSize = 12;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-8">
      {/* Filtres par tag */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/videos"
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            !tag
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Tous
        </Link>
        {tags.map((t) => (
          <Link
            key={t.slug}
            href={`/videos?tag=${t.slug}${q ? `&q=${q}` : ""}${sort !== "date" ? `&sort=${sort}` : ""}`}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              tag === t.slug
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.name}
          </Link>
        ))}
      </div>

      {/* Résultats */}
      <div>
        <p className="text-sm text-[var(--muted)] mb-6">
          {total} vidéo{total !== 1 ? "s" : ""}
          {q && ` pour "${q}"`}
          {tag && ` dans "${tag}"`}
        </p>
        <VideoGrid videos={videos} emptyMessage="Aucune vidéo ne correspond à votre recherche." />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {currentPage > 1 && (
            <Button variant="secondary" size="sm" asChild>
              <Link
                href={`/videos?page=${currentPage - 1}${q ? `&q=${q}` : ""}${tag ? `&tag=${tag}` : ""}${sort !== "date" ? `&sort=${sort}` : ""}`}
              >
                Précédent
              </Link>
            </Button>
          )}
          <span className="text-sm text-[var(--muted)]">
            Page {currentPage} sur {totalPages}
          </span>
          {currentPage < totalPages && (
            <Button variant="secondary" size="sm" asChild>
              <Link
                href={`/videos?page=${currentPage + 1}${q ? `&q=${q}` : ""}${tag ? `&tag=${tag}` : ""}${sort !== "date" ? `&sort=${sort}` : ""}`}
              >
                Suivant
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default async function VideosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const parsed = videoSearchSchema.safeParse(params);
  const { q, tag, sort, page } = parsed.success
    ? parsed.data
    : { q: undefined, tag: undefined, sort: "date", page: 1 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
          Toutes les vidéos
        </h1>

        {/* Barre de recherche */}
        <form method="get" action="/videos" className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Rechercher une vidéo..."
              className="w-full pl-10 pr-4 h-10 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Tri */}
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]"
              aria-hidden="true"
            />
            <select
              name="sort"
              defaultValue={sort}
              className="h-10 pl-10 pr-4 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="date">Plus récentes</option>
              <option value="views">Plus vues</option>
              <option value="title">Alphabétique</option>
            </select>
          </div>

          <Button type="submit" size="md">
            Rechercher
          </Button>
        </form>
      </div>

      <Suspense fallback={<VideoGridSkeleton count={12} />}>
        <VideosContent q={q} tag={tag} sort={sort} page={page} />
      </Suspense>
    </div>
  );
}
