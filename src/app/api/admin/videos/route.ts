// API admin — création de vidéo
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { videoSchema } from "@/lib/validators";
import { generateSlug } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = videoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const { tags, ...videoData } = parsed.data;

  // Génération d'un slug unique
  let slug = generateSlug(videoData.title);
  let counter = 1;
  while (await prisma.video.findUnique({ where: { slug } })) {
    slug = `${generateSlug(videoData.title)}-${counter}`;
    counter++;
  }

  const video = await prisma.video.create({
    data: {
      ...videoData,
      slug,
      youtubeId: videoData.youtubeId || null,
      description: videoData.description || null,
      tags: {
        connectOrCreate: tags.map((tagName) => ({
          where: { name: tagName },
          create: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, "-"),
          },
        })),
      },
    },
    include: { tags: true },
  });

  await prisma.activityLog.create({
    data: {
      action: "VIDEO_CREATED",
      details: { videoId: video.id, title: video.title },
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true, video }, { status: 201 });
}
