// Configuration NextAuth.js v5
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { isSubscriptionActive } from "@/lib/utils";
import bcrypt from "bcryptjs";
import type { Role, SubscriptionStatus } from "@/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        // Validation des entrées
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Recherche de l'utilisateur
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            subscription: true,
          },
        });

        if (!user) return null;

        // Vérification du verrouillage du compte (protection brute force)
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("ACCOUNT_LOCKED");
        }

        // Vérification du mot de passe
        const passwordValid = await bcrypt.compare(password, user.passwordHash);

        if (!passwordValid) {
          // Incrémenter les tentatives échouées
          const newAttempts = user.loginAttempts + 1;
          const lockedUntil = newAttempts >= 5
            ? new Date(Date.now() + 15 * 60 * 1000) // Verrouillage 15 minutes
            : null;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: newAttempts,
              ...(lockedUntil ? { lockedUntil } : {}),
            },
          });

          if (lockedUntil) {
            // Log de l'événement de sécurité
            await prisma.activityLog.create({
              data: {
                action: "ACCOUNT_LOCKED",
                details: { email, attempts: newAttempts },
                userId: user.id,
              },
            });
            throw new Error("ACCOUNT_LOCKED");
          }

          return null;
        }

        // Réinitialisation des tentatives après connexion réussie
        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          subscriptionStatus: (user.subscription?.status ?? null) as SubscriptionStatus | null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
        token.subscriptionStatus = (user as { subscriptionStatus: SubscriptionStatus | null }).subscriptionStatus;
      }

      // Rafraîchissement des données de l'abonnement à chaque requête (si token existant)
      if (token.id && !user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { subscription: true },
        });

        if (dbUser) {
          token.role = dbUser.role as Role;
          token.subscriptionStatus = (dbUser.subscription?.status ?? null) as SubscriptionStatus | null;

          // Vérification de l'expiration de l'abonnement
          if (dbUser.subscription && !isSubscriptionActive(dbUser.subscription)) {
            token.subscriptionStatus = "EXPIRED" as SubscriptionStatus;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.subscriptionStatus = token.subscriptionStatus as SubscriptionStatus | null;
      }
      return session;
    },
  },
});

// Extension des types NextAuth
declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    subscriptionStatus: SubscriptionStatus | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: Role;
      subscriptionStatus: SubscriptionStatus | null;
    };
  }
}
