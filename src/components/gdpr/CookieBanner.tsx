"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { CookieConsent } from "@/types";

const COOKIE_NAME = "cookie_consent";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 an

function getStoredConsent(): CookieConsent | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`)
  );

  if (!match) return null;

  try {
    return JSON.parse(decodeURIComponent(match[2]));
  } catch {
    return null;
  }
}

function setConsentCookie(consent: CookieConsent): void {
  const encoded = encodeURIComponent(JSON.stringify(consent));
  document.cookie = `${COOKIE_NAME}=${encoded}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [prefs, setPrefs] = useState({
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      // Délai court pour éviter un flash au chargement
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  function acceptAll() {
    const consent: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    setConsentCookie(consent);
    setVisible(false);
  }

  function rejectAll() {
    const consent: CookieConsent = {
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    setConsentCookie(consent);
    setVisible(false);
  }

  function savePreferences() {
    const consent: CookieConsent = {
      essential: true,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      timestamp: new Date().toISOString(),
    };
    setConsentCookie(consent);
    setVisible(false);
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50"
      role="dialog"
      aria-label="Gestion des cookies"
      aria-modal="false"
    >
      <div className="glass rounded-2xl p-5 shadow-2xl border border-[var(--border)]">
        <p className="text-sm font-semibold text-[var(--foreground)] mb-1">
          Gestion des cookies 🍪
        </p>
        <p className="text-xs text-[var(--muted)] mb-4">
          Nous utilisons des cookies essentiels au fonctionnement du site.
          Avec votre accord, nous utilisons également des cookies analytiques.{" "}
          <Link
            href="/politique-confidentialite"
            className="text-[var(--accent)] hover:underline"
          >
            En savoir plus
          </Link>
        </p>

        {showCustomize && (
          <div className="mb-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--foreground)] font-medium">
                  Essentiels
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Nécessaires au fonctionnement
                </p>
              </div>
              <div className="w-10 h-5 rounded-full bg-[var(--accent)] cursor-not-allowed opacity-70" aria-hidden="true" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--foreground)] font-medium">Analytiques</p>
                <p className="text-xs text-[var(--muted)]">
                  Mesure d&apos;audience anonyme
                </p>
              </div>
              <button
                onClick={() => setPrefs((p) => ({ ...p, analytics: !p.analytics }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  prefs.analytics ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                }`}
                role="switch"
                aria-checked={prefs.analytics}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    prefs.analytics ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--foreground)] font-medium">Marketing</p>
                <p className="text-xs text-[var(--muted)]">
                  Publicités personnalisées
                </p>
              </div>
              <button
                onClick={() => setPrefs((p) => ({ ...p, marketing: !p.marketing }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  prefs.marketing ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                }`}
                role="switch"
                aria-checked={prefs.marketing}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    prefs.marketing ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={acceptAll}>
            Tout accepter
          </Button>
          <Button size="sm" variant="secondary" onClick={rejectAll}>
            Tout refuser
          </Button>
          {!showCustomize ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowCustomize(true)}
            >
              Personnaliser
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={savePreferences}>
              Enregistrer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
