"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, AlertCircle } from "lucide-react";
import type { YouTubeSyncReport } from "@/types";

interface YouTubeSyncButtonProps {
  lastSync?: Date | null;
}

export function YouTubeSyncButton({ lastSync }: YouTubeSyncButtonProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<YouTubeSyncReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setError(null);
    setReport(null);

    const response = await fetch("/api/admin/youtube/sync", {
      method: "POST",
    });

    const json = await response.json();

    if (response.ok && json.report) {
      setReport(json.report);
    } else {
      setError(json.error || "Erreur lors de la synchronisation.");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSync}
          loading={loading}
          variant="secondary"
          size="sm"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Synchroniser YouTube
        </Button>

        {lastSync && (
          <span className="text-xs text-[var(--muted)]">
            Dernière sync : {new Date(lastSync).toLocaleString("fr-FR")}
          </span>
        )}
      </div>

      {/* Rapport de synchronisation */}
      {report && (
        <div className="rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 text-[var(--success)] font-medium mb-1">
            <Check className="w-4 h-4" aria-hidden="true" />
            Synchronisation terminée
          </div>
          <div className="text-[var(--muted)] space-y-0.5">
            <p>Nouvelles vidéos : {report.created}</p>
            <p>Mises à jour : {report.updated}</p>
            <p>Inchangées : {report.unchanged}</p>
            {report.errors.length > 0 && (
              <p className="text-[var(--danger)]">
                Erreurs : {report.errors.length}
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" aria-hidden="true" />
          <span className="text-[var(--danger)]">{error}</span>
        </div>
      )}
    </div>
  );
}
