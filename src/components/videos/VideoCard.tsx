import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatDate, formatViews } from "@/lib/utils";
import { Lock, Play } from "lucide-react";
import type { VideoCard as VideoCardType } from "@/types";

interface VideoCardProps {
  video: VideoCardType;
  priority?: boolean;
}

export function VideoCard({ video, priority = false }: VideoCardProps) {
  const thumbnail = video.customThumbnail || video.thumbnailUrl;
  const isPremium = video.status === "PREMIUM";
  const isExclusive = video.source === "EXCLUSIVE";

  return (
    <article className="group relative">
      <Link href={`/videos/${video.slug}`} className="block">
        {/* Miniature */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] group-hover:border-[var(--accent)]/50 transition-colors">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={`Miniature de ${video.title}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface)]">
              <Play className="w-12 h-12 text-[var(--muted)]" aria-hidden="true" />
            </div>
          )}

          {/* Overlay sur hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white" aria-hidden="true" />
            </div>
          </div>

          {/* Badges superposés */}
          <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
            {isPremium && (
              <span className="badge-premium flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" aria-hidden="true" />
                Premium
              </span>
            )}
            {isExclusive && !isPremium && (
              <Badge variant="default" className="text-[10px]">
                Exclusif
              </Badge>
            )}
          </div>

          {/* Durée */}
          {video.duration && video.duration > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-semibold text-[var(--foreground)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors leading-snug">
            {video.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            {video.publishedAt && (
              <time dateTime={new Date(video.publishedAt).toISOString()}>
                {formatDate(video.publishedAt)}
              </time>
            )}
            {video.views > 0 && (
              <>
                <span aria-hidden="true">•</span>
                <span>{formatViews(video.views)}</span>
              </>
            )}
          </div>

          {/* Tags */}
          {video.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-2">
              {video.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
