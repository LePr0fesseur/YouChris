import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isSubscriptionActive, formatDate, formatViews, formatDuration } from "@/lib/utils";
import { VideoGrid } from "@/components/videos/VideoGrid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Crown, Calendar, Eye, Clock } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import type { VideoCard } from "@/types";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getVideo(slug: string) {
  return prisma.video.findUnique({
    where: { slug },
    include: {
      tags: true,
      comments: {
        where: { approved: true },
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

async function getRelatedVideos(videoId: string, tags: string[]): Promise<VideoCard[]> {
  const videos = await prisma.video.findMany({
    where: {
      id: { not: videoId },
      status: { in: ["PUBLIC", "PREMIUM"] },
      ...(tags.length > 0
        ? { tags: { some: { id: { in: tags } } } }
        : {}),
    },
    include: { tags: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return videos.map((v) => ({ ...v, publishedAt: v.publishedAt }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideo(slug);

  if (!video) return { title: "Vidéo introuvable" };

  return {
    title: video.title,
    description: video.description?.substring(0, 155) ?? undefined,
    openGraph: {
      title: video.title,
      description: video.description?.substring(0, 155) ?? undefined,
      type: "video.other",
      images: video.thumbnailUrl ? [{ url: video.thumbnailUrl }] : [],
    },
  };
}

export default async function VideoPage({ params }: PageProps) {
  const { slug } = await params;
  const [video, session] = await Promise.all([getVideo(slug), auth()]);

  if (!video || video.status === "DRAFT") notFound();

  const isPremiumContent = video.status === "PREMIUM";
  const userSubscription = session?.user
    ? await prisma.subscription.findUnique({
        where: { userId: session.user.id },
      })
    : null;
  const hasAccess = !isPremiumContent || isSubscriptionActive(userSubscription);

  const relatedVideos = await getRelatedVideos(
    video.id,
    video.tags.map((t) => t.id)
  );

  // Incrément de vue (fire and forget)
  if (video.youtubeId) {
    prisma.video
      .update({ where: { id: video.id }, data: { views: { increment: 1 } } })
      .catch(() => {});
  }

  // Structured data JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.publishedAt?.toISOString(),
    duration: video.duration ? `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S` : undefined,
    embedUrl: video.youtubeId
      ? `https://www.youtube.com/embed/${video.youtubeId}`
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-[var(--surface)]">
              {hasAccess ? (
                video.youtubeId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  // Pour les vidéos exclusives : l'URL signée est chargée via API
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-[var(--muted)]">
                      Chargement du lecteur vidéo...
                    </p>
                  </div>
                )
              ) : (
                // Paywall overlay
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-t from-[var(--background)] to-transparent">
                  {video.thumbnailUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm"
                      style={{ backgroundImage: `url(${video.thumbnailUrl})` }}
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative space-y-4">
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto">
                      <Lock
                        className="w-7 h-7 text-amber-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
                        Contenu Premium
                      </h2>
                      <p className="text-[var(--muted)] text-sm">
                        Cette vidéo est réservée aux membres premium.
                        Abonnez-vous pour y accéder.
                      </p>
                    </div>
                    <Button variant="premium" asChild>
                      <Link href="/premium">
                        <Crown className="w-4 h-4" aria-hidden="true" />
                        Devenir Premium
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Informations de la vidéo */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] flex-1">
                  {video.title}
                </h1>
                {isPremiumContent && (
                  <Badge variant="premium">Premium</Badge>
                )}
              </div>

              {/* Métadonnées */}
              <div className="flex items-center gap-4 text-sm text-[var(--muted)] flex-wrap">
                {video.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    {formatDate(video.publishedAt)}
                  </span>
                )}
                {video.views > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    {formatViews(video.views)}
                  </span>
                )}
                {video.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>

              {/* Tags */}
              {video.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {video.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/videos?tag=${tag.slug}`}
                      className="px-3 py-1 rounded-full text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Description */}
              {video.description && (
                <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4">
                  <p className="text-sm text-[var(--muted)] whitespace-pre-line leading-relaxed">
                    {video.description}
                  </p>
                </div>
              )}
            </div>

            {/* Section commentaires (premium uniquement) */}
            {isPremiumContent && hasAccess && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Commentaires ({video.comments.length})
                </h2>

                {/* Formulaire de commentaire */}
                <form
                  action={`/api/videos/${video.id}/comments`}
                  method="post"
                  className="space-y-3"
                >
                  <textarea
                    name="content"
                    placeholder="Partagez votre avis..."
                    rows={3}
                    required
                    maxLength={2000}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none resize-none"
                  />
                  <Button type="submit" size="sm">
                    Publier le commentaire
                  </Button>
                </form>

                {/* Liste des commentaires */}
                <div className="space-y-4">
                  {video.comments.length === 0 ? (
                    <p className="text-sm text-[var(--muted)] text-center py-6">
                      Soyez le premier à commenter !
                    </p>
                  ) : (
                    video.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[var(--foreground)]">
                            {comment.user.name || comment.user.email.split("@")[0]}
                          </span>
                          <span className="text-xs text-[var(--muted)]">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted)] leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar : vidéos similaires */}
          <aside>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Vidéos similaires
            </h2>
            {relatedVideos.length > 0 ? (
              <div className="space-y-4">
                {relatedVideos.map((related) => (
                  <Link
                    key={related.id}
                    href={`/videos/${related.slug}`}
                    className="flex gap-3 group"
                  >
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-[var(--surface)] border border-[var(--border)] shrink-0">
                      {related.thumbnailUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={related.thumbnailUrl}
                          alt={related.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-medium text-[var(--foreground)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                        {related.title}
                      </h3>
                      {related.publishedAt && (
                        <p className="text-xs text-[var(--muted)] mt-1">
                          {formatDate(related.publishedAt)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                Aucune vidéo similaire.
              </p>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
