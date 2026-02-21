"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { loginSchema } from "@/lib/validators";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/member/dashboard";

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validation côté client
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((err: import("zod").ZodIssue) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (response?.error) {
      if (response.error === "ACCOUNT_LOCKED") {
        setErrors({
          general:
            "Votre compte est temporairement verrouillé suite à plusieurs tentatives échouées. Réessayez dans 15 minutes.",
        });
      } else {
        setErrors({
          general: "Email ou mot de passe incorrect.",
        });
      }
      setLoading(false);
      return;
    }

    if (response?.ok) {
      router.push(redirect);
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Connexion</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Bienvenue ! Connectez-vous pour accéder à votre espace.
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
          type="email"
          name="email"
          label="Adresse email"
          placeholder="vous@exemple.fr"
          autoComplete="email"
          required
          error={errors.email}
        />

        <div className="space-y-1">
          <Input
            type="password"
            name="password"
            label="Mot de passe"
            placeholder="••••••••••••"
            autoComplete="current-password"
            required
            error={errors.password}
          />
          <div className="text-right">
            <Link
              href="/reset-password"
              className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={loading}
        >
          Se connecter
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--muted)] mt-4">
        Pas encore de compte ?{" "}
        <Link
          href="/register"
          className="text-[var(--accent)] hover:underline font-medium"
        >
          S&apos;inscrire gratuitement
        </Link>
      </p>
    </div>
  );
}
