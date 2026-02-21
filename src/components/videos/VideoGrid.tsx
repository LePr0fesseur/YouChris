import { VideoCard } from "./VideoCard";
import type { VideoCard as VideoCardType } from "@/types";

interface VideoGridProps {
  videos: VideoCardType[];
  emptyMessage?: string;
}

// Skeleton loader pour le chargement
export function VideoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-video rounded-xl skeleton" />
          <div className="space-y-2">
            <div className="h-4 rounded skeleton w-3/4" />
            <div className="h-3 rounded skeleton w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VideoGrid({ videos, emptyMessage }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--muted)]">
          {emptyMessage || "Aucune vidéo trouvée."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video, index) => (
        <VideoCard
          key={video.id}
          video={video}
          priority={index < 3}
        />
      ))}
    </div>
  );
}
