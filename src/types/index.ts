// Types partagés pour l'application Les Vidéos de Chris

export type Role = "USER" | "ADMIN";
export type VideoSource = "YOUTUBE" | "EXCLUSIVE";
export type VideoStatus = "PUBLIC" | "PREMIUM" | "DRAFT";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE";

// Type utilisateur pour la session
export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  subscriptionStatus?: SubscriptionStatus | null;
}

// Type vidéo pour le front-end
export interface VideoCard {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  customThumbnail?: string | null;
  source: VideoSource;
  status: VideoStatus;
  duration?: number | null;
  publishedAt?: Date | null;
  views: number;
  tags: { id: string; name: string; slug: string }[];
}

// Type pour la pagination
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// Type pour les rapports de synchronisation YouTube
export interface YouTubeSyncReport {
  created: number;
  updated: number;
  unchanged: number;
  errors: string[];
  syncedAt: Date;
}

// Type pour le consentement cookies
export interface CookieConsent {
  essential: true; // Toujours true, non modifiable
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

// Réponse API générique
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Type pour l'export de données RGPD
export interface UserDataExport {
  user: {
    id: string;
    email: string;
    name?: string | null;
    createdAt: Date;
    lastLoginAt?: Date | null;
  };
  subscription?: {
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  } | null;
  comments: {
    content: string;
    videoTitle: string;
    createdAt: Date;
  }[];
  exportedAt: Date;
}

// Statistiques admin
export interface AdminStats {
  totalVideos: number;
  premiumVideos: number;
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
}
