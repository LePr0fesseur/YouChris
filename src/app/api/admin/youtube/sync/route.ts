// API de synchronisation YouTube (admin uniquement)
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { syncYouTubeVideos } from "@/lib/youtube";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Accès non autorisé" },
      { status: 403 }
    );
  }

  try {
    const report = await syncYouTubeVideos();

    // Log de l'action admin
    await prisma.activityLog.create({
      data: {
        action: "YOUTUBE_SYNC",
        details: report as unknown as import("@prisma/client").Prisma.InputJsonValue,
        userId: session.user.id,
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          "unknown",
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Erreur synchronisation YouTube:", error);
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: `Échec de la synchronisation: ${message}` },
      { status: 500 }
    );
  }
}
