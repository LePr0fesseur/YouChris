// API d'inscription utilisateur
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { sendVerificationEmail } from "@/lib/email";
import { generateSecureToken } from "@/lib/utils";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation des données
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Données invalides" },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    // Vérification si l'email est déjà utilisé
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Message générique pour ne pas révéler si l'email existe
      return NextResponse.json(
        {
          message:
            "Si cet email n'est pas encore enregistré, un email de confirmation vous sera envoyé.",
        },
        { status: 200 }
      );
    }

    // Hashage du mot de passe (cost factor 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // Token de vérification email
    const emailVerifyToken = generateSecureToken(48);

    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        emailVerifyToken,
        emailVerified: false,
      },
    });

    // Envoi de l'email de vérification (fire and forget en cas d'erreur)
    sendVerificationEmail({
      to: email,
      token: emailVerifyToken,
      name,
    }).catch((err) => console.error("Erreur envoi email vérification:", err));

    // Log de l'activité
    await prisma.activityLog.create({
      data: {
        action: "USER_REGISTERED",
        details: { email },
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: "Compte créé. Vérifiez votre email pour confirmer votre inscription." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur inscription:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
