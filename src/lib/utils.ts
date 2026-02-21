// Utilitaires partagés
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Fusion de classes Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Génération d'un slug unique à partir d'un titre
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, "")   // Garde lettres, chiffres, espaces, tirets
    .trim()
    .replace(/\s+/g, "-")            // Remplace les espaces par des tirets
    .replace(/-+/g, "-")             // Évite les tirets multiples
    .substring(0, 100);              // Limite la longueur
}

// Formatage de la durée (secondes → "1h 23min 45s")
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}min ${s}s`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}

// Formatage d'une date en français
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Formatage d'un nombre de vues
export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M vues`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k vues`;
  return `${views} vue${views !== 1 ? "s" : ""}`;
}

// Troncature de texte
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + "…";
}

// Génération d'un token aléatoire sécurisé
export function generateSecureToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

// Extraction de l'IP depuis les headers Next.js
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

// Masquage partiel d'un email pour les logs
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const maskedLocal = local.length > 2
    ? local[0] + "*".repeat(local.length - 2) + local[local.length - 1]
    : "**";
  return `${maskedLocal}@${domain}`;
}

// Vérification si un abonnement est actif
export function isSubscriptionActive(subscription: {
  status: string;
  currentPeriodEnd: Date;
} | null): boolean {
  if (!subscription) return false;
  if (subscription.status !== "ACTIVE") return false;
  return new Date(subscription.currentPeriodEnd) > new Date();
}

// Calcul du nombre de pages
export function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}
