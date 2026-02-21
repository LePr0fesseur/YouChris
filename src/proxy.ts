// Middleware Next.js — Authentification, autorisation par rôle, rate limiting
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, RATE_LIMITS, getRateLimitHeaders } from "@/lib/rate-limit";

export default auth(async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = (request as any).auth;

  // ─── Rate limiting sur les routes API ───────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    let limitConfig = RATE_LIMITS.api;

    if (pathname.startsWith("/api/auth/")) {
      limitConfig = RATE_LIMITS.auth;
    } else if (pathname.startsWith("/api/admin/youtube/sync")) {
      limitConfig = RATE_LIMITS.youtubeSyncs;
    } else if (pathname.startsWith("/api/stripe/")) {
      limitConfig = RATE_LIMITS.stripe;
    }

    const result = rateLimit(`${ip}:${pathname}`, limitConfig);
    const headers = getRateLimitHeaders(result, limitConfig);

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Trop de requêtes. Veuillez réessayer dans quelques instants." },
        { status: 429, headers }
      );
    }
  }

  // ─── Protection des routes admin ─────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login?redirect=/admin", request.url));
    }
    if (session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // ─── Protection des routes membres premium ───────────────────────────────────
  if (pathname.startsWith("/member/premium")) {
    if (!session) {
      return NextResponse.redirect(
        new URL("/login?redirect=/member/premium/videos", request.url)
      );
    }

    const subStatus = session.user?.subscriptionStatus;
    const isActive = subStatus === "ACTIVE";

    if (!isActive) {
      return NextResponse.redirect(new URL("/premium", request.url));
    }
  }

  // ─── Protection des routes membres ───────────────────────────────────────────
  if (pathname.startsWith("/member")) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${pathname}`, request.url)
      );
    }
  }

  // ─── Headers de sécurité ─────────────────────────────────────────────────────
  const response = NextResponse.next();

  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' blob:",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://js.stripe.com",
    "connect-src 'self' https://api.stripe.com https://www.googleapis.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  return response;
});

export const config = {
  matcher: [
    // Applique le middleware à toutes les routes sauf les fichiers statiques
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
