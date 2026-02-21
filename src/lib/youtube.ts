// Service YouTube Data API v3
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import type { YouTubeSyncReport } from "@/types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YouTubePlaylistItem {
  snippet: {
    resourceId: { videoId: string };
    title: string;
    description: string;
    thumbnails: {
      maxres?: { url: string };
      high?: { url: string };
      medium?: { url: string };
    };
    publishedAt: string;
  };
}

interface YouTubeVideoDetail {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      maxres?: { url: string };
      high?: { url: string };
      medium?: { url: string };
    };
    publishedAt: string;
    tags?: string[];
  };
  contentDetails: {
    duration: string; // Format ISO 8601, ex: "PT1H2M3S"
  };
  statistics: {
    viewCount?: string;
  };
}

// Conversion de la durée ISO 8601 en secondes
function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  return hours * 3600 + minutes * 60 + seconds;
}

// Récupère les vidéos d'une playlist (playlist "uploads" de la chaîne)
async function fetchPlaylistVideos(
  playlistId: string,
  apiKey: string
): Promise<string[]> {
  const videoIds: string[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: "snippet",
      playlistId,
      maxResults: "50",
      key: apiKey,
      ...(pageToken ? { pageToken } : {}),
    });

    const response = await fetch(
      `${YOUTUBE_API_BASE}/playlistItems?${params}`
    );

    if (!response.ok) {
      throw new Error(`Erreur YouTube API: ${response.statusText}`);
    }

    const data = await response.json();
    const items: YouTubePlaylistItem[] = data.items || [];

    videoIds.push(
      ...items.map((item) => item.snippet.resourceId.videoId)
    );

    pageToken = data.nextPageToken;
  } while (pageToken);

  return videoIds;
}

// Récupère les détails de vidéos par lot de 50 (limite de l'API)
async function fetchVideoDetails(
  videoIds: string[],
  apiKey: string
): Promise<YouTubeVideoDetail[]> {
  const details: YouTubeVideoDetail[] = [];

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const params = new URLSearchParams({
      part: "snippet,contentDetails,statistics",
      id: batch.join(","),
      key: apiKey,
    });

    const response = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);

    if (!response.ok) {
      throw new Error(
        `Erreur YouTube API (détails): ${response.statusText}`
      );
    }

    const data = await response.json();
    details.push(...(data.items || []));
  }

  return details;
}

// Récupère l'ID de la playlist "uploads" depuis l'ID de la chaîne
async function getUploadsPlaylistId(
  channelId: string,
  apiKey: string
): Promise<string> {
  const params = new URLSearchParams({
    part: "contentDetails",
    id: channelId,
    key: apiKey,
  });

  const response = await fetch(`${YOUTUBE_API_BASE}/channels?${params}`);

  if (!response.ok) {
    throw new Error(`Erreur récupération chaîne: ${response.statusText}`);
  }

  const data = await response.json();
  const channel = data.items?.[0];

  if (!channel) {
    throw new Error(`Chaîne YouTube introuvable: ${channelId}`);
  }

  return channel.contentDetails.relatedPlaylists.uploads;
}

// Génère un slug unique en vérifiant les collisions dans la BDD
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.video.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Orchestrateur principal de synchronisation
export async function syncYouTubeVideos(): Promise<YouTubeSyncReport> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    throw new Error("YOUTUBE_API_KEY ou YOUTUBE_CHANNEL_ID manquant");
  }

  const report: YouTubeSyncReport = {
    created: 0,
    updated: 0,
    unchanged: 0,
    errors: [],
    syncedAt: new Date(),
  };

  // 1. Récupération de la playlist d'uploads
  const uploadsPlaylistId = await getUploadsPlaylistId(channelId, apiKey);

  // 2. Récupération de tous les IDs de vidéos
  const videoIds = await fetchPlaylistVideos(uploadsPlaylistId, apiKey);

  // 3. Récupération des détails complets
  const videoDetails = await fetchVideoDetails(videoIds, apiKey);

  // 4. Traitement de chaque vidéo
  for (const video of videoDetails) {
    try {
      const thumbnailUrl =
        video.snippet.thumbnails.maxres?.url ||
        video.snippet.thumbnails.high?.url ||
        video.snippet.thumbnails.medium?.url ||
        null;

      const duration = parseISO8601Duration(video.contentDetails.duration);
      const views = parseInt(video.statistics.viewCount || "0");
      const publishedAt = new Date(video.snippet.publishedAt);

      // Vérification si la vidéo existe déjà en BDD
      const existing = await prisma.video.findUnique({
        where: { youtubeId: video.id },
      });

      if (existing) {
        // Vérification si une mise à jour est nécessaire
        const needsUpdate =
          existing.title !== video.snippet.title ||
          existing.description !== video.snippet.description ||
          existing.thumbnailUrl !== thumbnailUrl ||
          existing.duration !== duration;

        if (needsUpdate) {
          await prisma.video.update({
            where: { id: existing.id },
            data: {
              title: video.snippet.title,
              description: video.snippet.description,
              thumbnailUrl,
              duration,
              views,
            },
          });
          report.updated++;
        } else {
          // Mise à jour des vues seulement
          await prisma.video.update({
            where: { id: existing.id },
            data: { views },
          });
          report.unchanged++;
        }
      } else {
        // Création d'une nouvelle vidéo
        const slug = await generateUniqueSlug(video.snippet.title);

        await prisma.video.create({
          data: {
            slug,
            title: video.snippet.title,
            description: video.snippet.description,
            youtubeId: video.id,
            thumbnailUrl,
            source: "YOUTUBE",
            status: "PUBLIC",
            duration,
            views,
            publishedAt,
          },
        });
        report.created++;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      report.errors.push(
        `Vidéo ${video.id}: ${errorMessage}`
      );
    }
  }

  return report;
}
