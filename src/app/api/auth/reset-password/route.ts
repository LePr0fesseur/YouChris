// API de réinitialisation de mot de passe
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Données invalides" },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    // Recherche du token (non expiré)
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Ce lien de réinitialisation est invalide ou a expiré. Faites une nouvelle demande.",
        },
        { status: 400 }
      );
    }

    // Hashage du nouveau mot de passe
    const passwordHash = await bcrypt.hash(password, 12);

    // Mise à jour et invalidation du token (usage unique)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "PASSWORD_RESET",
        userId: user.id,
      },
    });

    return NextResponse.json({
      message: "Mot de passe réinitialisé avec succès.",
    });
  } catch (error) {
    console.error("Erreur reset password:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}
