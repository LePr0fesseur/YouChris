// API de création de session du portail client Stripe
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCustomerPortalSession } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Aucun compte Stripe associé à cet utilisateur" },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const portalSession = await createCustomerPortalSession({
      stripeCustomerId: user.stripeCustomerId,
      returnUrl: `${appUrl}/member/subscription`,
    });

    return NextResponse.redirect(portalSession.url, { status: 303 });
  } catch (error) {
    console.error("Erreur création portail client:", error);
    return NextResponse.json(
      { error: "Impossible d'accéder au portail de gestion." },
      { status: 500 }
    );
  }
}
