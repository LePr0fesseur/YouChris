"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { registerSchema } from "@/lib/validators";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
    general?: string;
  }>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      name: (formData.get("name") as string) || undefined,
    };

    // Validation côté client
    const result = registerSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((err: import("zod").ZodIssue) => {
        const field = err.path[0] as keyof typeof fieldErrors;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    });

    const json = await response.json();

    if (!response.ok) {
      setErrors({ general: json.error || "Une erreur est survenue." });
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirection après 3 secondes
    setTimeout(() => router.push("/login"), 3000);
  }

  if (success) {
    return (
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[var(--success)]/20 border border-[var(--success)]/40 flex items-center justify-center mx-auto">
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          Compte créé !
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Un email de vérification vous a été envoyé. Consultez votre boîte mail
          et cliquez sur le lien de confirmation.
        </p>
        <p className="text-xs text-[var(--muted)]">
          Redirection vers la connexion dans quelques secondes…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Créer un compte
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Rejoignez la communauté Les Vidéos de Chris.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6"
        noValidate
      >
        {errors.general && (
          <div
            className="rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 px-4 py-3 text-sm text-[var(--danger)]"
            role="alert"
          >
            {errors.general}
          </div>
        )}

        <Input
          type="text"
          name="name"
          label="Prénom / Pseudo (optionnel)"
          placeholder="Chris"
          autoComplete="given-name"
          error={errors.name}
        />

        <Input
          type="email"
          name="email"
          label="Adresse email"
          placeholder="vous@exemple.fr"
          autoComplete="email"
          required
          error={errors.email}
        />

        <Input
          type="password"
          name="password"
          label="Mot de passe"
          placeholder="••••••••••••"
          autoComplete="new-password"
          required
          error={errors.password}
        />
        <p className="text-xs text-[var(--muted)] -mt-2">
          Minimum 12 caractères, avec une majuscule, un chiffre et un caractère spécial.
        </p>

        <Input
          type="password"
          name="confirmPassword"
          label="Confirmer le mot de passe"
          placeholder="••••••••••••"
          autoComplete="new-password"
          required
          error={errors.confirmPassword}
        />

        <Button type="submit" className="w-full" loading={loading}>
          Créer mon compte
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--muted)] mt-4">
        Déjà un compte ?{" "}
        <Link
          href="/login"
          className="text-[var(--accent)] hover:underline font-medium"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
