// API de création de session Stripe Checkout
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    // Vérification si l'utilisateur est déjà abonné
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

    if (isSubscriptionActive(user.subscription)) {
      return NextResponse.json(
        { error: "Vous êtes déjà abonné Premium" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      stripeCustomerId: user.stripeCustomerId,
      successUrl: `${appUrl}/member/subscription?success=true`,
      cancelUrl: `${appUrl}/premium?cancelled=true`,
    });

    if (!checkoutSession.url) {
      throw new Error("URL de checkout manquante");
    }

    return NextResponse.redirect(checkoutSession.url, { status: 303 });
  } catch (error) {
    console.error("Erreur création checkout:", error);
    return NextResponse.json(
      { error: "Impossible de créer la session de paiement. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
