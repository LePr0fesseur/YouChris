"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface VideoData {
  id: string;
  title: string;
  description: string | null;
  youtubeId: string | null;
  status: "PUBLIC" | "PREMIUM" | "DRAFT";
  source: "YOUTUBE" | "EXCLUSIVE";
  tags: { name: string }[];
}

export default function AdminEditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = params.id as string;

  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/videos/${videoId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.video) setVideo(data.video);
        setFetchLoading(false);
      })
      .catch(() => setFetchLoading(false));
  }, [videoId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as string,
      tags: (formData.get("tags") as string)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const response = await fetch(`/api/admin/videos/${videoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/admin/videos"), 1500);
    } else {
      const json = await response.json();
      setError(json.error || "Une erreur est survenue.");
    }

    setLoading(false);
  }

  if (fetchLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-48">
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="p-6 text-center text-[var(--muted)]">
        Vidéo introuvable.{" "}
        <Link href="/admin/videos" className="text-[var(--accent)]">
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/videos" aria-label="Retour">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Modifier la vidéo
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-5">
        {error && (
          <div className="rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 px-4 py-3 text-sm text-[var(--danger)]" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20 px-4 py-3 text-sm text-[var(--success)]">
            Vidéo mise à jour. Redirection...
          </div>
        )}

        <Input
          type="text"
          name="title"
          label="Titre"
          defaultValue={video.title}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Description
          </label>
          <textarea
            name="description"
            rows={5}
            defaultValue={video.description || ""}
            className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none resize-y"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium text-[var(--foreground)]">
            Statut
          </label>
          <select
            id="status"
            name="status"
            defaultValue={video.status}
            className="h-10 px-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none cursor-pointer"
          >
            <option value="PUBLIC">Public</option>
            <option value="PREMIUM">Premium</option>
            <option value="DRAFT">Brouillon</option>
          </select>
        </div>

        <Input
          type="text"
          name="tags"
          label="Tags (séparés par des virgules)"
          defaultValue={video.tags.map((t) => t.name).join(", ")}
          placeholder="cybersécurité, tutoriel, linux"
        />

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            <Save className="w-4 h-4" aria-hidden="true" />
            Enregistrer
          </Button>
          <Button variant="ghost" type="button" asChild>
            <Link href="/admin/videos">Annuler</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
