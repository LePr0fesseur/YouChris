"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function AdminDeleteVideoButton({
  videoId,
  videoTitle,
}: {
  videoId: string;
  videoTitle: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Supprimer définitivement "${videoTitle}" ?`)) return;

    setLoading(true);
    const response = await fetch(`/api/admin/videos/${videoId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.refresh();
    } else {
      alert("Erreur lors de la suppression.");
    }

    setLoading(false);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      loading={loading}
      className="text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10"
      aria-label="Supprimer la vidéo"
    >
      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
    </Button>
  );
}
