"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Trash2, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export default function AccountPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  async function handleProfileUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess(false);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (response.ok) {
      setProfileSuccess(true);
      await update({ name });
    } else {
      const json = await response.json();
      setProfileError(json.error || "Une erreur est survenue.");
    }

    setProfileLoading(false);
  }

  async function handleDataExport() {
    const response = await fetch("/api/user/data-export");
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mes-donnees.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      setDeleteError("Veuillez saisir votre mot de passe pour confirmer.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");

    const response = await fetch("/api/user/delete-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword }),
    });

    if (response.ok) {
      router.push("/?compte-supprime=true");
    } else {
      const json = await response.json();
      setDeleteError(json.error || "Une erreur est survenue.");
    }

    setDeleteLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">
        Mon profil
      </h1>

      {/* Formulaire de profil */}
      <section className="glass rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Informations personnelles
        </h2>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          {profileSuccess && (
            <div className="rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20 px-4 py-3 text-sm text-[var(--success)]">
              Profil mis à jour avec succès.
            </div>
          )}
          {profileError && (
            <div className="rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 px-4 py-3 text-sm text-[var(--danger)]" role="alert">
              {profileError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Adresse email
            </label>
            <p className="text-sm text-[var(--muted)] px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              {session?.user.email}
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">
              L&apos;email ne peut pas être modifié.
            </p>
          </div>

          <Input
            type="text"
            name="name"
            label="Prénom / Pseudo"
            placeholder="Chris"
            defaultValue={session?.user.name ?? ""}
          />

          <Button type="submit" loading={profileLoading}>
            Enregistrer les modifications
          </Button>
        </form>
      </section>

      {/* Données RGPD */}
      <section className="glass rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Mes données (RGPD)
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Conformément au RGPD, vous pouvez télécharger toutes vos données
          personnelles ou demander la suppression de votre compte.
        </p>

        <Button variant="secondary" onClick={handleDataExport}>
          <Download className="w-4 h-4" aria-hidden="true" />
          Télécharger mes données
        </Button>
      </section>

      {/* Suppression de compte */}
      <section className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[var(--danger)]" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-[var(--danger)]">
            Zone de danger
          </h2>
        </div>

        <p className="text-sm text-[var(--muted)]">
          La suppression de votre compte est irréversible. Toutes vos données
          personnelles seront effacées et votre abonnement sera annulé
          automatiquement.
        </p>

        {!deleteConfirm ? (
          <Button
            variant="danger"
            onClick={() => setDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Supprimer mon compte
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--foreground)]">
              Confirmez la suppression en saisissant votre mot de passe :
            </p>
            {deleteError && (
              <div className="rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 px-4 py-3 text-sm text-[var(--danger)]" role="alert">
                {deleteError}
              </div>
            )}
            <Input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Votre mot de passe"
              autoComplete="current-password"
            />
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                loading={deleteLoading}
              >
                Confirmer la suppression
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setDeleteConfirm(false);
                  setDeletePassword("");
                  setDeleteError("");
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
