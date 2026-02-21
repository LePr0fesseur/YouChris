"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Formulaire de demande de réinitialisation
function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const json = await response.json();

    if (!response.ok) {
      setError(json.error || "Une erreur est survenue.");
    } else {
      setSent(true);
    }

    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[var(--success)]/20 border border-[var(--success)]/40 flex items-center justify-center mx-auto">
          <span className="text-2xl">📧</span>
        </div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          Email envoyé !
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Si un compte existe avec cet email, vous recevrez un lien de
          réinitialisation valable 1 heure.
        </p>
        <Link
          href="/login"
          className="text-sm text-[var(--accent)] hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Mot de passe oublié
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6"
      >
        {error && (
          <div className="rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 px-4 py-3 text-sm text-[var(--danger)]" role="alert">
            {error}
          </div>
        )}
        <Input
          type="email"
          name="email"
          label="Adresse email"
          placeholder="vous@exemple.fr"
          required
        />
        <Button type="submit" className="w-full" loading={loading}>
          Envoyer le lien
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--muted)] mt-4">
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}

// Formulaire de définition du nouveau mot de passe
function ResetForm({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, confirmPassword }),
    });

    const json = await response.json();

    if (!response.ok) {
      setError(json.error || "Une erreur est survenue.");
    } else {
      setSuccess(true);
    }

    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[var(--success)]/20 border border-[var(--success)]/40 flex items-center justify-center mx-auto">
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          Mot de passe modifié !
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Votre mot de passe a été réinitialisé avec succès.
        </p>
        <Link
          href="/login"
          className="inline-block mt-4 px-6 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Nouveau mot de passe
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Choisissez un mot de passe sécurisé.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6"
      >
        {error && (
          <div className="rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 px-4 py-3 text-sm text-[var(--danger)]" role="alert">
            {error}
          </div>
        )}
        <Input
          type="password"
          name="password"
          label="Nouveau mot de passe"
          placeholder="••••••••••••"
          required
        />
        <Input
          type="password"
          name="confirmPassword"
          label="Confirmer le mot de passe"
          placeholder="••••••••••••"
          required
        />
        <Button type="submit" className="w-full" loading={loading}>
          Réinitialiser
        </Button>
      </form>
    </div>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return token ? <ResetForm token={token} /> : <ForgotPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
