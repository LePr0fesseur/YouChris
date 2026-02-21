// API de suppression de compte (RGPD — Droit à l'effacement)
import { NextResponse } from "next/server";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendAccountDeletionEmail } from "@/lib/email";
import { stripe } from "@/lib/stripe";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Confirmation par mot de passe requise" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Vérification du mot de passe pour confirmer la suppression
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Mot de passe incorrect" },
        { status: 400 }
      );
    }

    // Annulation de l'abonnement Stripe si actif
    if (user.subscription?.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(
          user.subscription.stripeSubscriptionId
        );
      } catch (stripeError) {
        console.error("Erreur annulation Stripe:", stripeError);
        // On continue malgré l'erreur Stripe
      }
    }

    // Envoi de l'email de confirmation
    sendAccountDeletionEmail({
      to: user.email,
      name: user.name,
    }).catch((err) =>
      console.error("Erreur envoi email suppression:", err)
    );

    // Suppression immédiate des données personnelles
    // (les commentaires et logs sont conservés anonymisés)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: `deleted_${user.id}@deleted.invalid`,
        passwordHash: "DELETED",
        name: null,
        emailVerifyToken: null,
        resetToken: null,
        stripeCustomerId: null,
        cookieConsent: Prisma.JsonNull,
        emailVerified: false,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "ACCOUNT_DELETED",
        details: { userId: user.id },
      },
    });

    return NextResponse.json({
      message: "Votre compte a été supprimé.",
    });
  } catch (error) {
    console.error("Erreur suppression compte:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}
