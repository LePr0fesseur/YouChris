// Page d'accueil principale — route "/"
import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VideoGrid, VideoGridSkeleton } from "@/components/videos/VideoGrid";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/gdpr/CookieBanner";
import { Shield, Zap, Lock, ArrowRight, Play, Crown } from "lucide-react";
import type { Metadata } from "next";
import type { VideoCard } from "@/types";

export const metadata: Metadata = {
  title: "Les Vidéos de Chris — Cybersécurité, Hardware & Tech",
};

export const revalidate = 3600;

async function getLatestVideos(): Promise<VideoCard[]> {
  const videos = await prisma.video.findMany({
    where: { status: { in: ["PUBLIC", "PREMIUM"] } },
    include: { tags: true },
    orderBy: { publishedAt: "desc" },
    take: 6,
  });
  return videos.map((v) => ({ ...v, publishedAt: v.publishedAt }));
}

async function getPopularVideos(): Promise<VideoCard[]> {
  const videos = await prisma.video.findMany({
    where: { status: { in: ["PUBLIC", "PREMIUM"] } },
    include: { tags: true },
    orderBy: { views: "desc" },
    take: 3,
  });
  return videos.map((v) => ({ ...v, publishedAt: v.publishedAt }));
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.3), transparent)",
        }}
        aria-hidden="true"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-sm text-[var(--accent)]">
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
            Cybersécurité • Hardware • Tech • Gaming
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="text-[var(--foreground)]">Les Vidéos</span>{" "}
            <span className="gradient-text">de Chris</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
            Plongez dans l&apos;univers tech avec des vidéos sur la
            cybersécurité, le hardware, les tutoriels et le gaming. Contenu
            exclusif pour les membres premium.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href="/videos">
                <Play className="w-4 h-4" aria-hidden="true" />
                Voir toutes les vidéos
              </Link>
            </Button>
            <Button variant="premium" size="lg" asChild>
              <Link href="/premium">
                <Crown className="w-4 h-4" aria-hidden="true" />
                Devenir Premium
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Cybersécurité",
      description:
        "Tutoriels pratiques, analyses de vulnérabilités, CTF writeups et actualités sécurité.",
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
    },
    {
      icon: Zap,
      title: "Hardware & Tech",
      description:
        "Reviews de composants, benchmarks, overclocking et tout ce qui concerne le matériel.",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
    {
      icon: Lock,
      title: "Contenu Exclusif",
      description:
        "Tutoriels approfondis, labs pratiques et vidéos inédites réservées aux membres premium.",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="glass rounded-xl p-6 hover:border-[var(--accent)]/30 transition-colors"
          >
            <div
              className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}
            >
              <feature.icon
                className={`w-5 h-5 ${feature.color}`}
                aria-hidden="true"
              />
            </div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

async function LatestVideos() {
  const videos = await getLatestVideos();
  return (
    <VideoGrid
      videos={videos}
      emptyMessage="Les vidéos seront bientôt disponibles. Revenez vite !"
    />
  );
}

async function PopularVideos() {
  const videos = await getPopularVideos();
  return (
    <VideoGrid
      videos={videos}
      emptyMessage="Aucune vidéo populaire pour l'instant."
    />
  );
}

function PremiumTeaser() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 to-[var(--surface)] border border-[var(--accent)]/30 p-8 sm:p-12">
        <div
          className="absolute top-0 right-0 w-96 h-96 opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-amber-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-amber-400">
              Contenu Premium
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-4">
            Accédez au contenu exclusif
          </h2>
          <p className="text-[var(--muted)] mb-8 max-w-xl">
            Rejoignez les membres premium et accédez à des tutoriels avancés,
            des labs de cybersécurité pratiques, et des vidéos exclusives.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {[
              "Labs de cybersécurité pratiques",
              "Tutoriels avancés en profondeur",
              "Vidéos exclusives & bonus",
              "Accès à la section commentaires",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm text-[var(--foreground)]"
              >
                <div className="w-4 h-4 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/40 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                </div>
                {item}
              </div>
            ))}
          </div>
          <Button variant="premium" size="lg" asChild>
            <Link href="/premium">
              Découvrir Premium
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              Dernières vidéos
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/videos" className="flex items-center gap-1">
                Voir tout <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <Suspense fallback={<VideoGridSkeleton count={6} />}>
            <LatestVideos />
          </Suspense>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8">
            Les plus populaires
          </h2>
          <Suspense fallback={<VideoGridSkeleton count={3} />}>
            <PopularVideos />
          </Suspense>
        </section>

        <PremiumTeaser />
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}
