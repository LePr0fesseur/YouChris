"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function AdminNewVideoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      youtubeId: formData.get("youtubeId") as string,
      status: formData.get("status") as string,
      source: "YOUTUBE",
      tags: (formData.get("tags") as string)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const response = await fetch("/api/admin/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      router.push("/admin/videos");
    } else {
      const json = await response.json();
      setError(json.error || "Une erreur est survenue.");
    }

    setLoading(false);
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
          Nouvelle vidéo
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass rounded-xl p-6 space-y-5"
      >
        {error && (
          <div className="rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 px-4 py-3 text-sm text-[var(--danger)]" role="alert">
            {error}
          </div>
        )}

        <Input
          type="text"
          name="title"
          label="Titre"
          placeholder="Titre de la vidéo"
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            placeholder="Description de la vidéo..."
            className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none resize-y"
          />
        </div>

        <Input
          type="text"
          name="youtubeId"
          label="ID YouTube (optionnel)"
          placeholder="dQw4w9WgXcQ"
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="status"
            className="text-sm font-medium text-[var(--foreground)]"
          >
            Statut
          </label>
          <select
            id="status"
            name="status"
            defaultValue="PUBLIC"
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
          placeholder="cybersécurité, tutoriel, linux"
        />

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            <Save className="w-4 h-4" aria-hidden="true" />
            Créer la vidéo
          </Button>
          <Button variant="ghost" type="button" asChild>
            <Link href="/admin/videos">Annuler</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
