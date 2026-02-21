// API d'export des données personnelles (RGPD — Droit d'accès)
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UserDataExport } from "@/types";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: {
        select: {
          status: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
        },
      },
      comments: {
        include: {
          video: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur introuvable" },
      { status: 404 }
    );
  }

  const exportData: UserDataExport = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
    subscription: user.subscription
      ? {
          status: user.subscription.status,
          currentPeriodStart: user.subscription.currentPeriodStart,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
        }
      : null,
    comments: user.comments.map((comment) => ({
      content: comment.content,
      videoTitle: comment.video.title,
      createdAt: comment.createdAt,
    })),
    exportedAt: new Date(),
  };

  // Retourne le JSON avec les headers appropriés pour le téléchargement
  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="mes-donnees-${user.id}.json"`,
    },
  });
}
