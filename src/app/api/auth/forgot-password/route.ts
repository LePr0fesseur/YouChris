// API de demande de réinitialisation de mot de passe
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { sendPasswordResetEmail } from "@/lib/email";
import { generateSecureToken } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const { email } = parsed.data;

    // Réponse identique qu'il y ait un compte ou non (évite l'énumération)
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetToken = generateSecureToken(48);
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      sendPasswordResetEmail({
        to: email,
        token: resetToken,
        name: user.name,
      }).catch((err) =>
        console.error("Erreur envoi email reset password:", err)
      );
    }

    return NextResponse.json({
      message:
        "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
    });
  } catch (error) {
    console.error("Erreur forgot password:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}
