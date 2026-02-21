// API admin de gestion des vidéos individuelles
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { videoSchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Récupération d'une vidéo
export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const video = await prisma.video.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!video) {
    return NextResponse.json({ error: "Vidéo introuvable" }, { status: 404 });
  }

  return NextResponse.json({ video });
}

// Mise à jour d'une vidéo
export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  const { id } = await params;

  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) {
    return NextResponse.json({ error: "Vidéo introuvable" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = videoSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const { tags, ...videoData } = parsed.data;

  const updated = await prisma.video.update({
    where: { id },
    data: {
      ...videoData,
      ...(tags !== undefined
        ? {
            tags: {
              set: [],
              connectOrCreate: tags.map((tagName) => ({
                where: { name: tagName },
                create: {
                  name: tagName,
                  slug: tagName.toLowerCase().replace(/\s+/g, "-"),
                },
              })),
            },
          }
        : {}),
    },
    include: { tags: true },
  });

  await prisma.activityLog.create({
    data: {
      action: "VIDEO_UPDATED",
      details: { videoId: id, title: updated.title },
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true, video: updated });
}

// Suppression d'une vidéo
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  const { id } = await params;

  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) {
    return NextResponse.json({ error: "Vidéo introuvable" }, { status: 404 });
  }

  await prisma.video.delete({ where: { id } });

  await prisma.activityLog.create({
    data: {
      action: "VIDEO_DELETED",
      details: { videoId: id, title: video.title },
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true });
}
