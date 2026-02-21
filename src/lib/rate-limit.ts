// Rate limiter basé sur un store en mémoire
// En production, remplacer par Redis pour un fonctionnement multi-instances

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Nettoyage périodique des entrées expirées (toutes les 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;    // Nombre maximum de requêtes
  windowMs: number;       // Fenêtre de temps en millisecondes
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// Configurations prédéfinies
export const RATE_LIMITS = {
  // 5 requêtes par minute pour les routes d'authentification
  auth: { maxRequests: 5, windowMs: 60 * 1000 },
  // 100 requêtes par minute pour l'API générale
  api: { maxRequests: 100, windowMs: 60 * 1000 },
  // 1 requête par 5 minutes pour la synchronisation YouTube
  youtubeSyncs: { maxRequests: 1, windowMs: 5 * 60 * 1000 },
  // 10 requêtes par minute pour la création de session Stripe
  stripe: { maxRequests: 10, windowMs: 60 * 1000 },
};

export function rateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // Nouvelle fenêtre
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

// Headers de réponse pour le rate limiting
export function getRateLimitHeaders(result: RateLimitResult, config: RateLimitConfig): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(config.maxRequests),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
    "Retry-After": result.allowed
      ? "0"
      : String(Math.ceil((result.resetAt - Date.now()) / 1000)),
  };
}
